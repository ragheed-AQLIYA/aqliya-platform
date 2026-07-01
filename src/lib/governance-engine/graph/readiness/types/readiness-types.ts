// ENG-001D: Readiness Score — Data Contract
//
// RR-01 — Readiness is Evidence-Based:
//   Readiness reads only ValidationSummary + GraphStatistics.
//   Does NOT read Markdown, raw JSON, registry, or graph directly.
//
// RR-02 — No Metric Recalculation:
//   Density, degree, cycles, components, longest chain are consumed
//   as produced by ENG-001C. Never recalculated.
//
// RR-03 — Deterministic Scoring:
//   Same inputs MUST always produce the same ReadinessScore.
//   No randomness, no time-dependence.
//
// RR-04 — Explainability (DEC-2026-0029):
//   Every point in the readiness score must be attributable to one
//   or more measurable contributors. No hidden scoring.
//
// Pure types — no I/O, no mutation, no side effects.

import type { ValidationSummary } from '../../validation/types/validation-issues';
import type { GraphStatistics } from '../../statistics/types/statistics-types';

// ---------------------------------------------------------------------------
// Readiness Weights
// ---------------------------------------------------------------------------

/**
 * Weights for each Readiness dimension.
 * Externalized for reviewability, testability, and policy changes.
 * Sum = 100.
 */
export const READINESS_WEIGHTS = {
  /** Data integrity — absence of validation errors */
  integrity: 30,
  /** Data completeness — coverage of expected relationships */
  completeness: 25,
  /** Graph connectivity — how well-connected the entity graph is */
  connectivity: 20,
  /** Evidence traceability — chain depth and audit trail quality */
  traceability: 25,
} as const;

export type ReadinessDimensionKey = keyof typeof READINESS_WEIGHTS;

// ---------------------------------------------------------------------------
// Per-Dimension Result
// ---------------------------------------------------------------------------

/**
 * A single Readiness dimension with explainable score.
 */
export interface ReadinessDimension {
  /** Raw score for this dimension (0–100) */
  score: number;
  /** Weight from READINESS_WEIGHTS */
  weight: number;
  /** Maximum possible weighted contribution = weight (when score=100) */
  maxScore: number;
  /** Human-readable explanation of what contributed to this score */
  explanation: string;
}

// ---------------------------------------------------------------------------
// Complete Readiness Result
// ---------------------------------------------------------------------------

/**
 * Sources that produced this Readiness result.
 * Enables traceability to specific versions of upstream artifacts.
 */
export interface ReadinessSources {
  /** Version identifier from ValidationSummary (validatedAt timestamp) */
  validationSummaryVersion: string;
  /** Version identifier from GraphStatistics (not yet versioned; uses '' for now) */
  graphStatisticsVersion: string;
}

/**
 * Complete Readiness Score result.
 *
 * All 4 dimensions are independently calculated, explainable, and weighted.
 * The overallScore is the weighted sum of dimension scores.
 */
export interface ReadinessResult {
  /** Weighted overall score (0–100, floating point precision) */
  overallScore: number;

  /** Per-dimension breakdown with explanations */
  dimensions: {
    integrity: ReadinessDimension;
    completeness: ReadinessDimension;
    connectivity: ReadinessDimension;
    traceability: ReadinessDimension;
  };

  /** Provenance — which source versions produced this result */
  sources: ReadinessSources;

  /** Contract version for future extensibility */
  version: '1.0';
}

// ---------------------------------------------------------------------------
// Compute Input
// ---------------------------------------------------------------------------

/**
 * The exact inputs consumed by the Readiness engine.
 * RR-01: ONLY these two inputs. No Markdown, no raw JSON, no registry.
 */
export interface ReadinessInput {
  validationSummary: ValidationSummary;
  graphStatistics: GraphStatistics;
}
