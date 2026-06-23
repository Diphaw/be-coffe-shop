import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AuthRequest, JwtPayload, Role } from "../types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Akses ditolak. Token tidak ditemukan." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User tidak ditemukan. Silakan login kembali.",
      });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token tidak valid atau sudah kadaluarsa." });
  }
};

export const optionalAuthenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (user) {
        req.user = decoded;
      }
    } catch {
      // ignore
    }
  }

  next();
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin.`,
      });
      return;
    }

    next();
  };
};
