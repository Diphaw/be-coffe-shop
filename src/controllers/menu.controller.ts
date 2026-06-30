import { Request, Response } from "express";
import { MenuService } from "../service/menu.service";
import { parseBody } from "../helper/parseBody";
import { createMenuSchema, updateMenuSchema } from "../validation/menu.validation";
import { ApiResponse } from "../types";
import { parsePagination } from "../helper/pagination";

// ─── Menu Controller ──────────────────────────────────────────────────────────

export class MenuController {
  /** GET /api/menu — Daftar menu (publik, bisa diakses customer via QR) */
  static async getAll(req: Request, res: Response): Promise<void> {
    const { page, limit, skip } = parsePagination(req);
    const { category, available, search } = req.query;

    const { data, meta } = await MenuService.getAll({
      category: category as string,
      available: available as string,
      search: search as string,
      page,
      limit,
      skip,
    });

    res.json({
      success: true,
      message: "OK",
      data,
      meta,
    } satisfies ApiResponse);
  }

  /** GET /api/menu/:id — Detail satu menu (publik) */
  static async getById(req: Request, res: Response): Promise<void> {
    const item = await MenuService.getById(String(req.params.id));
    res.json({ success: true, message: "OK", data: item } satisfies ApiResponse);
  }

  /** POST /api/menu — Tambah menu baru (admin only) */
  static async create(req: Request, res: Response): Promise<void> {
    const dto = parseBody(createMenuSchema, req.body);
    const item = await MenuService.create(dto);

    res.status(201).json({
      success: true,
      message: "Menu berhasil ditambahkan",
      data: item,
    } satisfies ApiResponse);
  }

  /** PATCH /api/menu/:id — Update menu (admin only) */
  static async update(req: Request, res: Response): Promise<void> {
    const dto = parseBody(updateMenuSchema, req.body);
    const item = await MenuService.update(String(req.params.id), dto);

    res.json({
      success: true,
      message: "Menu berhasil diupdate",
      data: item,
    } satisfies ApiResponse);
  }

  /** DELETE /api/menu/:id — Hapus menu (admin only) */
  static async delete(req: Request, res: Response): Promise<void> {
    await MenuService.delete(String(req.params.id));
    res.json({ success: true, message: "Menu berhasil dihapus" } satisfies ApiResponse);
  }

  /** PATCH /api/menu/:id/toggle — Toggle ketersediaan menu (admin & kasir) */
  static async toggleAvailability(req: Request, res: Response): Promise<void> {
    const item = await MenuService.toggleAvailability(String(req.params.id));

    res.json({
      success: true,
      message: `Menu ${item.isAvailable ? "diaktifkan" : "dinonaktifkan"}`,
      data: item,
    } satisfies ApiResponse);
  }
}
