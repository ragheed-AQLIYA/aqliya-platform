// ENG-001D: Explanation Builder
//
// Builds per-dimension human-readable explanations.
// RR-04 / DEC-2026-0029: Every point must be attributable.
//
// Pure function — no I/O, no mutation, no side effects.

/**
 * Input for building a dimension explanation.
 */
export interface ExplanationInput {
  /** Dimension label (e.g., "Integrity", "Completeness") */
  label: string;
  /** Final score (0–100) */
  score: number;
  /** Weight from READINESS_WEIGHTS */
  weight: number;
  /** Whether the dimension passes its core check */
  passed: boolean;
  /** List of detailed bullet points explaining contributions */
  details: string[];
  /** One-line summary */
  summary: string;
}

/**
 * Build a structured explanation for a single dimension.
 *
 * Format:
 *   {label}
 *   Score: {score} / 100 (weight: {weight}%)
 *   {summary}
 *   Details:
 *     - {detail}
 *     - {detail}
 *   Weighted contribution: {contribution} / {weight}
 */
export function buildExplanation(input: ExplanationInput): string {
  const { label, score, weight, summary, details } = input;
  const contribution = Math.round((score / 100) * weight * 100) / 100;

  const lines: string[] = [
    `${label}: ${score} / 100`,
    `Weight: ${weight}%`,
    '',
    summary,
  ];

  if (details.length > 0) {
    lines.push('', 'Contributors:');
    for (const detail of details) {
      lines.push(`  - ${detail}`);
    }
  }

  lines.push('', `Weighted contribution: ${contribution} / ${weight}`);

  return lines.join('\n');
}
