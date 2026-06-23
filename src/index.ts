import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from "./routes/auth";
import menuRoutes from "./routes/menu";
import orderRoutes from "./routes/orders";
import tableRoutes from "./routes/tables";
import takeawayRoutes from "./routes/takeaway";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "☕ Coffee Shop API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "healthy" });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/takeaway", takeawayRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n☕  Coffee Shop API`);
  console.log(`🚀  Server: http://localhost:${PORT}`);
  console.log(`📋  Env   : ${process.env.NODE_ENV ?? "development"}`);
  console.log(`\n📌  Endpoints:`);
  console.log(`   GET    /`);
  console.log(`\n   ── Auth ──────────────────────────────────────`);
  console.log(`   POST   /api/auth/register          → Daftar loyalty member`);
  console.log(`   POST   /api/auth/login             → Login (member / kasir / admin)`);
  console.log(`   GET    /api/auth/me                → Profil user (auth)`);
  console.log(`   DELETE /api/auth/users/:id         → Hapus user (admin)`);
  console.log(`\n   ── Menu ──────────────────────────────────────`);
  console.log(`   GET    /api/menu                   → Daftar menu (publik)`);
  console.log(`   GET    /api/menu/:id               → Detail menu (publik)`);
  console.log(`   POST   /api/menu                   → Tambah menu (admin)`);
  console.log(`   PATCH  /api/menu/:id               → Edit menu (admin)`);
  console.log(`   PATCH  /api/menu/:id/toggle        → Toggle ketersediaan (admin & kasir)`);
  console.log(`   DELETE /api/menu/:id               → Hapus menu (admin)`);
  console.log(`\n   ── Tables ────────────────────────────────────`);
  console.log(`   GET    /api/tables                 → Daftar semua meja (publik)`);
  console.log(`   GET    /api/tables/:id             → Detail meja & order aktif (publik)`);
  console.log(`   POST   /api/tables                 → Tambah meja (admin)`);
  console.log(`   PATCH  /api/tables/:id             → Edit meja (admin)`);
  console.log(`   DELETE /api/tables/:id             → Hapus meja (admin)`);
  console.log(`   GET    /api/tables/:id/qr          → Generate QR Code (admin)`);
  console.log(`\n   ── Orders ────────────────────────────────────`);
  console.log(`   POST   /api/orders                 → Buat order Dine-In`);
  console.log(`   PATCH  /api/orders/:id/status      → Update status order`);
  console.log(`\n   ── Takeaway ──────────────────────────────────`);
  console.log(`   POST   /api/takeaway               → Buat order Takeaway`);
});

export default app;
