import { MenuCategory } from "../types";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { CreateMenuDto, UpdateMenuDto } from "../validation/menu.validation";

// ─── Menu Service ─────────────────────────────────────────────────────────────

export class MenuService {
  static async getAll(filters: Record<string, string>) {
    const { category, available, search } = filters;

    return prisma.menuItem.findMany({
      where: {
        ...(category ? { category: category as MenuCategory } : {}),
        ...(available === "true" ? { isAvailable: true } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  static async getById(id: string) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw AppError.notFound("Menu tidak ditemukan.");
    return item;
  }

  static async create(dto: CreateMenuDto) {
    if (dto.name) {
      const existing = await prisma.menuItem.findFirst({
        where: { name: { equals: dto.name, mode: "insensitive" } },
      });
      if (existing) {
        throw AppError.conflict("Nama menu sudah digunakan.");
      }
    }
    return prisma.menuItem.create({ data: dto });
  }

  static async update(id: string, dto: UpdateMenuDto) {
    await this.getById(id); // pastikan ada
    if (dto.name) {
      const existing = await prisma.menuItem.findFirst({
        where: { name: { equals: dto.name, mode: "insensitive" } },
      });
      if (existing && existing.id !== id) {
        throw AppError.conflict("Nama menu sudah digunakan.");
      }
    }
    return prisma.menuItem.update({ where: { id }, data: dto });
  }

  static async delete(id: string) {
    await this.getById(id); // pastikan ada
    return prisma.menuItem.delete({ where: { id } });
  }

  static async toggleAvailability(id: string) {
    const current = await this.getById(id);
    return prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !current.isAvailable },
    });
  }
}
