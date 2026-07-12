/**
 * Agent — Trend Analysis
 * Snapshot → Trend with deltas and likely drivers.
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import {
  loadMetricsSeries,
  sparkline,
  delta,
  deltaArrow,
  dataPath,
  ensureDataLake,
} from "../lib/data-lake.mjs";
import { writeText, writeJson, engPath, isoNow, ensureDir } from "../lib/fs-utils.mjs";

const AGENT = "trend-analysis";

const DIMENSIONS = [
  ["overallRepositoryHealth", "Overall"],
  ["securityScore", "Security"],
  ["performanceScore", "Performance"],
  ["codeHealthScore", "Code Health"],
  ["architectureHealth", "Architecture"],
  ["documentationScore", "Documentation"],
  ["testScore", "Tests"],
  ["technicalDebtScore", "Tech Debt"],
  ["dependencyScore", "Dependencies"],
];

export async function run() {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const series = loadMetricsSeries();
  const findings = [];
  const trends = [];

  const prev = series.length >= 2 ? series[series.length - 2] : null;
  const cur = series.length ? series[series.length - 1] : null;

  for (const [key, label] of DIMENSIONS) {
    const values = series.map((s) => s[key] ?? s[key.replace("Score", "")] ?? null);
    // also accept short keys from history.jsonl migration
    const shortMap = {
      overallRepositoryHealth: "overall",
      securityScore: "security",
      performanceScore: "performance",
      codeHealthScore: "codeHealth",
      architectureHealth: "architecture",
      technicalDebtScore: "debt",
    };
    const short = shortMap[key];
    const vals = series.map((s) => s[key] ?? (short ? s[short] : null)).filter((v) => v != null);
    const current = cur ? cur[key] ?? cur[short] : null;
    const previous = prev ? prev[key] ?? prev[short] : null;
    const d = delta(previous, current);
    trends.push({
      key,
      label,
      previous,
      current,
      delta: d,
      arrow: deltaArrow(d),
      sparkline: sparkline(vals, 10),
    });

    if (d != null && Math.abs(d) >= 5) {
      findings.push(
        finding({
          agent: AGENT,
          severity: d < -8 ? "high" : d < 0 ? "medium" : "info",
          category: d >= 0 ? "improvement" : "regression-trend",
          title: `${label} ${d >= 0 ? "improved" : "declined"} ${d >= 0 ? "+" : ""}${d}`,
          evidence: `${previous} → ${current} · ${sparkline(vals, 8)}`,
          suggestion:
            d < 0
              ? `Investigate what changed in ${label} since previous audit.`
              : `Preserve the change that improved ${label}.`,
        })
      );
    }
  }

  if (series.length < 2) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "bootstrap",
        title: "Insufficient history for trends (need ≥2 audits in data lake)",
        evidence: `series length=${series.length}`,
      })
    );
  }

  const md = [
    "# Trend Analysis",
    "",
    `**Updated:** ${isoNow()}  `,
    `**Audits in series:** ${series.length}`,
    "",
    "| Dimension | Prev | Current | Δ | Trend | Sparkline |",
    "| --------- | ---- | ------- | - | ----- | --------- |",
    ...trends.map(
      (t) =>
        `| ${t.label} | ${t.previous ?? "—"} | ${t.current ?? "—"} | ${t.delta == null ? "—" : (t.delta >= 0 ? "+" : "") + t.delta} | ${t.arrow} | \`${t.sparkline}\` |`
    ),
    "",
    "## Interpretation",
    "",
    "- ↑ improvement (higher score is healthier)",
    "- ↓ regression",
    "- = unchanged",
    "",
    "Drivers are inferred from score movement; OpenCode owns root-cause confirmation.",
    "",
  ].join("\n");

  writeText(engPath("intelligence", "TRENDS.md"), md);
  writeText(dataPath("trends", "latest.md"), md);
  writeJson(dataPath("trends", "latest.json"), { at: isoNow(), seriesLength: series.length, trends });

  const score = scoreFromFindings(findings, { maxDeduction: 30 });
  return writeAgentReport({
    name: "trend-analysis",
    title: "Trend Analysis Report",
    score: series.length >= 2 ? Math.max(score, 60) : 50,
    findings,
    sections: [{ heading: "Trends", body: md }],
    meta: { seriesLength: series.length, trends },
  });
}
