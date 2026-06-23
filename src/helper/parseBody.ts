import { ZodType } from "zod";
import { AppError } from "../lib/errors";

/**
 * Parse dan validasi request body menggunakan Zod schema.
 * Mengembalikan tipe output schema (setelah default values teraplikasi).
 * Melempar AppError 400 jika validasi gagal sehingga ditangkap oleh errorHandler global.
 */
export function parseBody<Output, Input = Output>(
  schema: ZodType<Output, any, Input>,
  body: unknown,
): Output {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    throw AppError.badRequest(message);
  }
  return result.data;
}
