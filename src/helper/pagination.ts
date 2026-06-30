import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parses page and limit parameters from request query.
 * Falls back to page=1 and a default limit if invalid.
 */
export function parsePagination(req: Request, defaultLimit = 10): PaginationParams {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);

  const validPage = isNaN(page) || page < 1 ? 1 : page;
  const validLimit = isNaN(limit) || limit < 1 ? defaultLimit : limit;

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
  };
}
