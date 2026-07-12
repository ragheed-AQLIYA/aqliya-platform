/**
 * Phase 3 — Weekly Engineering Report
 */

import { readText, engPath, writeText, writeJson, isoNow, exists, REPO_ROOT } from "../lib/fs-utils.mjs";
import { calculateMetrics } from "../metrics/calculate.mjs";
import { evaluateGates } from "../gates/quality-gates.mjs";
import path from "node:path";

function load(name) {
  const p = engPath("reports", `${name}.json`);
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

function topFindings(reportName, n = 5) {
  const data = load(reportName);
  if (!data?.findings) return [];
  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return [...data.findings]
    .sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9))
    .slice(0, n);
}

function historyDelta() {
  const hist = readText(engPath("metrics", "history.jsonl"));
  if (!hist) return { coverageDelta: "n/a", debtDelta: "n/a", overallDelta: "n/a" };
  const lines = hist
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (lines.length < 2) {
    return { coverageDelta: "n/a (first run)", debtDelta: "n/a (first run)", overallDelta: "n/a (first run)" };
  }
  const prev = lines[lines.length - 2];
  const cur = lines[lines.length - 1];
  const fmt = (a, b) => {
    if (a == null || b == null) return "n/a";
    const d = b - a;
    return `${d >= 0 ? "+" : ""}${d}`;
  };
  return {
    overallDelta: fmt(prev.overall, cur.overall),
    debtDelta: fmt(prev.debt, cur.debt),
    coverageDelta: "n/a (coverage artifact optional)",
    securityDelta: fmt(prev.security, cur.security),
  };
}

export function generateWeeklyReport() {
  const metrics = calculateMetrics();
  const gates = evaluateGates();
  const deltas = historyDelta();
  const generatedAt = isoNow();

  const newRisks = [
    ...topFindings("security", 3),
    ...topFindings("architecture-drift", 2),
  ];
  const topRefactors = topFindings("technical-debt", 5);
  const topSecurity = topFindings("security", 5);
  const perf = topFindings("performance", 5);

  // Resolved risks: compare to previous weekly if present
  let resolvedNote = "_No prior weekly snapshot — resolved risks will appear next week._";
  const prevWeekly = engPath("reports", "weekly-previous.json");
  if (exists(prevWeekly)) {
    try {
      const prev = JSON.parse(readText(prevWeekly));
      const prevIds = new Set((prev.openFindingIds || []).map(String));
      const currentIds = new Set(
        ["security", "architecture-drift", "technical-debt"]
          .flatMap((n) => load(n)?.findings || [])
          .map((f) => f.id)
      );
      const resolved = [...prevIds].filter((id) => !currentIds.has(id));
      resolvedNote =
        resolved.length > 0
          ? resolved.map((id) => `- ${id}`).join("\n")
          : "_No previously tracked finding IDs cleared in this snapshot._";
    } catch {
      /* ignore */
    }
  }

  const openFindingIds = ["security", "architecture-drift", "technical-debt"]
    .flatMap((n) => load(n)?.findings || [])
    .map((f) => f.id);

  const md = [
    "# AQLIYA Engineering Weekly Report",
    "",
    `**Generated:** ${generatedAt}  `,
    `**Repository:** AQLIYA  `,
    `**Authority:** Engineering Excellence (findings) · OpenCode (implementation)`,
    "",
    "## Executive Summary",
    "",
    `- Overall Repository Health: **${metrics.scores.overallRepositoryHealth ?? "n/a"}/100**`,
    `- Engineering Maturity: **${metrics.scores.engineeringMaturity ?? "n/a"}/100**`,
    `- Gates: ${gates.filter((g) => g.status === "PASS").length} PASS · ${gates.filter((g) => g.status === "WARNING").length} WARNING · ${gates.filter((g) => g.status === "FAIL").length} FAIL`,
    `- Overall delta vs prior run: **${deltas.overallDelta}**`,
    "",
    "## Repository Health",
    "",
    "| Dimension | Score |",
    "| --------- | ----- |",
    `| Security | ${metrics.scores.securityScore ?? "—"} |`,
    `| Performance | ${metrics.scores.performanceScore ?? "—"} |`,
    `| Code Quality | ${metrics.scores.codeHealthScore ?? "—"} |`,
    `| Architecture | ${metrics.scores.architectureHealth ?? "—"} |`,
    `| Documentation | ${metrics.scores.documentationScore ?? "—"} |`,
    `| Tests | ${metrics.scores.testScore ?? "—"} |`,
    `| Technical Debt | ${metrics.scores.technicalDebtScore ?? "—"} |`,
    `| Dependencies | ${metrics.scores.dependencyScore ?? "—"} |`,
    "",
    "## New Risks",
    "",
    ...newRisks.map((f) => `- **[${f.severity}]** ${f.id}: ${f.title}`),
    newRisks.length ? "" : "_None ranked this week._",
    "",
    "## Resolved Risks",
    "",
    resolvedNote,
    "",
    "## Top Refactors",
    "",
    ...topRefactors.map((f) => `- ${f.id}: ${f.title} (\`${(f.files || [])[0] || "n/a"}\`)`),
    "",
    "## Top Security Findings",
    "",
    ...topSecurity.map((f) => `- **${f.severity}** ${f.title} — ${f.evidence}`),
    "",
    "## Performance Findings",
    "",
    ...perf.map((f) => `- **${f.severity}** ${f.title}`),
    "",
    "## Coverage Delta",
    "",
    deltas.coverageDelta,
    "",
    "## Technical Debt Delta",
    "",
    `Debt score delta: **${deltas.debtDelta}** (higher score = healthier / less debt pressure in our inverted health metric).`,
    "",
    "## Recommended OpenCode Focus",
    "",
    "1. Address FAIL quality gates first.",
    "2. Review `engineering/refactors/INDEX.md` for evidence-backed suggestions.",
    "3. Do not redesign products — fix boundaries, tests, and security gaps.",
    "",
    "---",
    "",
    `_Also written to repo root ENGINEERING_WEEKLY_REPORT.md_`,
    "",
  ].join("\n");

  writeText(engPath("reports", "ENGINEERING_WEEKLY_REPORT.md"), md);
  writeText(path.join(REPO_ROOT, "ENGINEERING_WEEKLY_REPORT.md"), md);

  // snapshot for next week resolved detection
  if (exists(engPath("reports", "weekly-current.json"))) {
    writeText(prevWeekly, readText(engPath("reports", "weekly-current.json")));
  }
  writeJson(engPath("reports", "weekly-current.json"), {
    generatedAt,
    openFindingIds,
    scores: metrics.scores,
  });

  return { generatedAt, scores: metrics.scores };
}

export function main() {
  generateWeeklyReport();
  console.log("Weekly report → ENGINEERING_WEEKLY_REPORT.md");
}

if (process.argv[1]?.endsWith("weekly-report.mjs")) {
  main();
}
