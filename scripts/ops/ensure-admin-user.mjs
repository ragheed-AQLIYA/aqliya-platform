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

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(dbUrl) });

const DEMO_USERS = [
  { email: "admin@aqliya.com", password: "admin123", role: UserRole.ADMIN },
  { email: "sara@aqliya.com", password: "operator123", role: UserRole.OPERATOR },
  { email: "mohammad@aqliya.com", password: "viewer123", role: UserRole.VIEWER },
];

async function main() {
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

  for (const demo of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demo.password, 10);
    const existing = await prisma.user.findUnique({
      where: { email: demo.email },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { email: demo.email },
        data: { passwordHash, role: demo.role },
      });
      console.log(`Updated ${demo.email} → password reset (${demo.role})`);
    } else {
      await prisma.user.create({
        data: {
          email: demo.email,
          name: demo.email.split("@")[0],
          role: demo.role,
          organizationId: org.id,
          passwordHash,
        },
      });
      console.log(`Created ${demo.email} (${demo.role})`);
    }
  }

  console.log("Demo logins ready:");
  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.email} / ${demo.password}`);
  }
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
