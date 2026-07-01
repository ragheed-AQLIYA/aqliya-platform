// ENG-001B: Relationship Validator — Error Taxonomy
//
// Standardized error codes for all graph validation issues.
// Each code maps to exactly one type of violation.
//
// Error Code Ranges:
//   REF-0xx  — Reference integrity violations
//   CAR-0xx  — Cardinality violations
//   CHN-0xx  — Chain continuity violations
//   AUTH-0xx — Authority boundary violations
//   INT-0xx  — Integrity aggregation failures
//
// Architecture Baseline: M2 v1.2 (Frozen) / SPEC-GOV-11 §4.5
// Validator Purity: Pure functions only — no I/O, no CLI, no cache, no mutation.

/**
 * Standardized error codes for validation issues.
 */
export const VALIDATION_CODES = {
  // Reference violations (C01-C06)
  REF_MISSING_REFERENCE: 'REF-001' as const,
  REF_UNKNOWN_ENTITY: 'REF-002' as const,

  // Cardinality violations (C07-C12)
  CARD_VIOLATION: 'CAR-001' as const,
  CARD_DUPLICATE: 'CAR-002' as const,

  // Chain violations (C13-C16)
  CHAIN_BROKEN: 'CHN-001' as const,
  CHAIN_CIRCULAR: 'CHN-002' as const,

  // Authority violations (C17-C21)
  AUTH_UNKNOWN: 'AUTH-001' as const,
  AUTH_BOUNDARY: 'AUTH-002' as const,

  // Aggregation failures
  INTEGRITY_FAILURE: 'INT-001' as const,
} as const;

export type ValidationCode = (typeof VALIDATION_CODES)[keyof typeof VALIDATION_CODES];

/**
 * Severity levels for validation issues.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * A single validation issue found during relationship validation.
 * Pure data — no methods, no state, no I/O.
 */
export interface ValidationIssue {
  /** Standardized error code (e.g., REF-001, CAR-001) */
  code: ValidationCode;
  /** Human-readable description of the violation */
  message: string;
  /** Severity of the issue */
  severity: ValidationSeverity;
  /** The entity ID where the issue was found (e.g., CLM-AUDIT-0001) */
  entityId: string;
  /** The related M2 relationship ID (e.g., C01, C06) */
  relationshipId: string;
  /** Optional context providing additional details */
  context?: string;
  /** Optional reference to the target entity involved */
  targetId?: string;
}

/**
 * Summary of all validation results.
 * Produced by IntegrityAggregator from individual validator outputs.
 */
export interface ValidationSummary {
  /** ISO timestamp of validation */
  validatedAt: string;
  /** Total number of issues found */
  totalIssues: number;
  /** Count by severity */
  counts: {
    errors: number;
    warnings: number;
    infos: number;
  };
  /** Count by error code */
  byCode: Record<ValidationCode, number>;
  /** All issues found (sorted by severity then code) */
  issues: ValidationIssue[];
  /** Whether the registry passes all blocking validations */
  passed: boolean;
}
