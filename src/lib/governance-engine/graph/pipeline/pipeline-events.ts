// DEC-2026-0030: Pipeline Orchestration Separation
//
// Domain events for the pipeline orchestrator.
// These are NOT logging — they are domain events that can be subscribed to for:
//   - Telemetry and metrics
//   - Progress UI
//   - Audit trail
//   - Monitoring and alerting
//
// In v1, these are type-only hooks (no-op by default).
// Future: connect to observability, SIEM, or progress reporters.

import type { PipelineStage, StageOutcome, PipelineProvenance } from './pipeline-types';

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

/**
 * Fired when the pipeline starts execution.
 */
export interface PipelineStartedEvent {
  type: 'PipelineStarted';
  runId: string;
  pipelineVersion: string;
  startedAt: string;
}

/**
 * Fired when a single stage begins execution.
 */
export interface StageStartedEvent {
  type: 'StageStarted';
  runId: string;
  stage: PipelineStage;
  startedAt: string;
}

/**
 * Fired when a stage completes successfully.
 */
export interface StageCompletedEvent {
  type: 'StageCompleted';
  runId: string;
  stage: PipelineStage;
  durationMs: number;
  status: StageOutcome;
}

/**
 * Fired when a stage fails.
 */
export interface StageFailedEvent {
  type: 'StageFailed';
  runId: string;
  stage: PipelineStage;
  durationMs: number;
  error: string;
}

/**
 * Fired when the entire pipeline completes.
 */
export interface PipelineCompletedEvent {
  type: 'PipelineCompleted';
  runId: string;
  provenance: PipelineProvenance;
  totalDurationMs: number;
}

/**
 * Union type of all pipeline events.
 */
export type PipelineEvent =
  | PipelineStartedEvent
  | StageStartedEvent
  | StageCompletedEvent
  | StageFailedEvent
  | PipelineCompletedEvent;

// ---------------------------------------------------------------------------
// Event Handler
// ---------------------------------------------------------------------------

/**
 * Handler function for pipeline events.
 */
export type PipelineEventHandler = (event: PipelineEvent) => void | Promise<void>;

// ---------------------------------------------------------------------------
// Event Emitter
// ---------------------------------------------------------------------------

/**
 * Lightweight domain event emitter for pipeline events.
 *
 * In v1: synchronous handler dispatch (no batching, no queuing).
 * Future: pluggable observers, SIEM integration, WebSocket progress.
 */
export class PipelineEventEmitter {
  private handlers: PipelineEventHandler[] = [];

  /** Subscribe to all pipeline events. Returns unsubscribe function. */
  subscribe(handler: PipelineEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const idx = this.handlers.indexOf(handler);
      if (idx >= 0) {
        this.handlers.splice(idx, 1);
      }
    };
  }

  /** Emit an event to all subscribers */
  emit(event: PipelineEvent): void {
    for (const handler of this.handlers) {
      const result = handler(event);
      // Handle async handlers (fire and forget in v1)
      if (result instanceof Promise) {
        result.catch((err) => {
          console.warn(`[PipelineEvent] Handler error: ${err instanceof Error ? err.message : String(err)}`);
        });
      }
    }
  }

  /** Remove all subscribers */
  clear(): void {
    this.handlers.length = 0;
  }

  /** Number of subscribers */
  get subscriberCount(): number {
    return this.handlers.length;
  }
}
