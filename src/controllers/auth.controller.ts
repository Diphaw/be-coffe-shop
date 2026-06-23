import { Request, Response } from "express";
import { AuthRequest } from "../types";
import { AuthService } from "../service/auth.service";
import { parseBody } from "../helper/parseBody";
import { registerSchema, loginSchema } from "../validation/auth.validation";
import { ApiResponse } from "../types";

// ─── Auth Controller (Loyalty Member) ────────────────────────────────────────

export class AuthController {
  /** POST /api/auth/register — Daftar sebagai loyalty member */
  static async register(req: Request, res: Response): Promise<void> {
    const dto = parseBody(registerSchema, req.body);
    const result = await AuthService.register(dto);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: result,
    } satisfies ApiResponse);
  }

  /** POST /api/auth/login — Login untuk member, kasir, dan admin */
  static async login(req: Request, res: Response): Promise<void> {
    const dto = parseBody(loginSchema, req.body);
    const result = await AuthService.login(dto);

    res.json({
      success: true,
      message: "Login berhasil",
      data: result,
    } satisfies ApiResponse);
  }

  /** GET /api/auth/me — Profil user yang sedang login */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const user = await AuthService.getProfile(req.user!.id);

    res.json({
      success: true,
      message: "OK",
      data: user,
    } satisfies ApiResponse);
  }

  /** DELETE /api/auth/users/:id — Hapus user (admin only) */
  static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    await AuthService.deleteUser(String(req.params.id), req.user!.id);

    res.json({
      success: true,
      message: "User berhasil dihapus",
    } satisfies ApiResponse);
  }
}
