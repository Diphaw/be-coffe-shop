import { z } from "zod";
import { MenuCategory } from "../types";

// ─── Menu Schema ──────────────────────────────────────────────────────────────

export const createMenuSchema = z.object({
  name: z.string().min(1, "Nama menu wajib diisi"),
  description: z.string().optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  category: z.nativeEnum(MenuCategory),
  imageUrl: z.string().url("Format URL gambar tidak valid").optional(),
  isAvailable: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
});

export const updateMenuSchema = createMenuSchema.partial();

/** Tipe input setelah Zod parsing (default values sudah teraplikasi) */
export type CreateMenuDto = z.output<typeof createMenuSchema>;
export type UpdateMenuDto = z.infer<typeof updateMenuSchema>;
