import { OrderStatus, OrderType } from "../types";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { pusher, PUSHER_CHANNELS, PUSHER_EVENTS } from "../lib/pusher";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
} from "../validation/order.validation";

// ─── Order Service ────────────────────────────────────────────────────────────

export class OrderService {
  static async getAll(filters: { status?: string; tableId?: string }) {
    const { status, tableId } = filters;

    return prisma.order.findMany({
      where: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(tableId ? { tableId } : {}),
      },
      include: {
        table: { select: { number: true } },
        user: { select: { name: true, email: true } },
        orderItems: {
          include: { menuItem: { select: { name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { menuItem: true } },
      },
    });
    if (!order) throw AppError.notFound("Order tidak ditemukan.");
    return order;
  }

  /**
   * Buat order baru.
   *
   * Mendukung dua skenario:
   * 1. **Scan QR di meja** — customer scan QR, tidak perlu login.
   *    Body: { tableId, items[] }  →  userId = null (guest order)
   * 2. **Loyalty member** — customer yang sudah login (token JWT).
   *    userId akan diisi otomatis dari token.
   * 3. **Dibantu kasir** — kasir input order atas nama customer yang tidak bisa scan.
   *    Sama seperti skenario 1 tapi dilakukan oleh kasir yang sudah login.
   */
  static async create(dto: CreateOrderDto, userId?: string) {
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
      // Validasi dan tandai meja sebagai OCCUPIED bila ada tableId (DINE_IN)
      if (dto.tableId) {
        const table = await tx.table.findUnique({
          where: { id: dto.tableId },
        });

        if (!table) {
          throw AppError.notFound(
            `Meja dengan id '${dto.tableId}' tidak ditemukan.`,
          );
        }

        if (table.status === "OCCUPIED") {
          throw AppError.badRequest(
            `Meja nomor ${table.number} sedang digunakan.`,
          );
        }

        await tx.table.update({
          where: { id: dto.tableId },
          data: { status: "OCCUPIED" },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          type: dto.type,
          tableId: dto.tableId,
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
          table: { select: { number: true } },
          orderItems: { include: { menuItem: { select: { name: true } } } },
        },
      });

      return newOrder;
    });

    // Notifikasi real-time ke dapur & kasir via Pusher
    try {
      await pusher.trigger(PUSHER_CHANNELS.ORDERS, PUSHER_EVENTS.NEW_ORDER, {
        orderId: order.id,
        tableNumber: order.table?.number,
        totalItems: dto.items.length,
        totalAmount,
        createdAt: order.createdAt,
      });
    } catch (pusherErr) {
      console.warn("[Pusher] Gagal kirim notifikasi NEW_ORDER:", pusherErr);
    }

    return order;
  }

  /**
   * Update status order.
   * Jika status menjadi COMPLETED, meja dibebaskan kembali (AVAILABLE).
   */
  static async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { table: { select: { number: true } } },
    });

    if (
      (dto.status === "COMPLETED" || dto.status === "CANCELLED") &&
      order.tableId
    ) {
      // Cek apakah masih ada order aktif lainnya di meja yang sama
      const activeOrders = await prisma.order.findFirst({
        where: {
          tableId: order.tableId,
          id: { not: order.id },
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED"],
          },
        },
      });

      // Jika tidak ada order aktif lain, kosongkan meja
      if (!activeOrders) {
        await prisma.table.update({
          where: { id: order.tableId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    // Notifikasi real-time perubahan status
    try {
      await pusher.trigger(
        PUSHER_CHANNELS.ORDERS,
        PUSHER_EVENTS.ORDER_STATUS_UPDATED,
        {
          orderId: order.id,
          status: order.status,
          tableNumber: order.table?.number,
        },
      );
    } catch (pusherErr) {
      console.warn(
        "[Pusher] Gagal kirim notifikasi ORDER_STATUS_UPDATED:",
        pusherErr,
      );
    }

    return order;
  }
}
