import { Router } from "express";
import { MenuController } from "../controllers/menu.controller";
import { authenticate, authorize } from "../middleware/auth";

// ─── Menu Routes ──────────────────────────────────────────────────────────────

const router = Router();

/** GET /api/menu — Daftar menu (publik, diakses customer via QR maupun browser) */
router.get("/", MenuController.getAll);

/** GET /api/menu/:id — Detail menu (publik) */
router.get("/:id", MenuController.getById);

/** POST /api/menu — Tambah menu baru (admin only) */
router.post("/", authenticate, authorize("ADMIN"), MenuController.create);

/** PATCH /api/menu/:id/toggle — Toggle ketersediaan (admin & kasir) */
router.patch(
  "/:id/toggle",
  authenticate,
  authorize("ADMIN", "CASHIER"),
  MenuController.toggleAvailability,
);

/** PATCH /api/menu/:id — Update data menu (admin only) */
router.patch("/:id", authenticate, authorize("ADMIN"), MenuController.update);

/** DELETE /api/menu/:id — Hapus menu (admin only) */
router.delete("/:id", authenticate, authorize("ADMIN"), MenuController.delete);

export default router;
