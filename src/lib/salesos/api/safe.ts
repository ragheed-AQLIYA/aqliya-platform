/**
 * safe() wrapper — SPEC-01b §1.2
 *
 * Universal error translator. Catches Domain Errors and maps them to
 * ActionResult error codes. This is the ONLY place where Domain → API
 * error mapping occurs. All Server Actions use this wrapper.
 *
 * Zero business logic lives in this function.
 */

import {
  ValidationError,
  BusinessRuleError,
  GovernanceBlockedError,
  ConcurrencyError,
  NotFoundError,
} from "../domain/errors";

// ─── ActionResult (SPEC-01b §1.1) ───

export type ErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_FAILED"
  | "GOVERNANCE_BLOCKED"
  | "CONFLICT";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode; correlationId?: string };

// ─── safe() wrapper ───

export async function safe<T>(
  fn: () => Promise<T>,
  correlationId?: string,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { ok: false, error: error.message, code: "NOT_FOUND", correlationId };
    }
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, code: "VALIDATION_ERROR", correlationId };
    }
    if (error instanceof BusinessRuleError) {
      return { ok: false, error: error.message, code: "BUSINESS_RULE_FAILED", correlationId };
    }
    if (error instanceof GovernanceBlockedError) {
      return {
        ok: false,
        error: error.message,
        code: "GOVERNANCE_BLOCKED",
        correlationId,
      };
    }
    if (error instanceof ConcurrencyError) {
      return { ok: false, error: error.message, code: "CONFLICT", correlationId };
    }

    // Access denied
    if (error instanceof Error && error.message.includes("Access denied")) {
      return { ok: false, error: error.message, code: "FORBIDDEN", correlationId };
    }

    // Unexpected error
    console.error("[OpportunityManagement API]", error);
    return { ok: false, error: "An unexpected error occurred", code: "FORBIDDEN", correlationId };
  }
}
