/**
 * Platform Utility: API Error Sanitization Tests
 *
 * Tests the sanitizeError(), sanitizeErrorResponse(), and httpStatusFromCode()
 * utilities from src/lib/platform/api-error.ts.
 *
 * These ensure that internal errors are never leaked to API consumers.
 */

import {
  sanitizeError,
  sanitizeErrorResponse,
  httpStatusFromCode,
} from "@/lib/platform/api-error";

describe("sanitizeError()", () => {
  // ─── Non-Error inputs ───
  it("returns generic error for non-Error inputs", () => {
    expect(sanitizeError(null)).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
    expect(sanitizeError(undefined)).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
    expect(sanitizeError("string error")).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
    expect(sanitizeError(42)).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
    expect(sanitizeError({})).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  });

  // ─── Known safe error messages (pass-through) ───
  it("maps Unauthenticated to authentication required", () => {
    const result = sanitizeError(new Error("Unauthenticated"));
    expect(result).toEqual({
      message: "Authentication required",
      code: "UNAUTHENTICATED",
    });
  });

  it("maps Access denied errors to forbidden", () => {
    const messages = [
      "Access denied: organization mismatch",
      "Access denied: ADMIN role required",
      "Access denied: insufficient clearance",
    ];
    for (const msg of messages) {
      const result = sanitizeError(new Error(msg));
      expect(result).toEqual({
        message: "Access denied",
        code: "FORBIDDEN",
      });
    }
  });

  it("maps MFA required error", () => {
    const result = sanitizeError(new Error("MFA required"));
    expect(result).toEqual({
      message: "MFA required",
      code: "MFA_REQUIRED",
    });
  });

  it("maps not found errors", () => {
    const result = sanitizeError(new Error("Resource not found"));
    expect(result).toEqual({
      message: "Resource not found",
      code: "NOT_FOUND",
    });
  });

  it("maps rate limit errors", () => {
    const result = sanitizeError(new Error("rate limit exceeded"));
    expect(result).toEqual({
      message: "Rate limit exceeded",
      code: "RATE_LIMITED",
    });
  });

  // ─── Database errors (never expose details) ───
  describe("database error sanitization", () => {
    const dbErrors = [
      "Prisma: Unique constraint failed",
      "P2002: Unique constraint violation",
      "Unique constraint failed on the fields: (`email`)",
      "Foreign key constraint failed",
      "connection refused to db.internal:5432",
      "ECONNREFUSED 127.0.0.1:5432",
    ];

    for (const msg of dbErrors) {
      it(`sanitizes: "${msg.substring(0, 40)}..."`, () => {
        const result = sanitizeError(new Error(msg));
        expect(result.message).toBe("Service temporarily unavailable");
        expect(result.code).toBe("SERVICE_UNAVAILABLE");
        // Must not leak internal details
        expect(result.message).not.toContain("Prisma");
        expect(result.message).not.toContain("5432");
        expect(result.message).not.toContain("db.internal");
      });
    }
  });

  // ─── File/storage errors (never expose paths) ───
  describe("storage error sanitization", () => {
    const storageErrors = [
      "ENOENT: no such file or directory '/var/data/secret.db'",
      "EACCES: permission denied '/uploads/restricted/file.pdf'",
      "storage provider initialization failed",
      "S3 bucket 'prod-evidence' access denied",
      "S3 bucket 'aqliya-backups' access timeout",
    ];

    for (const msg of storageErrors) {
      it(`sanitizes: "${msg.substring(0, 40)}..."`, () => {
        const result = sanitizeError(new Error(msg));
        expect(result.message).toBe("File operation failed");
        expect(result.code).toBe("STORAGE_ERROR");
        // Must not leak paths or bucket names
        expect(result.message).not.toContain("/var/data");
        expect(result.message).not.toContain("/uploads");
        expect(result.message).not.toContain("ENOENT");
      });
    }
  });

  // ─── AI provider errors (never expose API keys/endpoints) ───
  describe("AI error sanitization", () => {
    const aiErrors = [
      "API key is invalid: sk-abc123...",
      "quota exceeded for model gpt-4",
      "rate_limit hit for provider anthropic",
      "provider returned error",
    ];

    for (const msg of aiErrors) {
      it(`sanitizes: "${msg.substring(0, 40)}..."`, () => {
        const result = sanitizeError(new Error(msg));
        expect(result.message).toBe("AI service unavailable");
        expect(result.code).toBe("AI_UNAVAILABLE");
        // Must not leak API keys or provider details
        expect(result.message).not.toContain("sk-");
        expect(result.message).not.toContain("gpt-4");
        expect(result.message).not.toContain("anthropic");
      });
    }
  });

  // ─── Unknown errors ───
  it("returns generic error for unknown Error messages", () => {
    const result = sanitizeError(new Error("Something completely unexpected"));
    expect(result).toEqual({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  });
});

describe("sanitizeErrorResponse()", () => {
  it("wraps sanitized error in standard response format", () => {
    const response = sanitizeErrorResponse(new Error("Unauthenticated"));

    expect(response.success).toBe(false);
    expect(response.error.message).toBe("Authentication required");
    expect(response.error.code).toBe("UNAUTHENTICATED");
    expect(response.meta.timestamp).toBeDefined();
    // Timestamp should be a valid ISO string
    expect(new Date(response.meta.timestamp).toISOString()).toBe(
      response.meta.timestamp,
    );
  });

  it("never leaks Prisma errors in response format", () => {
    const response = sanitizeErrorResponse(
      new Error("Prisma: connection refused at db.internal:5432"),
    );

    expect(response.error.message).not.toContain("Prisma");
    expect(response.error.message).not.toContain("db.internal");
    expect(response.error.message).not.toContain("5432");
  });

  it("handles non-Error inputs", () => {
    const response = sanitizeErrorResponse(null);

    expect(response.success).toBe(false);
    expect(response.error.code).toBe("INTERNAL_ERROR");
  });
});

describe("httpStatusFromCode()", () => {
  it("maps UNAUTHENTICATED to 401", () => {
    expect(httpStatusFromCode("UNAUTHENTICATED")).toBe(401);
  });

  it("maps FORBIDDEN to 403", () => {
    expect(httpStatusFromCode("FORBIDDEN")).toBe(403);
  });

  it("maps NOT_FOUND to 404", () => {
    expect(httpStatusFromCode("NOT_FOUND")).toBe(404);
  });

  it("maps RATE_LIMITED to 429", () => {
    expect(httpStatusFromCode("RATE_LIMITED")).toBe(429);
  });

  it("maps SERVICE_UNAVAILABLE to 503", () => {
    expect(httpStatusFromCode("SERVICE_UNAVAILABLE")).toBe(503);
  });

  it("defaults unknown codes to 500", () => {
    expect(httpStatusFromCode("UNKNOWN_CODE")).toBe(500);
    expect(httpStatusFromCode("INTERNAL_ERROR")).toBe(500);
    expect(httpStatusFromCode("")).toBe(500);
  });

  it("maps STORAGE_ERROR to 500 (default)", () => {
    expect(httpStatusFromCode("STORAGE_ERROR")).toBe(500);
  });

  it("maps AI_UNAVAILABLE to 500 (default)", () => {
    expect(httpStatusFromCode("AI_UNAVAILABLE")).toBe(500);
  });

  it("maps MFA_REQUIRED to 500 (default, handled at middleware level)", () => {
    expect(httpStatusFromCode("MFA_REQUIRED")).toBe(500);
  });
});

