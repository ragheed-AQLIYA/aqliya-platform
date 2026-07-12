/**
 * Ingest current report artifacts into the append-only data lake.
 */

import {
  ingestAuditSnapshot,
  newAuditId,
  ensureDataLake,
  loadMetricsSeries,
  appendJsonl,
  dataPath,
} from "./data-lake.mjs";
import { engPath, exists, readText, isoNow, writeJson } from "./fs-utils.mjs";
import { calculateMetrics } from "../metrics/calculate.mjs";

const REPORT_BASES = [
  "code-health",
  "security",
  "performance",
  "testing",
  "documentation",
  "ui-quality",
  "dependencies",
  "technical-debt",
  "architecture-drift",
  "engineering-intelligence",
  "trend-analysis",
  "regression-detector",
  "recommendation-ranking",
  "engineering-cost",
  "predictive-risk",
];

export function loadFindingsByAgent() {
  const out = {};
  for (const base of REPORT_BASES) {
    const p = engPath("reports", `${base}.json`);
    if (!exists(p)) continue;
    try {
      const data = JSON.parse(readText(p));
      out[base] = data.findings || [];
    } catch {
      out[base] = [];
    }
  }
  return out;
}

/** One-time: seed series from legacy metrics/history.jsonl if data lake empty */
export function seedSeriesFromLegacyHistory() {
  ensureDataLake();
  const series = loadMetricsSeries();
  if (series.length > 0) return 0;

  const legacy = engPath("metrics", "history.jsonl");
  if (!exists(legacy)) return 0;
  const lines = readText(legacy)
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  let n = 0;
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      const auditId = `legacy-${String(row.at).replace(/[:.]/g, "-")}`;
      appendJsonl(dataPath("metrics", "series.jsonl"), {
        auditId,
        at: row.at,
        overallRepositoryHealth: row.overall,
        securityScore: row.security,
        performanceScore: row.performance,
        codeHealthScore: row.codeHealth,
        architectureHealth: row.architecture,
        technicalDebtScore: row.debt,
      });
      // Minimal audit stub so regression detector has before/after
      writeJson(dataPath("audits", `${auditId}.json`), {
        auditId,
        startedAt: row.at,
        finishedAt: row.at,
        scores: {
          overallRepositoryHealth: row.overall,
          securityScore: row.security,
          performanceScore: row.performance,
          codeHealthScore: row.codeHealth,
          architectureHealth: row.architecture,
          technicalDebtScore: row.debt,
        },
        gates: null,
        agents: [],
        findingCount: 0,
        fingerprints: [],
        legacy: true,
      });
      n += 1;
    } catch {
      /* ignore */
    }
  }
  return n;
}

export function ingestCurrentAudit({ startedAt, finishedAt, agentResults, gates }) {
  ensureDataLake();
  seedSeriesFromLegacyHistory();

  const metrics = calculateMetrics();
  const scores = metrics.scores;
  const auditId = newAuditId(finishedAt || isoNow());
  const findingsByAgent = loadFindingsByAgent();

  const result = ingestAuditSnapshot({
    auditId,
    startedAt: startedAt || finishedAt,
    finishedAt: finishedAt || isoNow(),
    agentResults,
    scores,
    gates,
    findingsByAgent,
  });

  return { ...result, scores };
}
