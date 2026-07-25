/**
 * Module 6 — Engineering KPI Engine
 * Time-series KPIs, not just snapshots.
 */

import { ensureOsDirs, osPath } from "./lib.mjs";
import { writeText, writeJson, isoNow, exists, readText, engPath } from "../lib/fs-utils.mjs";
import {
  dataPath,
  loadMetricsSeries,
  loadFindingMemory,
  sparkline,
  delta,
} from "../lib/data-lake.mjs";

export async function runKpiEngine() {
  ensureOsDirs();
  const series = loadMetricsSeries();
  const memory = loadFindingMemory();
  const items = Object.values(memory.items || {});

  const cur = series[series.length - 1] || {};
  const prev = series[series.length - 2] || {};

  const resolved = items.filter((i) => i.status === "resolved");
  const reopened = items.filter((i) => (i.reopenedCount || 0) > 0 || i.status === "reopened");
  const open = items.filter((i) => i.status === "open" || i.status === "reopened");

  // Mean time to fix (hours) — from firstSeen to resolvedAt when available
  const fixHours = [];
  for (const i of resolved) {
    if (!i.firstSeen || !i.resolvedAt) continue;
    const a = Date.parse(i.firstSeen);
    const b = Date.parse(i.resolvedAt);
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
      fixHours.push((b - a) / 3600000);
    }
  }
  const mttr =
    fixHours.length > 0
      ? Math.round((fixHours.reduce((s, x) => s + x, 0) / fixHours.length) * 10) / 10
      : null;

  // Authorization adoption from compliance artifact
  let authAdoption = null;
  try {
    const comp = JSON.parse(readText(dataPath("os/compliance", "latest.json")));
    authAdoption = comp.rules?.find((r) => r.id === "ACTIONS_USE_ENFORCE")?.score ?? null;
  } catch {
    /* ignore */
  }

  // Dead code burn-down proxy: unused-export/import open count trend
  const deadOpen = open.filter((i) =>
    ["unused-export", "unused-import", "dead-code"].includes(i.category)
  ).length;

  const overallSeries = series.map((s) => s.overallRepositoryHealth ?? s.overall).filter((v) => v != null);
  const debtSeries = series.map((s) => s.technicalDebtScore ?? s.debt).filter((v) => v != null);
  const secSeries = series.map((s) => s.securityScore ?? s.security).filter((v) => v != null);

  const kpis = [
    {
      id: "code_health",
      label: "Code Health",
      value: cur.codeHealthScore ?? cur.codeHealth ?? null,
      delta: delta(prev.codeHealthScore ?? prev.codeHealth, cur.codeHealthScore ?? cur.codeHealth),
      sparkline: sparkline(
        series.map((s) => s.codeHealthScore ?? s.codeHealth).filter((v) => v != null)
      ),
    },
    {
      id: "technical_debt",
      label: "Technical Debt (health)",
      value: cur.technicalDebtScore ?? cur.debt ?? null,
      delta: delta(prev.technicalDebtScore ?? prev.debt, cur.technicalDebtScore ?? cur.debt),
      sparkline: sparkline(debtSeries),
    },
    {
      id: "mttr_hours",
      label: "Mean Time to Fix (hours)",
      value: mttr,
      delta: null,
      sparkline: "—",
    },
    {
      id: "reopened_findings",
      label: "Reopened Findings",
      value: reopened.length,
      delta: null,
      sparkline: "—",
    },
    {
      id: "authorization_adoption",
      label: "Authorization Adoption (%)",
      value: authAdoption,
      delta: null,
      sparkline: "—",
    },
    {
      id: "dead_code_open",
      label: "Dead Code Open Signals",
      value: deadOpen,
      delta: null,
      sparkline: "—",
    },
    {
      id: "documentation_coverage",
      label: "Documentation Score",
      value: cur.documentationScore ?? null,
      delta: delta(prev.documentationScore, cur.documentationScore),
      sparkline: sparkline(series.map((s) => s.documentationScore).filter((v) => v != null)),
    },
    {
      id: "test_stability",
      label: "Test Intelligence Score",
      value: cur.testScore ?? null,
      delta: delta(prev.testScore, cur.testScore),
      sparkline: sparkline(series.map((s) => s.testScore).filter((v) => v != null)),
    },
    {
      id: "security_trend",
      label: "Security Score",
      value: cur.securityScore ?? cur.security ?? null,
      delta: delta(prev.securityScore ?? prev.security, cur.securityScore ?? cur.security),
      sparkline: sparkline(secSeries),
    },
    {
      id: "platform_health",
      label: "Platform Health",
      value: cur.overallRepositoryHealth ?? cur.overall ?? null,
      delta: delta(prev.overallRepositoryHealth ?? prev.overall, cur.overallRepositoryHealth ?? cur.overall),
      sparkline: sparkline(overallSeries),
    },
    {
      id: "open_findings",
      label: "Open Findings",
      value: open.length,
      delta: null,
      sparkline: "—",
    },
    {
      id: "resolved_findings",
      label: "Resolved Findings (lifetime)",
      value: resolved.length,
      delta: null,
      sparkline: "—",
    },
    // Governance metrics — scanner quality + design debt
    {
      id: "scanner_confidence",
      label: "Scanner Confidence (%)",
      value: cur.scannerConfidence ?? null,
      delta: delta(prev.scannerConfidence, cur.scannerConfidence),
      sparkline: sparkline(series.map((s) => s.scannerConfidence).filter((v) => v != null)),
    },
    {
      id: "scanner_grade",
      label: "Scanner Grade",
      value: cur.scannerGrade ?? "—",
      delta: null,
      sparkline: "—",
    },
    {
      id: "refactoring_debt",
      label: "Refactoring Debt",
      value: cur.refactoringDebt ?? null,
      delta: delta(prev.refactoringDebt, cur.refactoringDebt),
      sparkline: sparkline(series.map((s) => s.refactoringDebt).filter((v) => v != null)),
    },
  ];

  // Append KPI snapshot to history
  const snap = { at: isoNow(), kpis: Object.fromEntries(kpis.map((k) => [k.id, k.value])) };
  const histPath = dataPath("os/kpi", "history.jsonl");
  const prevHist = exists(histPath) ? readText(histPath) : "";
  writeText(histPath, (prevHist || "") + JSON.stringify(snap) + "\n");
  writeJson(dataPath("os/kpi", "latest.json"), { at: isoNow(), kpis });

  const md = [
    "# Engineering KPIs",
    "",
    `**Generated:** ${isoNow()}  `,
    `**Series length:** ${series.length} audits`,
    "",
    "| KPI | Value | Δ | Trend |",
    "| --- | ----- | - | ----- |",
    ...kpis.map(
      (k) =>
        `| ${k.label} | ${k.value ?? "—"} | ${k.delta == null ? "—" : (k.delta >= 0 ? "+" : "") + k.delta} | \`${k.sparkline}\` |`
    ),
    "",
    "## Notes",
    "",
    "- MTTR requires findings to move through lifecycle to `resolved` across audits.",
    "- Authorization Adoption comes from Compliance rule `ACTIONS_USE_ENFORCE`.",
    "- Dead Code burn-down tracks open unused-import/export signals in finding memory.",
    "",
  ].join("\n");

  writeText(osPath("KPI.md"), md);
  return { kpis };
}
