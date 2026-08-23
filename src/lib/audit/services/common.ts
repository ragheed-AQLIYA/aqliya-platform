import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "lib-audit-services-common" });

/**
 * Audit Services — shared utilities
 *
 * Database fallback wrapper, configuration, and types used across all
 * domain service modules.
 */

export type AuditAIActorContext = {
  userId?: string;
  userRole?: string;
};

export const USE_DATABASE = true;
export const ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK =
  process.env.AUDIT_ALLOW_MOCK_FALLBACK === "true";

export const delay = (ms = 30) => new Promise((r) => setTimeout(r, ms));

// ─── Mock Data Tracking ───
// Tracks whether any tryDb call has fallen back to mock data.
// This flag is surfaced to the UI so users know they are viewing
// fabricated demo data, not real customer records.

let _mockDataActive = false;

/**
 * Returns true if any tryDb call has fallen back to mock data
 * during the current process lifetime.
 */
export function isUsingMockData(): boolean {
  return _mockDataActive;
}

/**
 * Resets the mock data flag. Intended for testing only.
 */
export function _resetMockDataFlag(): void {
  _mockDataActive = false;
}

export async function getDb() {
  return import("../db");
}

export async function tryDb<T>(
  fallback: () => Promise<T>,
  dbFn: (db: typeof import("../db")) => Promise<T>,
  label = "protected AuditOS read",
): Promise<T> {
  if (USE_DATABASE) {
    try {
      const db = await getDb();
      return await dbFn(db);
    } catch (e) {
      if (!ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK) {
        const reason = e instanceof Error ? e.message : "unknown error";
        throw new Error(
          `[AuditServices] ${label} failed. Mock fallback is disabled for protected /audit workspace. ${reason}`,
        );
      }

      logger.warn(`[AuditServices] ${label} failed; explicit mock fallback enabled:`, { detail: e, });
      _mockDataActive = true;
    }
  }

  if (!ALLOW_PROTECTED_AUDIT_MOCK_FALLBACK) {
    throw new Error(
      `[AuditServices] ${label} unavailable. Mock fallback is disabled for protected /audit workspace.`,
    );
  }

  await delay();
  _mockDataActive = true;
  return fallback();
}

export async function prismaGlobal() {
  return import("@/lib/prisma").then((m) => m.prisma);
}
