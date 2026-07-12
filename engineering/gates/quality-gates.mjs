/**
 * Smart Quality Gates — FAIL/WARNING/PASS with delta reasons.
 */

import { GATES } from "../config.mjs";
import { gateStatus } from "../lib/findings.mjs";
import {
  loadLatestAudit,
  loadPreviousAudit,
  loadMetricsSeries,
  delta,
  deltaArrow,
  dataPath,
  ensureDataLake,
} from "../lib/data-lake.mjs";
import { readText, engPath, writeText, writeJson, isoNow, exists } from "../lib/fs-utils.mjs";

function loadScore(reportBase) {
  const jsonPath = engPath("reports", `${reportBase}.json`);
  if (!exists(jsonPath)) return null;
  try {
    return JSON.parse(readText(jsonPath)).score;
  } catch {
    return null;
  }
}

function mappingFromScores(scores = {}) {
  return {
    security: scores.security ?? scores.securityScore ?? loadScore("security"),
    performance: scores.performance ?? scores.performanceScore ?? loadScore("performance"),
    complexity: scores.complexity ?? scores.codeHealthScore ?? loadScore("code-health"),
    coverage: scores.coverage ?? scores.testScore ?? loadScore("testing"),
    documentation: scores.documentation ?? scores.documentationScore ?? loadScore("documentation"),
    deadCode: scores.deadCode ?? scores.codeHealthScore ?? loadScore("code-health"),
    dependencyHealth: scores.dependencyHealth ?? scores.dependencyScore ?? loadScore("dependencies"),
    architectureDrift:
      scores.architectureDrift ?? scores.architectureHealth ?? loadScore("architecture-drift"),
  };
}

function previousMapping() {
  const latest = loadLatestAudit();
  const prev = latest ? loadPreviousAudit(latest.auditId) : null;
  if (prev?.scores) return mappingFromScores(prev.scores);

  const series = loadMetricsSeries();
  if (series.length >= 2) {
    const s = series[series.length - 2];
    return mappingFromScores({
      securityScore: s.securityScore ?? s.security,
      performanceScore: s.performanceScore ?? s.performance,
      codeHealthScore: s.codeHealthScore ?? s.codeHealth,
      testScore: s.testScore,
      documentationScore: s.documentationScore,
      dependencyScore: s.dependencyScore,
      architectureHealth: s.architectureHealth ?? s.architecture,
    });
  }
  return {};
}

export function evaluateSmartGates(scores = {}) {
  ensureDataLake();
  const current = mappingFromScores(scores);
  const previous = previousMapping();
  const results = [];

  for (const [key, thresholds] of Object.entries(GATES)) {
    const score = current[key];
    const prev = previous[key];
    const d = delta(prev, score);
    const status = score == null ? "WARNING" : gateStatus(score, thresholds);

    let reason =
      score == null
        ? "No score artifact — run eng:audit first"
        : `score ${score} vs pass≥${thresholds.pass} warn≥${thresholds.warn}`;

    if (d != null) {
      const pct = prev ? Math.round((d / Math.max(1, prev)) * 100) : null;
      reason += ` · Δ ${d >= 0 ? "+" : ""}${d}`;
      if (pct != null) reason += ` (${pct >= 0 ? "+" : ""}${pct}% vs previous)`;
      if (status === "FAIL" && d < 0) {
        reason += ` · declining ${deltaArrow(d)}`;
      } else if (status === "FAIL" && d >= 0) {
        reason += ` · still below threshold despite ${deltaArrow(d)}`;
      }
    }

    results.push({
      gate: key,
      status,
      score,
      previous: prev ?? null,
      delta: d,
      arrow: deltaArrow(d),
      reason,
      thresholds,
    });
  }
  return results;
}

export function writeGatesReport(results) {
  const generatedAt = isoNow();
  const fails = results.filter((r) => r.status === "FAIL").length;
  const warns = results.filter((r) => r.status === "WARNING").length;
  const passes = results.filter((r) => r.status === "PASS").length;

  const md = [
    "# Smart Quality Gates",
    "",
    `**Generated:** ${generatedAt}  `,
    `**PASS:** ${passes} · **WARNING:** ${warns} · **FAIL:** ${fails}`,
    "",
    "> Gates include trend deltas vs previous audit in the data lake.",
    "",
    "| Gate | Status | Score | Prev | Δ | Reason |",
    "| ---- | ------ | ----- | ---- | - | ------ |",
    ...results.map(
      (r) =>
        `| ${r.gate} | **${r.status}** | ${r.score ?? "—"} | ${r.previous ?? "—"} | ${r.delta == null ? "—" : (r.delta >= 0 ? "+" : "") + r.delta + " " + r.arrow} | ${r.reason} |`
    ),
    "",
    "## FAIL Detail",
    "",
    ...results
      .filter((r) => r.status === "FAIL")
      .flatMap((r) => [
        `### ${r.gate}`,
        "",
        `- **Status:** FAIL`,
        `- **Reason:** ${r.reason}`,
        `- **Action:** OpenCode remediation — see \`engineering/intelligence/TOP10.md\``,
        "",
      ]),
    results.some((r) => r.status === "FAIL") ? "" : "_No FAIL gates._",
    "",
    "## Exit Semantics",
    "",
    "- Local advisory: exit 0 unless `--ci`",
    "- `--ci`: exit 1 if any FAIL",
    "",
  ].join("\n");

  writeText(engPath("reports", "quality-gates.md"), md);
  writeJson(engPath("reports", "quality-gates.json"), {
    generatedAt,
    results,
    passes,
    warns,
    fails,
    smart: true,
  });
  writeJson(dataPath("trends", "gates-latest.json"), { generatedAt, results });
  return { results, passes, warns, fails };
}

export function evaluateGates(scores) {
  return evaluateSmartGates(scores);
}

export function main(argv = process.argv.slice(2)) {
  const results = evaluateSmartGates();
  const summary = writeGatesReport(results);
  console.log(`Smart gates: PASS=${summary.passes} WARNING=${summary.warns} FAIL=${summary.fails}`);
  for (const r of summary.results) {
    console.log(`  [${r.status}] ${r.gate}: ${r.reason}`);
  }
  if (argv.includes("--ci") && summary.fails > 0) process.exitCode = 1;
}

if (process.argv[1]?.endsWith("quality-gates.mjs")) {
  main();
}
