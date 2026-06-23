import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Mulai seeding database...\n");

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@coffeeshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@coffeeshop.com",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: "kasir@coffeeshop.com" },
    update: {},
    create: {
      name: "Kasir 1",
      email: "kasir@coffeeshop.com",
      password: await bcrypt.hash("kasir123", 12),
      role: "CASHIER",
    },
  });
  console.log(
    `✅ User admin (${admin.email}) & kasir (${cashier.email}) berhasil dibuat`,
  );

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun yang tersedia:");
  console.log("   Admin  → admin@coffeeshop.com  | password: admin123");
  console.log("   Kasir  → kasir@coffeeshop.com  | password: kasir123");
  console.log("\n💡 Meja & Menu kosong — tambahkan via API (admin only)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
