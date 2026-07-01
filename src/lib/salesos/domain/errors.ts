/**
 * Domain Error Model — SPEC-01a §4
 *
 * All domain errors extend DomainError.
 * The API layer (SPEC-01b) maps these to ActionResult error codes.
 * Errors are recoverable: caller can retry after correcting input.
 */

export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
  readonly details?: Record<string, unknown>;
}

// ─── Validation Error ───
// Input format error (missing field, wrong type, invalid value).

export class ValidationError extends Error implements DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly recoverable = true;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "ValidationError";
  }
}

// ─── Business Rule Error ───
// Domain invariant violated (reviewer == owner, closed deal update).

export class BusinessRuleError extends Error implements DomainError {
  readonly code = "BUSINESS_RULE_FAILED";
  readonly recoverable = true;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

// ─── Governance Blocked Error ───
// Workflow guard blocked (insufficient evidence, missing approval).

export class GovernanceBlockedError extends Error implements DomainError {
  readonly code = "GOVERNANCE_BLOCKED";
  readonly recoverable = true;

  constructor(
    message: string,
    public readonly guardType: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "GovernanceBlockedError";
  }
}

// ─── Concurrency Error ───
// Aggregate version mismatch.

export class ConcurrencyError extends Error implements DomainError {
  readonly code = "CONFLICT";
  readonly recoverable = true;

  constructor(
    message: string,
    public readonly expectedVersion: number,
    public readonly actualVersion: number,
  ) {
    super(message);
    this.name = "ConcurrencyError";
  }
}

// ─── Not Found Error ───
// Aggregate does not exist or inaccessible.

export class NotFoundError extends Error implements DomainError {
  readonly code = "NOT_FOUND";
  readonly recoverable = false;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = "NotFoundError";
  }
}
