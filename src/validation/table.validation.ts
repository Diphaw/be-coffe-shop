import { z } from "zod";

// ─── Table ────────────────────────────────────────────────────────────────────

export const createTableSchema = z.object({
  number: z.number().int().positive("Nomor meja harus lebih dari 0"),
  capacity: z.number().int().positive("Kapasitas minimal 1").default(4),
});

export const updateTableSchema = createTableSchema.partial();

/** Tipe input setelah Zod parsing (default values sudah teraplikasi) */
export type CreateTableDto = z.output<typeof createTableSchema>;
export type UpdateTableDto = z.infer<typeof updateTableSchema>;
