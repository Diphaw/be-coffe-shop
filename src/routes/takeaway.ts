import { Router } from "express";
import { TakeawayController } from "../controllers/takeaway.controller";
import { optionalAuthenticate } from "../middleware/auth";

// ─── Takeaway Routes ──────────────────────────────────────────────────────────

const router = Router();

/**
 * POST /api/takeaway
 * Akses: Publik / Opsional Terautentikasi
 * Deskripsi: Membuat pesanan Takeaway baru (tidak memerlukan/mengabaikan tableId)
 */
router.post("/", optionalAuthenticate, TakeawayController.create);

export default router;
