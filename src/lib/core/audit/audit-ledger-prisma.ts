import type { AuditLedgerEntry } from "./types";

/** Prisma-backed audit ledger — fail-soft no-op until full Core wiring. */
export class PrismaAuditLedger {
  async write(_entry: AuditLedgerEntry): Promise<void> {
    // Dual-write scaffold — platform audit runtime handles persistence elsewhere.
  }
}
