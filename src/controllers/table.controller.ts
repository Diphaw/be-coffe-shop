import { Request, Response } from "express";
import { TableService } from "../service/table.service";
import { parseBody } from "../helper/parseBody";
import { createTableSchema, updateTableSchema } from "../validation/table.validation";
import { ApiResponse } from "../types";
import { parsePagination } from "../helper/pagination";

// ─── Table Controller ─────────────────────────────────────────────────────────

export class TableController {
  /** GET /api/tables — Daftar semua meja (publik) */
  static async getAll(req: Request, res: Response): Promise<void> {
    const { page, limit, skip } = parsePagination(req);
    const { status } = req.query;

    const { data, meta } = await TableService.getAll({
      status: status as string | undefined,
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

  /** GET /api/tables/:id — Detail meja beserta order aktif (publik) */
  static async getById(req: Request, res: Response): Promise<void> {
    const table = await TableService.getById(String(req.params.id));
    res.json({ success: true, message: "OK", data: table } satisfies ApiResponse);
  }

  /** POST /api/tables — Tambah meja baru (admin only) */
  static async create(req: Request, res: Response): Promise<void> {
    const dto = parseBody(createTableSchema, req.body);
    const table = await TableService.create(dto);

    res.status(201).json({
      success: true,
      message: "Meja berhasil ditambahkan",
      data: table,
    } satisfies ApiResponse);
  }

  /** PATCH /api/tables/:id — Update data meja (admin only) */
  static async update(req: Request, res: Response): Promise<void> {
    const dto = parseBody(updateTableSchema, req.body);
    const table = await TableService.update(String(req.params.id), dto);

    res.json({
      success: true,
      message: "Meja berhasil diupdate",
      data: table,
    } satisfies ApiResponse);
  }

  /** DELETE /api/tables/:id — Hapus meja (admin only) */
  static async delete(req: Request, res: Response): Promise<void> {
    await TableService.delete(String(req.params.id));
    res.json({ success: true, message: "Meja berhasil dihapus" } satisfies ApiResponse);
  }

  /** GET /api/tables/:id/qr — Generate / refresh QR Code URL meja (admin only) */
  static async getQrCode(req: Request, res: Response): Promise<void> {
    const data = await TableService.generateQrCode(String(req.params.id));

    res.json({
      success: true,
      message: "QR code URL berhasil digenerate",
      data,
    } satisfies ApiResponse);
  }
}
