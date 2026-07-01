// DEC-2026-0030: Pipeline Orchestration Separation
// DEC-2026-0032: Pipeline Provenance
// DEC-2026-0033: Pipeline Stage Contract
//
// Every pipeline stage returns the SAME canonical contract (PipelineStageResult<T>).
// No stage-specific wrapper objects. This ensures all engines (present and future)
// follow an identical pattern.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationSummary } from '../validation/types/validation-issues';
import type { GraphStatistics } from '../statistics/types/statistics-types';
import type { ReadinessResult } from '../readiness/types/readiness-types';

// ---------------------------------------------------------------------------
// Pipeline Stage Enum
// ---------------------------------------------------------------------------

/**
 * Canonical stage identifiers.
 * Using enum instead of magic strings (per architectural guidance).
 */
export enum PipelineStage {
  EXTRACTOR = 'extractor',
  VALIDATOR = 'validator',
  STATISTICS = 'statistics',
  READINESS = 'readiness',
  SUITABILITY = 'suitability',
  DECISION = 'decision',
}

// ---------------------------------------------------------------------------
// Stage Outcome Enum
// ---------------------------------------------------------------------------

/**
 * Outcome of a single pipeline stage execution.
 * SKIPPED is critical for future stages that haven't run yet or are
 * intentionally disabled (e.g., Suitability and Decision in v1).
 */
export enum StageOutcome {
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

// ---------------------------------------------------------------------------
// Unified Stage Result (DEC-2026-0033)
// ---------------------------------------------------------------------------

/**
 * Canonical contract for EVERY pipeline stage.
 *
 * - `status`: SUCCESS | FAILED | SKIPPED  (never exceptions between stages)
 * - `error`:  present only when status === FAILED
 * - `output`: present only when status === SUCCESS
 *
 * No stage-specific wrapper objects. Every engine returns this shape.
 */
export interface PipelineStageResult<T> {
  /** Canonical stage identifier */
  stage: PipelineStage;
  /** Engine version (e.g., "1.0") */
  version: string;
  /** Outcome of this stage */
  status: StageOutcome;
  /** Duration in milliseconds */
  durationMs: number;
  /** Evidence IDs related to this stage's execution */
  evidenceIds: string[];
  /** Stage output (present only on SUCCESS) */
  output: T | null;
  /** Error message (present only on FAILED) */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Pipeline Provenance (DEC-2026-0032)
// ---------------------------------------------------------------------------

/**
 * Unified provenance for the entire pipeline run.
 * Every stage records its own provenance; the pipeline aggregates them.
 */
export interface PipelineProvenance {
  /** Unique identifier for this pipeline run */
  runId: string;
  /** Pipeline version (e.g., "1.0") */
  pipelineVersion: string;
  /** ISO timestamp of pipeline start */
  startedAt: string;
  /** ISO timestamp of pipeline completion */
  finishedAt: string;
  /** Total duration in milliseconds */
  durationMs: number;
  /** Ordered list of stage results (same order as execution) */
  stages: PipelineStageResult<unknown>[];
}

// ---------------------------------------------------------------------------
// Pipeline Result
// ---------------------------------------------------------------------------

/**
 * Complete pipeline result with all stages and provenance.
 *
 * Stages is a Record keyed by PipelineStage for type-safe access:
 *   result.stages[PipelineStage.READINESS]
 *
 * This design is open for future engines (Compliance, Risk, Coverage, etc.)
 * without changing the contract — just add new PipelineStage enum values.
 */
export interface PipelineResult {
  /** All stages indexed by stage identifier */
  stages: Record<string, PipelineStageResult<unknown>>;
  /** Pipeline provenance */
  provenance: PipelineProvenance;
}

// ---------------------------------------------------------------------------
// Engine Adapter Contract
// ---------------------------------------------------------------------------

/**
 * Abstract adapter for any pipeline stage engine.
 *
 * Each adapter wraps a specific engine (Extractor, Validator, etc.)
 * in the canonical PipelineStageResult contract.
 *
 * This enables:
 *   - Consistent error handling (no exceptions between stages)
 *   - Consistent timing
 *   - Easy testing (mock adapters)
 *   - Future engines added without pipeline changes
 */
export interface EngineAdapter<TInput, TOutput> {
  /** Canonical stage identifier */
  stage: PipelineStage;
  /** Engine version */
  version: string;
  /** Execute the engine and return a canonical result */
  execute(input: TInput): Promise<PipelineStageResult<TOutput>>;
}

// ---------------------------------------------------------------------------
// Pipeline Configuration
// ---------------------------------------------------------------------------

/**
 * Pipeline execution options.
 */
export interface PipelineOptions {
  /** Optional run ID — auto-generated if not provided */
  runId?: string;
  /** Pipeline version */
  pipelineVersion?: string;
  /** Evidence IDs to associate with this run */
  evidenceIds?: string[];
}
