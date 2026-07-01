/**
 * Observability Foundation — SPEC-01e §8, PRD-01 §14b
 *
 * Captures metrics (counters, gauges, histograms), logs, traces, and health.
 * All 11 mutation actions from the Observability Matrix are tracked.
 */

export interface MetricCounter {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricGauge {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricHistogram {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export interface TraceSpan {
  name: string;
  correlationId?: string;
  startTime: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
}

export interface StructuredLog {
  level: "info" | "warn" | "error";
  message: string;
  correlationId?: string;
  action?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "failed";
  latencyMs: number;
  lastCheckedAt: string;
}

export class Telemetry {
  counters: MetricCounter[] = [];
  gauges: MetricGauge[] = [];
  histograms: MetricHistogram[] = [];
  logs: StructuredLog[] = [];
  traces: TraceSpan[] = [];
  healthChecks: HealthCheck[] = [];

  // ─── Metrics ───

  incrementCounter(name: string, labels?: Record<string, string>): void {
    const existing = this.counters.find((c) => c.name === name && JSON.stringify(c.labels) === JSON.stringify(labels));
    if (existing) { existing.value++; } else {
      this.counters.push({ name, value: 1, labels });
    }
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.push({ name, value, labels });
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.histograms.push({ name, value, labels });
  }

  // ─── Logs ───

  log(level: StructuredLog["level"], message: string, correlationId?: string, action?: string, metadata?: Record<string, unknown>): void {
    this.logs.push({ level, message, correlationId, action, timestamp: new Date().toISOString(), metadata });
  }

  // ─── Traces ───

  startTrace(name: string, correlationId?: string): number {
    const idx = this.traces.length;
    this.traces.push({ name, correlationId, startTime: new Date().toISOString() });
    return idx;
  }

  endTrace(idx: number): void {
    if (this.traces[idx]) this.traces[idx].endTime = new Date().toISOString();
  }

  // ─── Health ───

  setHealth(name: string, status: HealthCheck["status"], latencyMs: number): void {
    this.healthChecks.push({ name, status, latencyMs, lastCheckedAt: new Date().toISOString() });
  }

  // ─── Actions (per PRD-01 §14b) ───

  recordAction(action: string, correlationId?: string, metadata?: Record<string, unknown>): void {
    this.incrementCounter(`salesos.${action}`);
    this.log("info", `Action: ${action}`, correlationId, action, metadata);
    const traceIdx = this.startTrace(`${action}`, correlationId);
    this.endTrace(traceIdx);
  }

  // ─── Queries ───

  getCounter(name: string): MetricCounter | undefined {
    return this.counters.find((c) => c.name === name);
  }

  getLogsByCorrelation(correlationId: string): StructuredLog[] {
    return this.logs.filter((l) => l.correlationId === correlationId);
  }

  allHealthy(): boolean {
    return this.healthChecks.every((h) => h.status === "healthy");
  }
}
