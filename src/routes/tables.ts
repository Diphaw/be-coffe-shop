import { Router } from "express";
import { TableController } from "../controllers/table.controller";
import { authenticate, authorize } from "../middleware/auth";

// ─── Table Routes ─────────────────────────────────────────────────────────────

const router = Router();

/** GET /api/tables — Daftar semua meja (publik) */
router.get("/", TableController.getAll);

/** GET /api/tables/:id/qr — Generate QR Code URL meja (admin only) */
router.get(
  "/:id/qr",
  authenticate,
  authorize("ADMIN"),
  TableController.getQrCode,
);

/** GET /api/tables/:id — Detail meja & order aktif (publik) */
router.get("/:id", TableController.getById);

/** POST /api/tables — Tambah meja baru (admin only) */
router.post("/", authenticate, authorize("ADMIN"), TableController.create);

/** PATCH /api/tables/:id — Update data meja (admin only) */
router.patch("/:id", authenticate, authorize("ADMIN"), TableController.update);

/** DELETE /api/tables/:id — Hapus meja (admin only) */
router.delete("/:id", authenticate, authorize("ADMIN"), TableController.delete);

export default router;
