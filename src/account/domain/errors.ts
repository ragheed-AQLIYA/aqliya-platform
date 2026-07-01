/**
 * Domain Error Model — reused from SPEC-01a §4 pattern
 */

export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
  readonly details?: Record<string, unknown>;
}

export class ValidationError extends Error implements DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly recoverable = true;
  constructor(message: string, public readonly details?: Record<string, unknown>) { super(message); this.name = "ValidationError"; }
}

export class BusinessRuleError extends Error implements DomainError {
  readonly code = "BUSINESS_RULE_FAILED";
  readonly recoverable = true;
  constructor(message: string, public readonly details?: Record<string, unknown>) { super(message); this.name = "BusinessRuleError"; }
}

export class ConcurrencyError extends Error implements DomainError {
  readonly code = "CONFLICT";
  readonly recoverable = true;
  constructor(message: string, public readonly expectedVersion: number, public readonly actualVersion: number) { super(message); this.name = "ConcurrencyError"; }
}

export class NotFoundError extends Error implements DomainError {
  readonly code = "NOT_FOUND";
  readonly recoverable = false;
  constructor(message: string, public readonly details?: Record<string, unknown>) { super(message); this.name = "NotFoundError"; }
}
