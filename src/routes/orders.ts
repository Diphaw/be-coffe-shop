import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth";

// ─── Order Routes ─────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /api/orders
 * Akses: Admin, Cashier
 * Deskripsi: Mendapatkan daftar semua pesanan (Admin & Cashier only)
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "CASHIER"),
  OrderController.getAll,
);

/**
 * GET /api/orders/:id
 * Akses: Admin, Cashier
 * Deskripsi: Mendapatkan detail satu pesanan berdasarkan ID (Admin & Cashier only)
 */
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "CASHIER"),
  OrderController.getById,
);

/**
 * POST /api/orders
 * Akses: Publik / Opsional Terautentikasi
 * Deskripsi: Membuat pesanan Dine-In baru (wajib mengirimkan tableId)
 */
router.post("/", optionalAuthenticate, OrderController.create);

/**
 * PATCH /api/orders/:id/status
 * Akses: Admin, Cashier
 * Deskripsi: Memperbarui status pesanan berdasarkan ID (Admin & Cashier only)
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "CASHIER"),
  OrderController.updateStatus,
);

export default router;
