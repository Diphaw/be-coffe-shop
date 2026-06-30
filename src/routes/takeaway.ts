import { Router } from "express";
import { TakeawayController } from "../controllers/takeaway.controller";
import { authenticate, authorize, optionalAuthenticate } from "../middleware/auth";

// ─── Takeaway Routes ──────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /api/takeaway
 * Akses: Admin, Cashier
 * Deskripsi: Mendapatkan daftar semua pesanan Takeaway (Admin & Cashier only)
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "CASHIER"),
  TakeawayController.getAll,
);

/**
 * POST /api/takeaway
 * Akses: Publik / Opsional Terautentikasi
 * Deskripsi: Membuat pesanan Takeaway baru (tidak memerlukan/mengabaikan tableId)
 */
router.post("/", optionalAuthenticate, TakeawayController.create);

export default router;
