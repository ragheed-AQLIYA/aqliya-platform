/**
 * Shared ActionResult utility for all Server Actions.
 *
 * Replaces the duplicated `ActionResult<T>` + `safe()` pattern found
 * across 15+ action files. Provides consistent error typing, optional
 * domain-error mapping, and correlation ID support.
 *
 * ## Usage
 *
 * ```ts
 * import { type ActionResult, safe, ok, fail } from "@/lib/platform/action-result";
 *
 * const result = await safe(async () => {
 *   return await prisma.thing.findMany({ where: { orgId } });
 * });
 * ```
 *
 * With domain error mapping:
 * ```ts
 * const result = await safe(async () => {
 *   return await someService();
 * }, {
 *   mapError: (error) => {
 *     if (error instanceof MyDomainError) return { code: "MY_CODE", message: error.message };
 *     return null; // fall through to default handling
 *   }
 * });
 * ```
 */

// ─── Error codes ───

export type ErrorCode =
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BUSINESS_RULE_FAILED"
  | "GOVERNANCE_BLOCKED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

// ─── Result types ───

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode; correlationId?: string };

// ─── Error mapper ───

export interface ErrorMapping {
  code: ErrorCode;
  message: string;
}

export type ErrorMapper = (error: unknown) => ErrorMapping | null;

// ─── Constructor helpers ───

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, code: ErrorCode = "INTERNAL_ERROR"): ActionResult<never> {
  return { ok: false, error, code };
}

// ─── Core safe() wrapper ───

export interface SafeOptions {
  /** Custom error mapper for domain-specific errors */
  mapError?: ErrorMapper;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Default error code when no mapping matches */
  defaultCode?: ErrorCode;
}

export async function safe<T>(
  fn: () => Promise<T>,
  options: SafeOptions = {},
): Promise<ActionResult<T>> {
  const { mapError, correlationId, defaultCode = "INTERNAL_ERROR" } = options;

  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    // 1. Try custom domain error mapper
    if (mapError) {
      const mapped = mapError(error);
      if (mapped) {
        return { ok: false, error: mapped.message, code: mapped.code, correlationId };
      }
    }

    // 2. Handle known error patterns
    if (error instanceof Error) {
      if (
        error.message.includes("Access denied") ||
        error.message.includes("Unauthorized") ||
        error.message.includes("FORBIDDEN")
      ) {
        return { ok: false, error: error.message, code: "FORBIDDEN", correlationId };
      }
      if (
        error.message.includes("not found") ||
        error.message.includes("NOT_FOUND") ||
        error.message.includes("does not exist")
      ) {
        return { ok: false, error: error.message, code: "NOT_FOUND", correlationId };
      }
      return { ok: false, error: error.message, code: defaultCode, correlationId };
    }

    // 3. Fallback for non-Error throws
    const message = typeof error === "string" ? error : "An unexpected error occurred";
    return { ok: false, error: message, code: defaultCode, correlationId };
  }
}
