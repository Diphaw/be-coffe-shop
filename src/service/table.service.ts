import { OrderStatus, TableStatus } from "../types";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { CreateTableDto, UpdateTableDto } from "../validation/table.validation";

// ─── Table Service ────────────────────────────────────────────────────────────

const EXCLUDED_ORDER_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];

/** Membangun URL QR Code yang diarahkan ke halaman menu frontend pelanggan */
function buildQrUrl(tableId: string): string {
  const customerUrl = process.env.CUSTOMER_FRONTEND_URL ?? process.env.FRONTEND_URL ?? "http://localhost:5173";
  return `${customerUrl}/menu?table=${tableId}`;
}

export class TableService {
  static async getAll(status?: string) {
    return prisma.table.findMany({
      where: status ? { status: status as TableStatus } : {},
      orderBy: { number: "asc" },
      include: {
        orders: {
          where: { status: { notIn: EXCLUDED_ORDER_STATUSES } },
          select: { id: true, status: true, totalAmount: true },
        },
      },
    });
  }

  static async getById(id: string) {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { notIn: EXCLUDED_ORDER_STATUSES } },
          include: { orderItems: { include: { menuItem: true } } },
        },
      },
    });
    if (!table) throw AppError.notFound("Meja tidak ditemukan.");
    return table;
  }

  static async create(dto: CreateTableDto) {
    // Check if table number already exists
    if (dto.number !== undefined) {
      const existing = await prisma.table.findUnique({
        where: { number: dto.number },
      });
      if (existing) {
        throw AppError.conflict("Nomor meja sudah digunakan.");
      }
    }

    // 1. Buat meja terlebih dahulu untuk mendapatkan ID-nya
    const table = await prisma.table.create({
      data: {
        number: dto.number,
        capacity: dto.capacity,
      },
    });

    // 2. Update dengan QR Code URL berdasarkan ID yang baru dibuat
    return prisma.table.update({
      where: { id: table.id },
      data: { qrCode: buildQrUrl(table.id) },
    });
  }

  static async update(id: string, dto: UpdateTableDto) {
    await this.getById(id); // pastikan ada

    // Check if table number already exists for another table
    if (dto.number !== undefined) {
      const existing = await prisma.table.findUnique({
        where: { number: dto.number },
      });
      if (existing && existing.id !== id) {
        throw AppError.conflict("Nomor meja sudah digunakan.");
      }
    }

    return prisma.table.update({ where: { id }, data: dto });
  }

  static async delete(id: string) {
    await this.getById(id); // pastikan ada
    return prisma.table.delete({ where: { id } });
  }

  /**
   * Generate / refresh QR Code URL untuk suatu meja.
   * URL diarahkan ke halaman menu frontend dengan query param ?table=<id>.
   */
  static async generateQrCode(id: string) {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw AppError.notFound("Meja tidak ditemukan.");

    const qrUrl = buildQrUrl(table.id);
    await prisma.table.update({ where: { id }, data: { qrCode: qrUrl } });

    return { tableNumber: table.number, qrUrl };
  }
}
