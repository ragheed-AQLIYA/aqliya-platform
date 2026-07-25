/**
 * Phase 8 — Engineering Metrics
 * Continuously calculate health scores from agent artifacts.
 *
 * Two new governance metrics (2026-07-17):
 * - Scanner Confidence: measures scanner quality (precision, FP rate)
 * - Refactoring Debt: measures only real design issues (god objects, long functions, SRP, complexity)
 */

import { readText, engPath, writeText, writeJson, isoNow, exists, ensureDir } from "../lib/fs-utils.mjs";

const METRIC_SOURCES = {
  codeHealthScore: "code-health",
  securityScore: "security",
  performanceScore: "performance",
  documentationScore: "documentation",
  testScore: "testing",
  dependencyScore: "dependencies",
  technicalDebtScore: "technical-debt",
  architectureHealth: "architecture-drift",
  uiQualityScore: "ui-quality",
};

function load(name) {
  const p = engPath("reports", `${name}.json`);
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

/**
 * Scanner Confidence — how trustworthy are scanner results?
 * Derived from scanner-quality.json golden dataset metrics.
 * Returns { precision, falsePositiveRate, grade }.
 */
function calculateScannerConfidence() {
  const quality = load("scanner-quality");
  if (!quality?.quality) return { precision: null, falsePositiveRate: null, grade: "unknown" };

  const precision = quality.quality.precision ?? null;
  const fpRate = quality.quality.falsePositiveRate ?? null;

  // Grade: A (≥80%), B (≥60%), C (≥40%), D (<40%)
  let grade = "D";
  if (precision != null) {
    if (precision >= 80) grade = "A";
    else if (precision >= 60) grade = "B";
    else if (precision >= 40) grade = "C";
  }

  return { precision, falsePositiveRate: fpRate, grade };
}

/**
 * Refactoring Debt — measures only real design-level issues.
 * Excludes noise (unused imports, dead code, test-only signals).
 * Score: 100 = no design debt, 0 = severe design debt.
 *
 * Categories counted:
 * - god-object: files >1000 lines or >30 exports
 * - long-function: functions >100 lines
 * - solid-srp: single-responsibility violations
 * - complexity: high cyclomatic complexity
 */
function calculateRefactoringDebt() {
  const codeHealth = load("code-health");
  if (!codeHealth?.findings) return null;

  const DESIGN_CATEGORIES = ["god-object", "long-function", "solid-srp", "complexity"];

  const designFindings = codeHealth.findings.filter((f) =>
    DESIGN_CATEGORIES.includes(f.category)
  );

  if (designFindings.length === 0) return 100;

  // Weight by severity: critical=5, high=3, medium=1, low=0.5
  const severityWeight = { critical: 5, high: 3, medium: 1, low: 0.5, info: 0 };
  const weightedSum = designFindings.reduce(
    (sum, f) => sum + (severityWeight[f.severity] ?? 0.5),
    0
  );

  // Cap at 85 (same formula as other scores)
  const penalty = Math.min(85, weightedSum);
  return Math.round(100 - penalty);
}

export function calculateMetrics() {
  const scores = {};
  for (const [metric, report] of Object.entries(METRIC_SOURCES)) {
    const data = load(report);
    scores[metric] = data?.score ?? null;
  }

  const present = Object.values(scores).filter((v) => v != null);
  const avg = present.length
    ? Math.round(present.reduce((a, b) => a + b, 0) / present.length)
    : null;

  // Composite maturity scores
  const repositoryMaturity = avg;
  const engineeringMaturity = avg == null
    ? null
    : Math.round(
        avg * 0.7 +
          (scores.documentationScore ?? avg) * 0.15 +
          (scores.testScore ?? avg) * 0.15
      );
  const developerExperience = avg == null
    ? null
    : Math.round(
        ((scores.codeHealthScore ?? 50) +
          (scores.documentationScore ?? 50) +
          (scores.dependencyScore ?? 50)) /
          3
      );
  const maintainability = scores.technicalDebtScore;

  // New governance metrics
  const scannerConfidence = calculateScannerConfidence();
  const refactoringDebt = calculateRefactoringDebt();

  return {
    generatedAt: isoNow(),
    scores: {
      ...scores,
      maintainability,
      developerExperience,
      repositoryMaturity,
      engineeringMaturity,
      overallRepositoryHealth: avg,
      // Governance metrics — not averaged into health, displayed separately
      scannerConfidence: scannerConfidence.precision,
      scannerGrade: scannerConfidence.grade,
      refactoringDebt,
    },
    scannerConfidence,
  };
}

export function writeMetrics(metrics) {
  ensureDir(engPath("metrics"));
  const s = metrics.scores;
  const md = [
    "# Engineering Metrics",
    "",
    `**Generated:** ${metrics.generatedAt}`,
    "",
    "| Metric | Score |",
    "| ------ | ----- |",
    ...Object.entries(s).map(([k, v]) => `| ${k} | ${v ?? "—"} |`),
    "",
    "## Interpretation",
    "",
    "- 80–100: healthy",
    "- 60–79: watch",
    "- <60: prioritize remediation via OpenCode",
    "",
    "> Metrics are advisory. They do not change product architecture.",
    "",
  ].join("\n");

  writeText(engPath("metrics", "current.md"), md);
  writeJson(engPath("metrics", "current.json"), metrics);

  // Append history for trends
  const historyPath = engPath("metrics", "history.jsonl");
  const line = JSON.stringify({
    at: metrics.generatedAt,
    overall: s.overallRepositoryHealth,
    security: s.securityScore,
    performance: s.performanceScore,
    codeHealth: s.codeHealthScore,
    architecture: s.architectureHealth,
    debt: s.technicalDebtScore,
    scannerConfidence: s.scannerConfidence,
    scannerGrade: s.scannerGrade,
    refactoringDebt: s.refactoringDebt,
  });
  const prev = exists(historyPath) ? readText(historyPath) : "";
  writeText(historyPath, (prev || "") + line + "\n");

  return metrics;
}

export function main() {
  const metrics = writeMetrics(calculateMetrics());
  console.log("Engineering metrics written to engineering/metrics/current.md");
  console.log(`Overall: ${metrics.scores.overallRepositoryHealth ?? "n/a"}`);
}

if (process.argv[1]?.endsWith("calculate.mjs")) {
  main();
}
