/**
 * AEOS Kernel — Metrics Engine
 *
 * Collects, stores, and analyzes engineering metrics across cycles.
 * Feeds the health dashboard and trend analysis.
 *
 * @module kernel/metrics-engine
 * @version 1.1
 */

import { emit, EVENTS } from "./event-engine.mjs";

// ─── Metrics Store ──────────────────────────────────────

/** @type {Array<{ metric: string, value: number, cycleId: string, timestamp: string }>} */
const metricsStore = [];

// ─── Metric Definitions ─────────────────────────────────

export const METRICS = {
  // Architecture
  ARCHITECTURE_DRIFT_SCORE: "architecture.drift_score",
  LAYER_VIOLATIONS: "architecture.layer_violations",
  CROSS_PRODUCT_IMPORTS: "architecture.cross_product_imports",

  // Quality
  CODE_HEALTH_SCORE: "quality.code_health",
  DUPLICATION_RATE: "quality.duplication_rate",
  COMPLEXITY_AVG: "quality.complexity_avg",
  GOD_OBJECT_COUNT: "quality.god_object_count",

  // Security
  SECURITY_SCORE: "security.score",
  ENFORCE_COVERAGE: "security.enforce_coverage",
  TENANT_ISOLATION_SCORE: "security.tenant_isolation",

  // Performance
  PERFORMANCE_SCORE: "performance.score",
  BUNDLE_SIZE_KB: "performance.bundle_size_kb",
  CACHE_HIT_RATE: "performance.cache_hit_rate",

  // Testing
  TEST_COUNT: "testing.total",
  TEST_PASS_RATE: "testing.pass_rate",
  COVERAGE_BRANCHES: "testing.coverage_branches",
  COVERAGE_FUNCTIONS: "testing.coverage_functions",
  COVERAGE_LINES: "testing.coverage_lines",

  // Documentation
  DOCS_SYNC_SCORE: "docs.sync_score",
  DOCS_COUNT: "docs.total",

  // Governance
  GOVERNANCE_SCORE: "governance.score",
  RULE_VIOLATIONS: "governance.violations",
  RULES_PASSED: "governance.rules_passed",

  // Engineering
  AGENT_SUCCESS_RATE: "engineering.agent_success_rate",
  SKILL_REUSE_RATE: "engineering.skill_reuse_rate",
  TASKS_COMPLETED: "engineering.tasks_completed",
  CYCLE_DURATION_MS: "engineering.cycle_duration_ms",

  // Knowledge
  KNOWLEDGE_GROWTH: "knowledge.growth",
  ADR_COUNT: "knowledge.adr_count",
  PATTERN_COUNT: "knowledge.pattern_count",

  // AI
  AI_COST_USD: "ai.cost_usd",
  AI_ACCEPTANCE_RATE: "ai.acceptance_rate",
  AI_CONFIDENCE_AVG: "ai.confidence_avg",
};

// ─── Record ─────────────────────────────────────────────

/**
 * Record a metric value.
 * @param {string} metric - Metric name from METRICS
 * @param {number} value
 * @param {{ cycleId?: string }} [meta]
 */
export function record(metric, value, meta = {}) {
  const entry = {
    metric,
    value,
    cycleId: meta.cycleId || null,
    timestamp: new Date().toISOString(),
  };

  metricsStore.push(entry);

  emit(EVENTS.METRIC_RECORDED, { metric, value, cycleId: meta.cycleId }, { source: "metrics-engine" });
}

/**
 * Record multiple metrics at once.
 * @param {Record<string, number>} metrics
 * @param {{ cycleId?: string }} [meta]
 */
export function recordBatch(metrics, meta = {}) {
  for (const [metric, value] of Object.entries(metrics)) {
    record(metric, value, meta);
  }
}

// ─── Query ──────────────────────────────────────────────

/**
 * Get the latest value for a metric.
 * @param {string} metric
 * @returns {number | null}
 */
export function latest(metric) {
  const matching = metricsStore.filter((m) => m.metric === metric);
  if (matching.length === 0) return null;
  return matching[matching.length - 1].value;
}

/**
 * Get all values for a metric across cycles.
 * @param {string} metric
 * @returns {Array<{ value: number, cycleId: string, timestamp: string }>}
 */
export function history(metric) {
  return metricsStore
    .filter((m) => m.metric === metric)
    .map((m) => ({ value: m.value, cycleId: m.cycleId, timestamp: m.timestamp }));
}

/**
 * Calculate trend for a metric (improving, declining, stable).
 * @param {string} metric
 * @param {number} [window=5] - Number of recent values to compare
 * @returns {{ trend: "improving" | "declining" | "stable" | "unknown", change: number }}
 */
export function trend(metric, window = 5) {
  const values = metricsStore
    .filter((m) => m.metric === metric)
    .map((m) => m.value);

  if (values.length < 2) return { trend: "unknown", change: 0 };

  const recent = values.slice(-Math.min(window, values.length));
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = last - first;

  if (Math.abs(change) < 0.5) return { trend: "stable", change: 0 };
  return { trend: change > 0 ? "improving" : "declining", change };
}

/**
 * Get all unique metric names.
 * @returns {string[]}
 */
export function getAllMetrics() {
  return [...new Set(metricsStore.map((m) => m.metric))];
}

/**
 * Count total recorded metrics.
 * @returns {number}
 */
export function count() {
  return metricsStore.length;
}

// ─── Health Score ───────────────────────────────────────

/**
 * Calculate a composite health score from all tracked metrics.
 * @returns {{ score: number, components: Record<string, number> }}
 */
export function calculateHealthScore() {
  const components = {
    architecture: latest(METRICS.ARCHITECTURE_DRIFT_SCORE) || 80,
    quality: latest(METRICS.CODE_HEALTH_SCORE) || 75,
    security: latest(METRICS.SECURITY_SCORE) || 88,
    testing: latest(METRICS.COVERAGE_LINES) || 33,
    governance: latest(METRICS.GOVERNANCE_SCORE) || 82,
    documentation: latest(METRICS.DOCS_SYNC_SCORE) || 85,
    engineering: latest(METRICS.AGENT_SUCCESS_RATE) || 90,
    knowledge: latest(METRICS.KNOWLEDGE_GROWTH) || 50,
  };

  const weights = {
    architecture: 0.15,
    quality: 0.15,
    security: 0.20,
    testing: 0.15,
    governance: 0.10,
    documentation: 0.10,
    engineering: 0.10,
    knowledge: 0.05,
  };

  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += (components[key] || 0) * weight;
  }

  score = Math.round(score);

  emit(EVENTS.HEALTH_SCORE_CHANGED, { score, components }, { source: "metrics-engine" });

  return { score, components };
}

// ─── Exports ────────────────────────────────────────────

export default {
  METRICS,
  record,
  recordBatch,
  latest,
  history,
  trend,
  getAllMetrics,
  count,
  calculateHealthScore,
};
