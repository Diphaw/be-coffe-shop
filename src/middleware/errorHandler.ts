import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { ApiResponse } from "../types";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(`❌ [${err.name}] ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    } satisfies ApiResponse);
    return;
  }

  if ((err as any).code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Data sudah ada (duplicate entry).",
    } satisfies ApiResponse);
    return;
  }

  if ((err as any).code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Data tidak ditemukan.",
    } satisfies ApiResponse);
    return;
  }

  if ((err as any).code === "P2003") {
    res.status(409).json({
      success: false,
      message:
        "Data tidak dapat dihapus karena masih terhubung dengan transaksi atau data lain.",
    } satisfies ApiResponse);
    return;
  }

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  } satisfies ApiResponse);
};
