import { z } from "zod";
import { OrderType } from "../types";
import { orderItemSchema } from "./order.validation";

// ─── Takeaway Validation ──────────────────────────────────────────────────────

// Skema untuk Bawa Pulang (Takeaway) - tidak membutuhkan tableId sama sekali
export const createTakeawaySchema = z.object({
  type: z.literal(OrderType.TAKE_AWAY).default(OrderType.TAKE_AWAY),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order harus berisi minimal 1 item"),
});

export type CreateTakeawayDto = z.infer<typeof createTakeawaySchema>;
