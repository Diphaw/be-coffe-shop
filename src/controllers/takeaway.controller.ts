import { Request, Response } from "express";
import { TakeawayService } from "../service/takeaway.service";
import { parseBody } from "../helper/parseBody";
import { createTakeawaySchema } from "../validation/takeaway.validation";
import { AuthRequest, ApiResponse } from "../types";
import { parsePagination } from "../helper/pagination";

// ─── Takeaway Controller ──────────────────────────────────────────────────────

export class TakeawayController {
  /**
   * GET /api/takeaway — Mendapatkan daftar pesanan takeaway (admin & kasir).
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    const { page, limit, skip } = parsePagination(req);
    const { status } = req.query;

    const { data, meta } = await TakeawayService.getAll({
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

  /**
   * POST /api/takeaway — Buat order takeaway baru.
   * 
   * Tidak memerlukan/mengabaikan tableId.
   * Dapat diakses secara publik (guest) maupun oleh user terautentikasi (member).
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    const dto = parseBody(createTakeawaySchema, req.body);
    const order = await TakeawayService.create(dto, req.user?.id);

    res.status(201).json({
      success: true,
      message: "Order takeaway berhasil dibuat",
      data: order,
    } satisfies ApiResponse);
  }
}
