/**
 * Module 8 — Executive Engineering Portal
 */

import { ensureOsDirs, osPath, deltaArrow } from "./lib.mjs";
import { writeText, writeJson, readText, isoNow, exists, engPath } from "../lib/fs-utils.mjs";
import {
  dataPath,
  loadMetricsSeries,
  sparkline,
  delta,
  loadFindingMemory,
} from "../lib/data-lake.mjs";
import { loadLifecycle } from "./finding-lifecycle.mjs";

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

export async function buildExecutivePortal() {
  ensureOsDirs();
  const series = loadMetricsSeries();
  const cur = series[series.length - 1] || {};
  const prev = series[series.length - 2] || {};
  const overall = cur.overallRepositoryHealth ?? cur.overall ?? null;
  const overallDelta = delta(prev.overallRepositoryHealth ?? prev.overall, overall);

  const compliance = loadJson(dataPath("os/compliance", "latest.json"));
  const adr = loadJson(dataPath("os/adr", "validation-latest.json"));
  const release = loadJson(dataPath("os/release", "latest.json"));
  const lifecycle = loadJson(dataPath("os/lifecycle", "latest.json"));
  const kpi = loadJson(dataPath("os/kpi", "latest.json"));
  const board = loadLifecycle();

  const products = lifecycle?.products || [];
  const pilotReady = products.filter((p) => p.level >= 5).length;
  const productionReady = products.filter((p) => p.level >= 6).length;

  const authAdoption =
    compliance?.rules?.find((r) => r.id === "ACTIONS_USE_ENFORCE")?.score ??
    kpi?.kpis?.find((k) => k.id === "authorization_adoption")?.value ??
    null;

  const sec = cur.securityScore ?? cur.security;
  const secPrev = prev.securityScore ?? prev.security;
  const perf = cur.performanceScore ?? cur.performance;
  const perfPrev = prev.performanceScore ?? prev.performance;
  const debt = cur.technicalDebtScore ?? cur.debt;
  const debtPrev = prev.technicalDebtScore ?? prev.debt;

  // Governance metrics
  const scannerConf = cur.scannerConfidence ?? null;
  const scannerGrade = cur.scannerGrade ?? "—";
  const refDebt = cur.refactoringDebt ?? null;

  const lifeCounts = Object.values(board.items || {}).reduce((acc, i) => {
    acc[i.state] = (acc[i.state] || 0) + 1;
    return acc;
  }, {});

  const rows = [
    ["Platform Health", overall, overallDelta],
    ["Products at Pilot Ready", pilotReady, null],
    ["Products at Production Ready", productionReady, null],
    ["Architecture Compliance", compliance?.overall != null ? `${compliance.overall}%` : "—", null],
    ["ADR Validation", adr?.overall != null ? `${adr.overall}%` : "—", null],
    ["Authorization Migration / Adoption", authAdoption != null ? `${authAdoption}%` : "—", null],
    ["Technical Debt Trend", debt, delta(debtPrev, debt)],
    ["Security Trend", sec, delta(secPrev, sec)],
    ["Performance Trend", perf, delta(perfPrev, perf)],
    ["Findings in Wave Pipeline", (lifeCounts.assigned || 0) + (lifeCounts.implemented || 0), null],
    ["Findings Awaiting Verify", lifeCounts.implemented || 0, null],
    ["Findings Closed", lifeCounts.closed || 0, null],
    // Governance metrics
    ["Scanner Confidence", scannerConf != null ? `${scannerConf}% (${scannerGrade})` : "—", null],
    ["Refactoring Debt", refDebt ?? "—", null],
  ];

  const spark = sparkline(
    series.map((s) => s.overallRepositoryHealth ?? s.overall).filter((v) => v != null),
    12
  );

  const releaseLines = (release?.cards || [])
    .slice(0, 8)
    .map((c) => `| ${c.product} | ${c.ready}% | ${c.releaseReady ? "Yes" : "Not yet"} |`);

  const md = [
    "# Executive Engineering Portal",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "## Platform Pulse",
    "",
    "```",
    `Health  ${spark}  ${overall ?? "—"}  ${overallDelta == null ? "" : (overallDelta >= 0 ? "↗ +" : "↘ ") + Math.abs(overallDelta)}`,
    "```",
    "",
    "| المؤشر / Indicator | القيمة / Value | Trend |",
    "| ------------------ | -------------: | ----- |",
    ...rows.map(([label, value, d]) => {
      const trend =
        d == null ? "—" : `${deltaArrow(d)} ${d >= 0 ? "+" : ""}${d}`;
      return `| ${label} | ${value ?? "—"} | ${trend} |`;
    }),
    "",
    "## Release Readiness (products)",
    "",
    "| Product | Ready | Ship? |",
    "| ------- | ----: | ----- |",
    ...releaseLines,
    releaseLines.length ? "" : "_Run release module first._",
    "",
    "## Finding Execution Pipeline (not a report factory)",
    "",
    "| State | Count |",
    "| ----- | ----: |",
    ...["finding", "prioritized", "assigned", "implemented", "verified", "closed", "archived"].map(
      (s) => `| ${s} | ${lifeCounts[s] || 0} |`
    ),
    "",
    "## Operating Model",
    "",
    "| Role | Authority |",
    "| ---- | --------- |",
    "| OpenCode | Implementation |",
    "| Cursor EngineeringOS | Quality · Intelligence · Verification |",
    "| Program Governance | Architecture direction · ADRs |",
    "",
    "Deep links: [Compliance](./COMPLIANCE.md) · [Lifecycle](./PRODUCT_LIFECYCLE.md) · [Release](./RELEASE_READINESS.md) · [KPI](./KPI.md) · [Findings](./FINDING_LIFECYCLE.md) · [ADR](./ADR_VALIDATION.md)",
    "",
  ].join("\n");

  writeText(osPath("EXECUTIVE_PORTAL.md"), md);
  writeJson(dataPath("os/portal", "latest.json"), {
    at: isoNow(),
    overall,
    overallDelta,
    pilotReady,
    productionReady,
    compliance: compliance?.overall,
    adr: adr?.overall,
    authAdoption,
    lifeCounts,
  });

  // Also mirror into dashboard for executives
  writeText(engPath("dashboard", "EXECUTIVE_PORTAL.md"), md);

  return { overall, pilotReady, productionReady };
}
