import { z } from "zod";
import { OrderStatus, OrderType } from "../types";

// ─── Order ────────────────────────────────────────────────────────────────────

// Item menu dalam pesanan
export const orderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().positive("Kuantitas minimal 1"),
  notes: z.string().optional(),
});

// Skema untuk Makan di Tempat (Dine In)
export const createOrderSchema = z.object({
  type: z.literal(OrderType.DINE_IN).default(OrderType.DINE_IN),
  tableId: z
    .string({
      required_error: "Nomor meja (tableId) wajib diisi untuk makan di tempat (DINE_IN)",
    })
    .min(1, "Nomor meja (tableId) wajib diisi untuk makan di tempat (DINE_IN)"),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order harus berisi minimal 1 item"),
});

// Update status pesanan
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// Tipe data terpadu untuk Service Layer
export interface CreateOrderDto {
  type: OrderType;
  tableId?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
}

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
