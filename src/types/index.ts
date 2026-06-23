import { Request } from "express";

// ─── Enums (Tanpa Ketergantungan Prisma) ──────────────────────────────────────

export const Role = {
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
  CUSTOMER: "CUSTOMER",
} as const;
export type Role = typeof Role[keyof typeof Role];

export const MenuCategory = {
  COFFEE: "COFFEE",
  NON_COFFEE: "NON_COFFEE",
  FOOD: "FOOD",
  SNACK: "SNACK",
  OTHER: "OTHER",
} as const;
export type MenuCategory = typeof MenuCategory[keyof typeof MenuCategory];

export const TableStatus = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
} as const;
export type TableStatus = typeof TableStatus[keyof typeof TableStatus];

export const OrderType = {
  DINE_IN: "DINE_IN",
  TAKE_AWAY: "TAKE_AWAY",
} as const;
export type OrderType = typeof OrderType[keyof typeof OrderType];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

// ─── Authenticated Request ────────────────────────────────────────────────────

/** Request yang sudah melewati middleware authenticate / optionalAuthenticate */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Standard API Response ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
