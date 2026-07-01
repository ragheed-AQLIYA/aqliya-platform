// ENG-001E: Governance Fit Dimension
//
// Measures how much the governance rigor observed in validation and
// readiness results justifies graph-capable architecture.
//
// Key insight:
//   - Governance with many issues, low integrity, and low traceability
//     indicates that the current representation is insufficient — graph
//     capability may help surface and resolve these gaps.
//   - Governance that already scores high may have less to gain from
//     architectural change, but the existing complexity still justifies it.
//
// SR-03: Every point attributable to ValidationSummary + ReadinessResult.
// SR-04: No metric recalculation.
//
// Pure function — no I/O, no mutation, no side effects.

import type { SuitabilityDimension } from './suitability-types';
import { SUITABILITY_WEIGHTS } from './suitability-types';
import type { ValidationSummary } from '../validation/types/validation-issues';
import type { ReadinessResult } from '../readiness/types/readiness-types';

/**
 * Score the governance fit dimension.
 *
 * Scoring rationale:
 *   - Validation issues: more issues → governance gaps → graph helps resolve.
 *   - Integrity score: low integrity → data quality problems → graph can improve.
 *   - Traceability score: low traceability → audit gaps → graph path traversal helps.
 *   - Overall readiness: low readiness → more room for architectural improvement.
 */
export function scoreGovernance(
  validationSummary: ValidationSummary,
  readinessResult: ReadinessResult,
): SuitabilityDimension {
  const weight = SUITABILITY_WEIGHTS.governance;
  const { integrity, traceability } = readinessResult.dimensions;
  const { overallScore: readinessOverall } = readinessResult;

  const details: string[] = [];
  let score = 0;

  // ------------------------------------------------------------------
  // Validation issue volume
  // ------------------------------------------------------------------
  if (validationSummary.totalIssues >= 20) {
    score += 30;
    details.push(`${validationSummary.totalIssues} validation issues (significant gaps: +30)`);
  } else if (validationSummary.totalIssues >= 10) {
    score += 25;
    details.push(`${validationSummary.totalIssues} validation issues (notable gaps: +25)`);
  } else if (validationSummary.totalIssues >= 5) {
    score += 20;
    details.push(`${validationSummary.totalIssues} validation issues (moderate gaps: +20)`);
  } else if (validationSummary.totalIssues > 0) {
    score += 10;
    details.push(`${validationSummary.totalIssues} validation issue(s) (+10)`);
  } else {
    details.push('No validation issues (clean governance: +0)');
  }

  // ------------------------------------------------------------------
  // Integrity score (from Readiness)
  // Low integrity → governance data quality problems
  // ------------------------------------------------------------------
  if (integrity.score < 40) {
    score += 25;
    details.push(`Integrity ${integrity.score}/100 (critical gaps: +25)`);
  } else if (integrity.score < 65) {
    score += 20;
    details.push(`Integrity ${integrity.score}/100 (notable gaps: +20)`);
  } else if (integrity.score < 85) {
    score += 10;
    details.push(`Integrity ${integrity.score}/100 (moderate gaps: +10)`);
  } else {
    details.push(`Integrity ${integrity.score}/100 (strong integrity: +0)`);
  }

  // ------------------------------------------------------------------
  // Traceability score (from Readiness)
  // Low traceability → graph path traversal helps close the gap
  // ------------------------------------------------------------------
  if (traceability.score < 40) {
    score += 25;
    details.push(`Traceability ${traceability.score}/100 (critical gaps: +25)`);
  } else if (traceability.score < 65) {
    score += 20;
    details.push(`Traceability ${traceability.score}/100 (notable gaps: +20)`);
  } else if (traceability.score < 85) {
    score += 10;
    details.push(`Traceability ${traceability.score}/100 (moderate gaps: +10)`);
  } else {
    details.push(`Traceability ${traceability.score}/100 (strong traceability: +0)`);
  }

  // ------------------------------------------------------------------
  // Overall readiness as context
  // Low overall readiness combined with issues → architectural improvement needed
  // ------------------------------------------------------------------
  if (readinessOverall < 40 && validationSummary.totalIssues > 0) {
    score += 20;
    details.push(`Overall readiness ${readinessOverall}/100 with issues: strong case for improvement (+20)`);
  } else if (readinessOverall < 60 && validationSummary.totalIssues > 0) {
    score += 10;
    details.push(`Overall readiness ${readinessOverall}/100 with issues: moderate case (+10)`);
  }

  const finalScore = Math.min(100, Math.max(0, score));

  const explanation = buildGovernanceExplanation(finalScore, weight, details);

  return {
    score: finalScore,
    weight,
    maxScore: weight,
    explanation,
  };
}

function buildGovernanceExplanation(
  score: number,
  weight: number,
  details: string[],
): string {
  const contribution = Math.round((score / 100) * weight * 100) / 100;

  const lines: string[] = [
    `Governance Fit: ${score} / 100`,
    `Weight: ${weight}%`,
    '',
    'Evaluates how governance gaps and readiness justify graph-capable architecture.',
    score >= 70
      ? 'Governance concerns strongly support graph-capable architecture.'
      : score >= 40
        ? 'Moderate governance justification — graph capability may improve governance workflows.'
        : 'Governance is healthy — graph capability driven by other dimensions.',
    '',
    'Contributors:',
    ...details.map((d) => `  - ${d}`),
    '',
    `Weighted contribution: ${contribution} / ${weight}`,
  ];

  return lines.join('\n');
}
