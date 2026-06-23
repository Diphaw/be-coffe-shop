import jwt from "jsonwebtoken";

// ─── Token Helper ─────────────────────────────────────────────────────────────

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET ?? "secret", {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) ?? "7d",
  });
}
