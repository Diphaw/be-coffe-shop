import { Request, Response } from "express";
import { OrderService } from "../service/order.service";
import { parseBody } from "../helper/parseBody";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation";
import { AuthRequest, ApiResponse } from "../types";

// ─── Order Controller ─────────────────────────────────────────────────────────

export class OrderController {
  /** GET /api/orders — Daftar semua order (admin & kasir) */
  static async getAll(req: Request, res: Response): Promise<void> {
    const orders = await OrderService.getAll({
      status: req.query.status as string | undefined,
      tableId: req.query.tableId as string | undefined,
    });
    res.json({ success: true, message: "OK", data: orders } satisfies ApiResponse);
  }

  /** GET /api/orders/:id — Detail order (admin & kasir) */
  static async getById(req: Request, res: Response): Promise<void> {
    const order = await OrderService.getById(String(req.params.id));
    res.json({ success: true, message: "OK", data: order } satisfies ApiResponse);
  }

  /**
   * POST /api/orders — Buat order baru (Dine-In)
   * Wajib mengirimkan tableId.
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    const dto = parseBody(createOrderSchema, req.body);
    const order = await OrderService.create(dto, req.user?.id);

    res.status(201).json({
      success: true,
      message: "Order dine-in berhasil dibuat",
      data: order,
    } satisfies ApiResponse);
  }

  /** PATCH /api/orders/:id/status — Update status order (admin & kasir) */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    const dto = parseBody(updateOrderStatusSchema, req.body);
    const order = await OrderService.updateStatus(String(req.params.id), dto);

    res.json({
      success: true,
      message: `Status order diubah ke '${order.status}'`,
      data: order,
    } satisfies ApiResponse);
  }
}
