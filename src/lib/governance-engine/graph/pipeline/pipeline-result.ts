// DEC-2026-0032: Pipeline Provenance
// DEC-2026-0033: Pipeline Stage Contract
//
// Helper functions for building PipelineStageResult and PipelineResult
// in a consistent, type-safe way.

import {
  PipelineStage,
  StageOutcome,
  type PipelineStageResult,
  type PipelineProvenance,
  type PipelineResult,
  type PipelineOptions,
} from './pipeline-types';

// Re-export enums so consumers can import everything from pipeline-result
export { PipelineStage, StageOutcome };

// ---------------------------------------------------------------------------
// Run ID Generator
// ---------------------------------------------------------------------------

let counter = 0;

/**
 * Generate a unique run ID.
 * Format: "pipeline-{timestamp}-{counter}"
 */
export function generateRunId(): string {
  counter += 1;
  const ts = Date.now().toString(36);
  const seq = counter.toString(36).padStart(4, '0');
  return `pipeline-${ts}-${seq}`;
}

// ---------------------------------------------------------------------------
// Stage Result Builder
// ---------------------------------------------------------------------------

/**
 * Build a successful PipelineStageResult.
 */
export function buildSuccessResult<T>(
  stage: PipelineStage,
  version: string,
  output: T,
  durationMs: number,
  evidenceIds: string[] = [],
): PipelineStageResult<T> {
  return {
    stage,
    version,
    status: StageOutcome.SUCCESS,
    durationMs,
    evidenceIds,
    output,
    error: null,
  };
}

/**
 * Build a failed PipelineStageResult.
 */
export function buildFailedResult<T>(
  stage: PipelineStage,
  version: string,
  error: string,
  durationMs: number,
  evidenceIds: string[] = [],
): PipelineStageResult<T> {
  return {
    stage,
    version,
    status: StageOutcome.FAILED,
    durationMs,
    evidenceIds,
    output: null,
    error,
  };
}

/**
 * Build a skipped PipelineStageResult.
 * A stage is SKIPPED when a previous stage failed and this stage
 * depends on its output.
 */
export function buildSkippedResult<T>(
  stage: PipelineStage,
  version: string,
  reason: string,
): PipelineStageResult<T> {
  return {
    stage,
    version,
    status: StageOutcome.SKIPPED,
    durationMs: 0,
    evidenceIds: [],
    output: null,
    error: reason,
  };
}

// ---------------------------------------------------------------------------
// Provenance Builder
// ---------------------------------------------------------------------------

/**
 * Build PipelineProvenance from an ordered list of stage results.
 */
export function buildProvenance(
  stages: PipelineStageResult<unknown>[],
  startedAt: string,
  finishedAt: string,
  options?: PipelineOptions,
): PipelineProvenance {
  const started = new Date(startedAt).getTime();
  const finished = new Date(finishedAt).getTime();

  return {
    runId: options?.runId ?? generateRunId(),
    pipelineVersion: options?.pipelineVersion ?? '1.0',
    startedAt,
    finishedAt,
    durationMs: Math.max(0, finished - started),
    stages: [...stages],
  };
}

// ---------------------------------------------------------------------------
// Pipeline Result Builder
// ---------------------------------------------------------------------------

/**
 * Build the complete PipelineResult from an ordered list of stage results.
 * The stages are indexed by their PipelineStage identifier for type-safe access.
 */
export function buildPipelineResult(
  provenance: PipelineProvenance,
): PipelineResult {
  const stagesMap: Record<string, PipelineStageResult<unknown>> = {};

  for (const stageResult of provenance.stages) {
    stagesMap[stageResult.stage] = stageResult;
  }

  return {
    stages: stagesMap,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Stage Access Helpers
// ---------------------------------------------------------------------------

/**
 * Get a specific stage result from a pipeline result.
 * Returns null if the stage hasn't been executed.
 */
export function getStage<T>(
  result: PipelineResult,
  stage: PipelineStage,
): PipelineStageResult<T> | null {
  const entry = result.stages[stage];
  if (!entry) return null;
  return entry as PipelineStageResult<T>;
}

/**
 * Check if a specific stage succeeded.
 */
export function stageSucceeded(
  result: PipelineResult,
  stage: PipelineStage,
): boolean {
  const entry = result.stages[stage];
  return entry?.status === StageOutcome.SUCCESS;
}

/**
 * Check if a specific stage failed.
 */
export function stageFailed(
  result: PipelineResult,
  stage: PipelineStage,
): boolean {
  const entry = result.stages[stage];
  return entry?.status === StageOutcome.FAILED;
}

/**
 * Check if a specific stage was skipped.
 */
export function stageSkipped(
  result: PipelineResult,
  stage: PipelineStage,
): boolean {
  const entry = result.stages[stage];
  return entry?.status === StageOutcome.SKIPPED;
}
