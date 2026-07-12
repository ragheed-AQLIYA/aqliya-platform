/**
 * ROI Optimizer Agent
 * "If we fix Top N, Platform Health moves from X → Y"
 * LAST-WAVE agent — see AGENT_FREEZE.md
 */

import { ensureProgramsDirs } from "./registry.mjs";
import {
  engPath,
  writeText,
  writeJson,
  readText,
  isoNow,
  exists,
} from "../lib/fs-utils.mjs";
import { dataPath, loadMetricsSeries } from "../lib/data-lake.mjs";

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

/**
 * Estimate health lift from fixing a finding.
 * Heuristic: severity + ROI + category weights, dampened.
 */
function estimatedLift(f) {
  const sev = { critical: 2.2, high: 1.4, medium: 0.6, low: 0.2 }[f.severity] || 0.4;
  const roiBoost = Math.min(1.5, (f.roi || 1) / 3);
  const catBoost = ["A01", "A02", "layer-violation", "n-plus-one", "chronic"].includes(f.category)
    ? 1.3
    : 1;
  return sev * roiBoost * catBoost;
}

export async function runRoiOptimizer({ topN = 15 } = {}) {
  ensureProgramsDirs();
  const series = loadMetricsSeries();
  const cur =
    series[series.length - 1]?.overallRepositoryHealth ??
    series[series.length - 1]?.overall ??
    loadJson(dataPath("os/portal", "latest.json"))?.overall ??
    74;

  const top10 = loadJson(dataPath("recommendations", "top10.json"))?.top10 || [];
  const plan = loadJson(dataPath("programs", "waves", "latest-plan.json"))?.waves || [];
  const fromPlan = plan.flatMap((w) => w.findings || []);
  const poolMap = new Map();
  for (const f of [...top10, ...fromPlan]) {
    if (!f.fingerprint) continue;
    if (!poolMap.has(f.fingerprint)) poolMap.set(f.fingerprint, f);
  }
  let pool = [...poolMap.values()].sort((a, b) => (b.roi || 0) - (a.roi || 0));
  if (pool.length < topN) {
    // pad from delivery selected
    const delivery = loadJson(dataPath("programs", "delivery.json"));
    for (const item of Object.values(delivery?.items || {})) {
      if (poolMap.has(item.id)) continue;
      pool.push({
        fingerprint: item.id,
        title: item.title,
        severity: item.severity,
        roi: item.roi || 2,
        category: "delivery",
        effortDays: item.effortDays || 1,
      });
    }
  }
  pool = pool.slice(0, Math.max(topN, 15));

  const selected = pool.slice(0, topN).map((f) => ({
    ...f,
    lift: Math.round(estimatedLift(f) * 10) / 10,
    effortDays: f.effortDays || 1,
    impact: f.impact || 5,
    risk: f.risk || 2,
    confidence: f.confidence || 70,
  }));

  // Diminishing returns on total lift
  let rawLift = 0;
  selected.forEach((f, i) => {
    rawLift += f.lift * Math.pow(0.92, i);
  });
  const projectedLift = Math.min(20, Math.round(rawLift * 10) / 10);
  const projectedHealth = Math.min(98, Math.round((cur + projectedLift) * 10) / 10);
  const totalEffort = Math.round(selected.reduce((s, f) => s + (f.effortDays || 1), 0) * 10) / 10;
  const avgConfidence =
    selected.length === 0
      ? 0
      : Math.round(selected.reduce((s, f) => s + (f.confidence || 70), 0) / selected.length);

  const scenarios = [5, 10, 15, 20].map((n) => {
    const slice = pool.slice(0, n).map((f, i) => estimatedLift(f) * Math.pow(0.92, i));
    const lift = Math.min(22, Math.round(slice.reduce((a, b) => a + b, 0) * 10) / 10);
    return {
      n,
      lift,
      health: Math.min(98, Math.round((cur + lift) * 10) / 10),
      effort: Math.round(
        pool.slice(0, n).reduce((s, f) => s + (f.effortDays || 1), 0) * 10
      ) / 10,
    };
  });

  const payload = {
    at: isoNow(),
    currentHealth: cur,
    topN,
    projectedLift,
    projectedHealth,
    totalEffort,
    avgConfidence,
    selected,
    scenarios,
  };

  writeJson(dataPath("programs", "roi-latest.json"), payload);

  const md = [
    "# ROI Optimizer",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "```",
    `لو أصلحت Top ${topN}`,
    ``,
    `Platform Health`,
    `${cur}`,
    `    ↓`,
    `${projectedHealth}   (+${projectedLift})`,
    ``,
    `Effort ≈ ${totalEffort} days`,
    `Confidence ≈ ${avgConfidence}%`,
    "```",
    "",
    "## Scenario table",
    "",
    "| Fix Top N | Projected Health | Lift | Effort (days) |",
    "| --------- | ---------------: | ---: | ------------: |",
    ...scenarios.map(
      (s) => `| ${s.n} | **${s.health}** | +${s.lift} | ${s.effort} |`
    ),
    "",
    `## Top ${topN} (recommended package)`,
    "",
    "| # | Finding | Impact | Risk | Effort | Conf | Est. Lift |",
    "| - | ------- | ------ | ---- | ------ | ---- | --------: |",
    ...selected.map(
      (f, i) =>
        `| ${i + 1} | ${String(f.title).replace(/\|/g, "/").slice(0, 50)} | ${f.impact} | ${f.risk} | ${f.effortDays}d | ${f.confidence}% | +${f.lift} |`
    ),
    "",
    "## Model (honest)",
    "",
    "Heuristic diminishing-returns model — **not a guarantee**. Re-measure with `eng:audit` after OpenCode closes items (Measured state in Delivery Governance).",
    "",
  ].join("\n");

  writeText(engPath("programs", "ROI_OPTIMIZER.md"), md);
  return payload;
}
