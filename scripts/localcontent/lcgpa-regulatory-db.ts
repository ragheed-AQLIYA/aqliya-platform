/**
 * LCGPA Regulatory Intelligence — database handle for CLI scripts.
 *
 * Two reasons this exists instead of importing `@/lib/prisma`:
 *
 *   1. `@/lib/prisma` imports `server-only`, which throws the moment it is
 *      loaded outside a Next.js server component. These scripts run under tsx,
 *      so that import kills the process before a single row is written.
 *   2. A dry run must work with no database at all — requiring DATABASE_URL to
 *      preview what WOULD happen defeats the point of a preview. The client is
 *      constructed only when the run actually reads or writes.
 *
 * The rest of the repo's scripts construct PrismaClient directly for the same
 * reason; this module just gives the regulatory scripts one place to do it.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let _db: PrismaClient | null = null;

/** Construct (once) and return the client. Throws if DATABASE_URL is unset. */
export function db(): PrismaClient {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. A committing run needs a database; re-run without --commit for a dry run."
      );
    }
    // Same driver adapter as src/lib/prisma.ts. Prisma 7 requires one.
    _db = new PrismaClient({ adapter: new PrismaPg(databaseUrl), log: ["error"] });
  }
  return _db;
}

/** Close the connection if one was ever opened. Safe to call after a dry run. */
export async function disconnect(): Promise<void> {
  if (_db) {
    await _db.$disconnect();
    _db = null;
  }
}
