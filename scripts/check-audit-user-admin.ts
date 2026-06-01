/** Quick check: admin@aqliya.com AuditUser row on current DATABASE_URL */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config();
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const u = await prisma.auditUser.findFirst({ where: { email: "admin@aqliya.com" } });
  console.log(u ? `FOUND ${u.id} role=${u.role} status=${u.status}` : "MISSING");
}

main()
  .finally(() => prisma.$disconnect());
