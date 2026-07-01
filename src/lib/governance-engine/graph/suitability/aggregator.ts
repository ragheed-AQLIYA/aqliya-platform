// ENG-001E: Suitability Aggregator
//
// Combines all 4 dimensions into a single SuitabilityResult.
// SR-01: Reads ONLY ValidationSummary + GraphStatistics + ReadinessResult.
//
// Pure function — no I/O, no mutation, no side effects.

import type { SuitabilityResult, SuitabilityInput, ArchitecturalFit } from './suitability-types';
import { SUITABILITY_WEIGHTS } from './suitability-types';
import { scoreTopology } from './topology-dimension';
import { scoreTraversal } from './traversal-dimension';
import { scoreComplexity } from './complexity-dimension';
import { scoreGovernance } from './governance-dimension';

/**
 * Architectural Fit thresholds based on overallScore (0–100).
 * Externalized for reviewability and testability.
 */
const FIT_THRESHOLDS = {
  HIGH: 65,
  MEDIUM: 35,
} as const;

/**
 * Compute the overall architectural fit from weighted score.
 */
function determineFit(overallScore: number): ArchitecturalFit {
  if (overallScore >= FIT_THRESHOLDS.HIGH) return 'HIGH';
  if (overallScore >= FIT_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build the overall human-readable explanation.
 */
function buildOverallExplanation(
  overallScore: number,
  fit: ArchitecturalFit,
  dimensionScores: SuitabilityResult['dimensions'],
): string {
  const dims = [
    { label: 'Topology', score: dimensionScores.topology.score },
    { label: 'Traversal', score: dimensionScores.traversal.score },
    { label: 'Complexity', score: dimensionScores.complexity.score },
    { label: 'Governance', score: dimensionScores.governance.score },
  ];

  const strongest = [...dims].sort((a, b) => b.score - a.score)[0];

  const fitDescription: Record<ArchitecturalFit, string> = {
    LOW: 'Graph-capable architecture is not strongly justified by current characteristics.',
    MEDIUM: 'Graph-capable architecture may be beneficial; further analysis is recommended.',
    HIGH: 'Current characteristics strongly justify graph-capable architecture.',
  };

  const lines: string[] = [
    `Architectural Fit: ${fit}`,
    `Overall Score: ${overallScore} / 100`,
    '',
    fitDescription[fit],
    '',
    'Dimension breakdown:',
    ...dims.map(
      (d) => `  - ${d.label}: ${d.score}/100 (weighted: ${(d.score / 100) * SUITABILITY_WEIGHTS[d.label.toLowerCase() as keyof typeof SUITABILITY_WEIGHTS]})`,
    ),
    '',
    `Strongest dimension: ${strongest.label} (${strongest.score}/100)`,
    '',
    'Note: This assessment evaluates architectural characteristics only.',
    'It does NOT recommend specific technologies, databases, or products.',
    'Technology recommendations are produced by the Decision Framework (ENG-001F).',
  ];

  return lines.join('\n');
}

/**
 * Compute the Suitability assessment from governance inputs.
 *
 * Input:  ValidationSummary + GraphStatistics + ReadinessResult (SR-01)
 * Output: SuitabilityResult with per-dimension breakdown and
 *         qualitative architectural fit assessment.
 *
 * Deterministic: same inputs → same result.
 * Explainable: every point attributable to measurable inputs (SR-03).
 * No technology references: uses only architectural terms (SR-01, SR-02).
 */
export function computeSuitability(input: SuitabilityInput): SuitabilityResult {
  const { validationSummary, graphStatistics, readinessResult } = input;

  // Calculate each dimension independently
  const topology = scoreTopology(graphStatistics);
  const traversal = scoreTraversal(graphStatistics);
  const complexity = scoreComplexity(graphStatistics);
  const governance = scoreGovernance(validationSummary, readinessResult);

  // Weighted sum: (score / 100) * weight for each dimension
  const overallScore =
    (topology.score / 100) * topology.weight +
    (traversal.score / 100) * traversal.weight +
    (complexity.score / 100) * complexity.weight +
    (governance.score / 100) * governance.weight;

  const roundedOverall = Math.round(overallScore * 100) / 100;
  const architecturalFit = determineFit(roundedOverall);
  const explanation = buildOverallExplanation(roundedOverall, architecturalFit, {
    topology,
    traversal,
    complexity,
    governance,
  });

  return {
    overallScore: roundedOverall,
    dimensions: {
      topology,
      traversal,
      complexity,
      governance,
    },
    architecturalFit,
    explanation,
    sources: {
      readinessScore: readinessResult.overallScore,
      graphNodeCount: graphStatistics.topology.nodeCount,
    },
    version: '1.0',
  };
}
