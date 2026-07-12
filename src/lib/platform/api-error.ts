// ─── API Error Sanitization ───
// Utility for safe error responses that never leak internal details.
// Use in API route catch blocks to ensure consistent, secure error handling.

/**
 * Sanitize an error for API response.
 * Returns a safe, generic message that never exposes:
 * - Database connection strings
 * - File system paths
 * - Internal service names
 * - Stack traces
 * - SQL/Prisma error details
 */
export function sanitizeError(error: unknown): {
  message: string;
  code: string;
} {
  if (!(error instanceof Error)) {
    return { message: "Internal server error", code: "INTERNAL_ERROR" };
  }

  const msg = error.message;

  // Known safe error messages — pass through as-is
  if (msg === "Unauthenticated") {
    return { message: "Authentication required", code: "UNAUTHENTICATED" };
  }
  if (msg.startsWith("Access denied")) {
    return { message: "Access denied", code: "FORBIDDEN" };
  }
  if (msg === "MFA required") {
    return { message: "MFA required", code: "MFA_REQUIRED" };
  }
  if (msg.includes("not found")) {
    return { message: "Resource not found", code: "NOT_FOUND" };
  }
  if (msg.includes("rate limit")) {
    return { message: "Rate limit exceeded", code: "RATE_LIMITED" };
  }

  // Database errors — never expose query details
  if (
    msg.includes("Prisma") ||
    msg.includes("P20") ||
    msg.includes("Unique constraint") ||
    msg.includes("Foreign key") ||
    msg.includes("connection") ||
    msg.includes("ECONNREFUSED")
  ) {
    return { message: "Service temporarily unavailable", code: "SERVICE_UNAVAILABLE" };
  }

  // File/storage errors — never expose paths
  if (
    msg.includes("ENOENT") ||
    msg.includes("EACCES") ||
    msg.includes("storage") ||
    msg.includes("S3") ||
    msg.includes("bucket")
  ) {
    return { message: "File operation failed", code: "STORAGE_ERROR" };
  }

  // AI provider errors — never expose API keys or endpoints
  if (
    msg.includes("API key") ||
    msg.includes("quota") ||
    msg.includes("rate_limit") ||
    msg.includes("provider")
  ) {
    return { message: "AI service unavailable", code: "AI_UNAVAILABLE" };
  }

  // Default: return generic message, log the real error server-side
  console.error("[API Error]", msg);
  return { message: "Internal server error", code: "INTERNAL_ERROR" };
}

/**
 * Create a sanitized error JSON response.
 * Usage in catch blocks:
 *   catch (error) {
 *     return NextResponse.json(sanitizeErrorResponse(error), { status: 500 });
 *   }
 */
export function sanitizeErrorResponse(error: unknown): {
  success: false;
  error: { message: string; code: string };
  meta: { timestamp: string };
} {
  const { message, code } = sanitizeError(error);
  return {
    success: false,
    error: { message, code },
    meta: { timestamp: new Date().toISOString() },
  };
}

/**
 * Get appropriate HTTP status code from a sanitized error code.
 */
export function httpStatusFromCode(code: string): number {
  switch (code) {
    case "UNAUTHENTICATED": return 401;
    case "FORBIDDEN": return 403;
    case "NOT_FOUND": return 404;
    case "RATE_LIMITED": return 429;
    case "SERVICE_UNAVAILABLE": return 503;
    default: return 500;
  }
}
