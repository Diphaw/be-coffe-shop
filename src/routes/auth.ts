import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, authorize } from "../middleware/auth";

// ─── Auth Routes (Loyalty Member) ─────────────────────────────────────────────

const router = Router();

/** POST /api/auth/register — Daftar akun loyalty member */
router.post("/register", AuthController.register);

/** POST /api/auth/login — Login untuk member, kasir, dan admin */
router.post("/login", AuthController.login);

/** GET /api/auth/me — Profil user yang sedang login */
router.get("/me", authenticate, AuthController.getProfile);

/** DELETE /api/auth/users/:id — Hapus user (admin only) */
router.delete(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  AuthController.deleteUser,
);

export default router;
