import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { AppError } from "../lib/errors";
import { generateToken } from "../helper/token";
import { RegisterDto, LoginDto } from "../validation/auth.validation";

// ─── Auth Service (Loyalty Member) ───────────────────────────────────────────

export class AuthService {
  /**
   * Registrasi member baru (Loyalty Member).
   * Role default: CUSTOMER.
   */
  static async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw AppError.conflict("Email sudah terdaftar.");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Login untuk semua role: CUSTOMER (loyalty member), CASHIER, ADMIN.
   */
  static async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw AppError.unauthorized("Email atau password salah.");
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw AppError.unauthorized("Email atau password salah.");
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _pw, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Ambil profil user yang sedang login.
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw AppError.notFound("User tidak ditemukan.");
    }

    return user;
  }

  /**
   * Hapus user berdasarkan ID (admin only).
   * Admin tidak bisa menghapus dirinya sendiri.
   */
  static async deleteUser(targetId: string, requesterId: string) {
    if (targetId === requesterId) {
      throw AppError.badRequest("Tidak bisa menghapus akun sendiri.");
    }

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) {
      throw AppError.notFound("User tidak ditemukan.");
    }

    await prisma.user.delete({ where: { id: targetId } });
  }
}
