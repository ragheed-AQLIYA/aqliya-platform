/**
 * Phase 8 — Engineering Metrics
 * Continuously calculate health scores from agent artifacts.
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

  return {
    generatedAt: isoNow(),
    scores: {
      ...scores,
      maintainability,
      developerExperience,
      repositoryMaturity,
      engineeringMaturity,
      overallRepositoryHealth: avg,
    },
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
