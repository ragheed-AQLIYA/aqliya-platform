/**
 * One-off: align _prisma_migrations with DB reality, then deploy remaining.
 * Resolves pending migrations whose objects already exist (db push drift).
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const migrationsDir = path.join("prisma", "migrations");
const allMigrations = fs
  .readdirSync(migrationsDir)
  .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
  .sort();

const { PrismaClient } = await import("@prisma/client");
const { PrismaPg } = await import("@prisma/adapter-pg");
const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const applied = await prisma.$queryRawUnsafe(
  `SELECT migration_name, finished_at FROM "_prisma_migrations"`,
);

const appliedSet = new Set(
  applied.filter((r) => r.finished_at).map((r) => r.migration_name),
);

const pending = allMigrations.filter((m) => !appliedSet.has(m));
console.log("Pending migrations:", pending.length);

for (const migration of pending) {
  const sqlPath = path.join(migrationsDir, migration, "migration.sql");
  if (!fs.existsSync(sqlPath)) continue;

  const sql = fs.readFileSync(sqlPath, "utf8");
  const createMatches = [...sql.matchAll(/CREATE TABLE "([^"]+)"/gi)];
  const tables = createMatches.map((m) => m[1]);

  if (tables.length === 0) {
    console.log(`→ deploy ${migration} (no CREATE TABLE)`);
    try {
      execSync(`npx prisma migrate deploy`, {
        stdio: "inherit",
        env: process.env,
      });
    } catch {
      console.log(`  deploy failed for ${migration}, trying resolve...`);
      execSync(
        `npx prisma migrate resolve --applied ${migration}`,
        { stdio: "inherit", env: process.env },
      );
    }
    continue;
  }

  const existing = await prisma.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename = ANY($1::text[])`,
    tables,
  );
  const existingSet = new Set(existing.map((r) => r.tablename));
  const allExist = tables.every((t) => existingSet.has(t));

  if (allExist) {
    console.log(`✓ resolve ${migration} (tables exist: ${tables.join(", ")})`);
    execSync(`npx prisma migrate resolve --applied ${migration}`, {
      stdio: "inherit",
      env: process.env,
    });
  } else {
    console.log(
      `→ deploy ${migration} (missing: ${tables.filter((t) => !existingSet.has(t)).join(", ")})`,
    );
    try {
      execSync(`npx prisma migrate deploy`, {
        stdio: "inherit",
        env: process.env,
      });
    } catch (e) {
      console.error(`Deploy stopped at ${migration}`);
      break;
    }
  }
}

await prisma.$disconnect();
console.log("\nFinal status:");
execSync("npx prisma migrate status", { stdio: "inherit", env: process.env });
