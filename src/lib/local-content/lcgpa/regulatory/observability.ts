// ─── LCGPA Regulatory Intelligence :: Observability (§40) ───
//
// Uses the platform's existing structured logger. This module adds a metric
// counter registry only — it does NOT introduce a parallel logging framework.

import { createLogger } from "@/lib/observability/logger";
import type {
  RegulatoryAlert,
  RegulatoryDiff,
  RegulatoryImpactAssessment,
  SourceCheckResult,
} from "./types";

export const REGULATORY_METRICS = [
  "source_check_total",
  "source_check_failure_total",
  "artifact_acquired_total",
  "artifact_changed_total",
  "parse_failure_total",
  "validation_failure_total",
  "regulatory_change_total",
  "high_impact_change_total",
  "review_pending_total",
  "activation_total",
  "rollback_total",
  "conflict_total",
  "alert_total",
] as const;
export type RegulatoryMetric = (typeof REGULATORY_METRICS)[number];

export type MetricLabels = Record<string, string>;

/** Sink port. The application wires this to its metrics backend. */
export interface MetricSink {
  increment(metric: RegulatoryMetric, value: number, labels: MetricLabels): void;
}

export interface MetricsRecorder {
  increment(metric: RegulatoryMetric, labels?: MetricLabels, value?: number): void;
  /** Current in-process counter values, keyed by `metric{label=value,…}`. */
  snapshot(): Record<string, number>;
  reset(): void;
}

function keyOf(metric: RegulatoryMetric, labels: MetricLabels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return metric;
  return `${metric}{${entries.map(([k, v]) => `${k}=${v}`).join(",")}}`;
}

const logger = createLogger({ product: "local_content", action: "lcgpa.regulatory" });

/**
 * In-process counter registry. Emits to the injected sink when one is provided
 * and logs every increment through the platform structured logger.
 */
export function createMetricsRecorder(sink?: MetricSink): MetricsRecorder {
  const counters = new Map<string, number>();
  return {
    increment(metric, labels = {}, value = 1) {
      const key = keyOf(metric, labels);
      counters.set(key, (counters.get(key) ?? 0) + value);
      sink?.increment(metric, value, labels);
      logger.debug("regulatory metric", { metric, value, ...labels });
    },
    snapshot() {
      return Object.fromEntries(
        Array.from(counters.entries()).sort(([a], [b]) => a.localeCompare(b)),
      );
    },
    reset() {
      counters.clear();
    },
  };
}

// ─── Emitters ───

/** Record the outcome of one source check. */
export function recordCheck(
  recorder: MetricsRecorder,
  result: SourceCheckResult,
): void {
  recorder.increment("source_check_total", {
    source: result.sourceId,
    outcome: result.outcome,
  });
  if (result.outcome === "SOURCE_UNAVAILABLE" || result.outcome === "INTEGRITY_FAILURE") {
    recorder.increment("source_check_failure_total", {
      source: result.sourceId,
      error: result.errorCode ?? "UNKNOWN",
    });
    logger.warn("regulatory source check failed", {
      source: result.sourceId,
      outcome: result.outcome,
      errorCode: result.errorCode,
      attemptCount: result.attemptCount,
    });
  }
  if (result.outcome === "CHANGE_DETECTED") {
    recorder.increment("artifact_changed_total", { source: result.sourceId });
    logger.info("regulatory artifact changed", {
      source: result.sourceId,
      previousSha256: result.previousSha256,
      observedSha256: result.observedSha256,
    });
  }
}

export function recordArtifactAcquired(
  recorder: MetricsRecorder,
  sourceId: string,
  status: string,
): void {
  recorder.increment("artifact_acquired_total", { source: sourceId, status });
}

export function recordValidationFailure(
  recorder: MetricsRecorder,
  sourceId: string,
  errorCount: number,
): void {
  recorder.increment("validation_failure_total", { source: sourceId }, errorCount);
}

export function recordParseFailure(recorder: MetricsRecorder, sourceId: string): void {
  recorder.increment("parse_failure_total", { source: sourceId });
  logger.error("regulatory parser failed", undefined, { source: sourceId });
}

export function recordDiff(
  recorder: MetricsRecorder,
  sourceId: string,
  diff: RegulatoryDiff,
): void {
  for (const change of diff.changes) {
    recorder.increment("regulatory_change_total", {
      source: sourceId,
      type: change.changeType,
      severity: change.severity,
    });
  }
}

export function recordImpact(
  recorder: MetricsRecorder,
  sourceId: string,
  impact: RegulatoryImpactAssessment,
): void {
  if (impact.impactLevel === "HIGH" || impact.impactLevel === "CRITICAL") {
    recorder.increment("high_impact_change_total", {
      source: sourceId,
      level: impact.impactLevel,
    });
  }
  if (impact.requiresReview) {
    recorder.increment("review_pending_total", { source: sourceId });
  }
}

export function recordAlerts(
  recorder: MetricsRecorder,
  alerts: RegulatoryAlert[],
): void {
  for (const alert of alerts) {
    recorder.increment("alert_total", {
      source: alert.sourceId,
      category: alert.category,
      severity: alert.severity,
    });
  }
}

export function recordActivation(recorder: MetricsRecorder, sourceId: string): void {
  recorder.increment("activation_total", { source: sourceId });
}

export function recordRollback(recorder: MetricsRecorder, sourceId: string): void {
  recorder.increment("rollback_total", { source: sourceId });
  logger.error("regulatory dataset rolled back", undefined, { source: sourceId });
}

export function recordConflict(recorder: MetricsRecorder, sourceId: string): void {
  recorder.increment("conflict_total", { source: sourceId });
}
