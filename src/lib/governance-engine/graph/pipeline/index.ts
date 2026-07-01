// DEC-2026-0030: Pipeline Orchestration Separation
//
// Barrel exports for the Pipeline module.

export { GraphReadinessPipeline } from './graph-readiness-pipeline';
export { PipelineEventEmitter } from './pipeline-events';
export {
  PipelineStage,
  StageOutcome,
  type PipelineStageResult,
  type PipelineProvenance,
  type PipelineResult,
  type EngineAdapter,
  type PipelineOptions,
} from './pipeline-types';
export type { PipelineEvent, PipelineEventHandler } from './pipeline-events';
export {
  generateRunId,
  buildSuccessResult,
  buildFailedResult,
  buildSkippedResult,
  buildProvenance,
  buildPipelineResult,
  getStage,
  stageSucceeded,
  stageFailed,
  stageSkipped,
} from './pipeline-result';
