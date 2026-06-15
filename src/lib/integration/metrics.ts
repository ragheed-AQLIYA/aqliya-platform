// ─── Integration Metrics — Operational Telemetry (Sprint 2A) ───
// Lightweight in-memory metric counters for integration operations.
// Replace with Prometheus/OpenTelemetry counters in production deployment.
// These are NOT audit events — they are high-volume operational counters.

import "server-only";

// ─── Counter Types ───

export interface MetricLabels {
  organizationId?: string;
  integrationType?: string;
  provider?: string;
  purpose?: string;
  result?: string;
  source?: string;
  error?: string;
}

export interface MetricCounter {
  name: string;
  value: number;
  labels: MetricLabels;
  updatedAt: Date;
}

// ─── In-Memory Metric Store ───

class InMemoryMetricStore {
  private counters = new Map<string, MetricCounter>();
  private readonly maxAgeMs = 24 * 60 * 60 * 1000; // 24h retention

  /** Increment a named counter with optional labels. Returns the new count. */
  increment(name: string, labels: MetricLabels = {}): number {
    const key = this.makeKey(name, labels);
    const now = new Date();
    const existing = this.counters.get(key);

    if (existing) {
      existing.value += 1;
      existing.updatedAt = now;
      return existing.value;
    }

    this.counters.set(key, {
      name,
      value: 1,
      labels,
      updatedAt: now,
    });

    this.evictStale();
    return 1;
  }

  /** Get the current value of a counter. Returns 0 if no data. */
  get(name: string, labels: MetricLabels = {}): number {
    const key = this.makeKey(name, labels);
    return this.counters.get(key)?.value ?? 0;
  }

  /** Get all registered counters (for inspection/diagnostics). */
  getAll(): MetricCounter[] {
    return Array.from(this.counters.values());
  }

  /** Reset all counters (for test isolation). */
  reset(): void {
    this.counters.clear();
  }

  private makeKey(name: string, labels: MetricLabels): string {
    const labelParts = Object.entries(labels)
      .filter(([_, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`);

    return labelParts.length > 0 ? `${name}:{${labelParts.join(",")}}` : name;
  }

  private evictStale(): void {
    const cutoff = Date.now() - this.maxAgeMs;
    for (const [key, counter] of this.counters) {
      if (counter.updatedAt.getTime() < cutoff) {
        this.counters.delete(key);
      }
    }
  }
}

// ─── Singleton ───

const globalForMetrics = globalThis as unknown as {
  integrationMetrics: InMemoryMetricStore | undefined;
};

function getMetricStore(): InMemoryMetricStore {
  if (typeof globalForMetrics.integrationMetrics === "undefined") {
    globalForMetrics.integrationMetrics = new InMemoryMetricStore();
  }
  return globalForMetrics.integrationMetrics;
}

// ─── Public API ───

/**
 * Increment an operational metric counter.
 * These are high-volume events — NOT audit trail.
 * Replace with Prometheus/OpenTelemetry counter in production.
 */
export function incrementCounter(
  name: string,
  labels: MetricLabels = {},
): number {
  return getMetricStore().increment(name, labels);
}

/**
 * Get the current value of a metric counter.
 */
export function getCounter(name: string, labels: MetricLabels = {}): number {
  return getMetricStore().get(name, labels);
}

/**
 * Get all metric counters (for diagnostics / test assertions).
 */
export function getAllCounters(): MetricCounter[] {
  return getMetricStore().getAll();
}

/**
 * Reset all counters (for test isolation between runs).
 */
export function resetCounters(): void {
  getMetricStore().reset();
}
