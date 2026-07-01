// ENG-001E: Suitability Engine — Data Contract
//
// Suitability evaluates architectural fit for graph-capable architecture.
// It does NOT recommend technologies, products, or migrations.
//
// SR-01 — Architectural Neutrality:
//   Suitability evaluates characteristics only, never products.
//
// SR-02 — No Technology References:
//   No database names, vendors, or products mentioned anywhere.
//
// SR-03 — Explainability:
//   Every point must be attributable to measurable inputs.
//
// SR-04 — No Metric Recalculation:
//   Density, degree, cycles, chains consumed as produced by ENG-001C.
//
// Pure types — no I/O, no mutation, no side effects.

import type { ValidationSummary } from '../validation/types/validation-issues';
import type { GraphStatistics } from '../statistics/types/statistics-types';
import type { ReadinessResult } from '../readiness/types/readiness-types';

// ---------------------------------------------------------------------------
// Suitability Dimensions
// ---------------------------------------------------------------------------

/**
 * A single Suitability dimension with explainable score.
 */
export interface SuitabilityDimension {
  /** Raw score for this dimension (0–100) */
  score: number;
  /** Weight from SUITABILITY_WEIGHTS */
  weight: number;
  /** Maximum possible weighted contribution = weight (when score=100) */
  maxScore: number;
  /** Human-readable explanation of what contributed to this score */
  explanation: string;
}

// ---------------------------------------------------------------------------
// Architectural Fit Enums
// ---------------------------------------------------------------------------

/**
 * Overall architectural fit assessment.
 *
 * - LOW:  Graph-capable architecture is not justified by current characteristics.
 * - MEDIUM: Graph-capable architecture may be beneficial; further analysis recommended.
 * - HIGH: Graph-capable architecture is well-justified by current characteristics.
 */
export type ArchitecturalFit = 'LOW' | 'MEDIUM' | 'HIGH';

// ---------------------------------------------------------------------------
// Weights
// ---------------------------------------------------------------------------

/**
 * Weights for each Suitability dimension.
 * Sum = 100.
 */
export const SUITABILITY_WEIGHTS = {
  /** Topological richness — entity and relationship scale */
  topology: 25,
  /** Traversal depth — multi-hop query needs */
  traversal: 25,
  /** Structural complexity — cycles, multiplicity, irregular patterns */
  complexity: 25,
  /** Governance fit — how much governance rigor demands graph capability */
  governance: 25,
} as const;

export type SuitabilityDimensionKey = keyof typeof SUITABILITY_WEIGHTS;

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/**
 * Sources that produced this Suitability result.
 * Enables traceability to upstream artifacts.
 */
export interface SuitabilitySources {
  /** Version identifier from ReadinessResult (overallScore as proxy) */
  readinessScore: number;
  /** Version identifier from GraphStatistics (nodeCount as proxy of version) */
  graphNodeCount: number;
}

// ---------------------------------------------------------------------------
// Complete Suitability Result
// ---------------------------------------------------------------------------

/**
 * Complete Suitability result.
 *
 * All 4 dimensions are independently calculated, explainable, and weighted.
 * The overallScore is the weighted sum of dimension scores.
 * architecturalFit provides the qualitative assessment.
 */
export interface SuitabilityResult {
  /** Weighted overall score (0–100) */
  overallScore: number;

  /** Per-dimension breakdown with explanations */
  dimensions: {
    topology: SuitabilityDimension;
    traversal: SuitabilityDimension;
    complexity: SuitabilityDimension;
    governance: SuitabilityDimension;
  };

  /** Qualitative assessment derived from overallScore */
  architecturalFit: ArchitecturalFit;

  /** Human-readable summary of the overall assessment */
  explanation: string;

  /** Provenance — which source versions produced this result */
  sources: SuitabilitySources;

  /** Contract version for future extensibility */
  version: '1.0';
}

// ---------------------------------------------------------------------------
// Compute Input
// ---------------------------------------------------------------------------

/**
 * The exact inputs consumed by the Suitability engine.
 * SR-01: ONLY these three inputs. No Markdown, no raw JSON, no registry.
 */
export interface SuitabilityInput {
  validationSummary: ValidationSummary;
  graphStatistics: GraphStatistics;
  readinessResult: ReadinessResult;
}
