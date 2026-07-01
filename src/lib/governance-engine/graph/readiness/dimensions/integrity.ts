// ENG-001D: Integrity Dimension
//
// Measures data integrity based on validation errors.
// Weight: 30%
//
// Scoring:
//   Base: 100
//   Penalties per error code (by severity):
//     REF-001, REF-002:   -8 each (unresolved references)
//     CAR-001, CAR-002:  -10 each (cardinality violations)
//     CHN-001, CHN-002:  -15 each (chain breaks)
//     AUTH-001, AUTH-002: -10 each (authority boundary violations)
//     INT-001:            -50 each (aggregation integrity failure)
//   Floor: 0
//
// Pure function — no I/O, no mutation, no side effects.

import type { ReadinessDimension } from '../types/readiness-types';
import { READINESS_WEIGHTS } from '../types/readiness-types';
import type { ValidationCode, ValidationSummary } from '../../validation/types/validation-issues';
import { VALIDATION_CODES } from '../../validation/types/validation-issues';
import { buildExplanation } from '../explanation';

/** Penalty per error code */
const PENALTIES: Record<ValidationCode, number> = {
  [VALIDATION_CODES.REF_MISSING_REFERENCE]: 8,
  [VALIDATION_CODES.REF_UNKNOWN_ENTITY]: 8,
  [VALIDATION_CODES.CARD_VIOLATION]: 10,
  [VALIDATION_CODES.CARD_DUPLICATE]: 10,
  [VALIDATION_CODES.CHAIN_BROKEN]: 15,
  [VALIDATION_CODES.CHAIN_CIRCULAR]: 15,
  [VALIDATION_CODES.AUTH_UNKNOWN]: 10,
  [VALIDATION_CODES.AUTH_BOUNDARY]: 10,
  [VALIDATION_CODES.INTEGRITY_FAILURE]: 50,
};

export function calculateIntegrity(
  validationSummary: ValidationSummary,
): ReadinessDimension {
  const weight = READINESS_WEIGHTS.integrity;

  // Calculate total penalty
  let totalPenalty = 0;
  const details: string[] = [];

  for (const [code, penalty] of Object.entries(PENALTIES)) {
    const count = validationSummary.byCode[code as ValidationCode] || 0;
    if (count > 0) {
      const subPenalty = count * penalty;
      totalPenalty += subPenalty;
      details.push(`${count}x ${code} (-${subPenalty})`);
    }
  }

  const score = Math.max(0, 100 - totalPenalty);

  const explanation = buildExplanation({
    label: 'Integrity',
    score,
    weight,
    passed: validationSummary.passed,
    details: details.length > 0 ? details : ['No violations detected'],
    summary: validationSummary.passed
      ? 'All validations pass. No integrity issues.'
      : `${validationSummary.counts.errors} error(s), ${validationSummary.counts.warnings} warning(s) found.`,
  });

  return {
    score: Math.round(score * 100) / 100,
    weight,
    maxScore: weight,
    explanation,
  };
}
