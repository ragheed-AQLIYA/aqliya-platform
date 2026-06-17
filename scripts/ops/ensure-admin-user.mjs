#!/usr/bin/env node
/**
 * Ensure seed admin exists with known password (admin123).
 * Safe to run repeatedly — does not wipe other data.
 */
import { config } from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(process.cwd(), ".env") });

const ADMIN_EMAIL = "admin@aqliya.com";
const ADMIN_PASSWORD = "admin123";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(dbUrl) });

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, organizationId: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { passwordHash, role: UserRole.ADMIN },
    });
    console.log(`Updated password for ${ADMIN_EMAIL} (role: ADMIN)`);
    console.log(`Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    return;
  }

  let org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (!org) {
    const platformOrg = await prisma.platformOrganization.upsert({
      where: { slug: "aqliya-demo" },
      update: {},
      create: {
        slug: "aqliya-demo",
        name: "AQLIYA Demo",
        displayName: "AQLIYA Demo Organization",
      },
    });
    org = await prisma.organization.create({
      data: {
        name: "AQLIYA Demo Organization",
        platformOrganizationId: platformOrg.id,
      },
      select: { id: true, name: true },
    });
    console.log(`Created organization: ${org.name}`);
  }

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "Ahmed Al-Mansouri",
      role: UserRole.ADMIN,
      organizationId: org.id,
      passwordHash,
    },
  });

  console.log(`Created ${ADMIN_EMAIL} (ADMIN) in org ${org.name}`);
  console.log(`Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
