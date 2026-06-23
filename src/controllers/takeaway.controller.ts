import { Response } from "express";
import { OrderService } from "../service/order.service";
import { parseBody } from "../helper/parseBody";
import { createTakeawaySchema } from "../validation/takeaway.validation";
import { AuthRequest, ApiResponse } from "../types";

// ─── Takeaway Controller ──────────────────────────────────────────────────────

export class TakeawayController {
  /**
   * POST /api/takeaway — Buat order takeaway baru.
   * Tidak memerlukan/mengabaikan tableId.
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    const dto = parseBody(createTakeawaySchema, req.body);
    const order = await OrderService.create(
      {
        type: dto.type,
        notes: dto.notes,
        items: dto.items,
        tableId: undefined, // order takeaway tidak menempati meja
      },
      req.user?.id,
    );

    res.status(201).json({
      success: true,
      message: "Order takeaway berhasil dibuat",
      data: order,
    } satisfies ApiResponse);
  }
}
