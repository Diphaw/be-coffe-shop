import { OrderStatus, OrderType } from "../types";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { pusher, PUSHER_CHANNELS, PUSHER_EVENTS } from "../lib/pusher";
import { CreateTakeawayDto } from "../validation/takeaway.validation";

// ─── Takeaway Service ──────────────────────────────────────────────────────────

export class TakeawayService {
  /**
   * Mendapatkan daftar semua pesanan Takeaway (ter-paginasi).
   */
  static async getAll(
    filters: { status?: string } & {
      page: number;
      limit: number;
      skip: number;
    },
  ) {
    const { status, page, limit, skip } = filters;

    const where = {
      type: OrderType.TAKE_AWAY,
      ...(status ? { status: status as OrderStatus } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: {
            include: { menuItem: { select: { name: true, imageUrl: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buat order takeaway baru.
   *
   * Mendukung dua skenario:
   * 1. **Guest Order** — pelanggan memesan tanpa login (lewat web/app).
   *    Body: { items[] }  →  userId = null (guest order)
   * 2. **Loyalty Member** — pelanggan memesan dengan akun (token JWT).
   *    userId otomatis terisi dari token.
   */
  static async create(dto: CreateTakeawayDto, userId?: string) {
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    // Validasi: semua item ada & tersedia
    for (const item of dto.items) {
      const menu = menuItems.find((m) => m.id === item.menuItemId);
      if (!menu) {
        throw AppError.notFound(
          `Menu dengan id '${item.menuItemId}' tidak ditemukan.`,
        );
      }
      if (!menu.isAvailable) {
        throw AppError.badRequest(`'${menu.name}' sedang tidak tersedia.`);
      }
    }

    const totalAmount = dto.items.reduce((sum, item) => {
      const menu = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + Number(menu.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          type: OrderType.TAKE_AWAY,
          tableId: null, // order takeaway tidak menempati meja
          userId: userId ?? null,
          notes: dto.notes,
          totalAmount,
          orderItems: {
            create: dto.items.map((item) => {
              const menu = menuItems.find((m) => m.id === item.menuItemId)!;
              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: menu.price,
                notes: item.notes,
              };
            }),
          },
        },
        include: {
          orderItems: { include: { menuItem: { select: { name: true } } } },
        },
      });

      return newOrder;
    });

    // Notifikasi real-time ke dapur & kasir via Pusher
    try {
      await pusher.trigger(PUSHER_CHANNELS.ORDERS, PUSHER_EVENTS.NEW_ORDER, {
        orderId: order.id,
        tableNumber: undefined,
        totalItems: dto.items.length,
        totalAmount,
        createdAt: order.createdAt,
      });
    } catch (pusherErr) {
      console.warn("[Pusher] Gagal kirim notifikasi NEW_ORDER untuk takeaway:", pusherErr);
    }

    return order;
  }
}
