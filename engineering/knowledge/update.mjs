/**
 * Phase 6 — Engineering Knowledge Base maintainer
 * Updates knowledge articles from recurring findings. Never modifies src/.
 */

import { readText, engPath, writeText, isoNow, exists, ensureDir } from "../lib/fs-utils.mjs";

function loadFindings(name) {
  const p = engPath("reports", `${name}.json`);
  if (!exists(p)) return [];
  try {
    return JSON.parse(readText(p)).findings || [];
  } catch {
    return [];
  }
}

function topCategories(findings, n = 10) {
  const map = new Map();
  for (const f of findings) {
    const k = f.category || "general";
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function updateKnowledgeBase() {
  ensureDir(engPath("knowledge"));
  const all = [
    "code-health",
    "security",
    "performance",
    "testing",
    "documentation",
    "ui-quality",
    "dependencies",
    "technical-debt",
    "architecture-drift",
  ].flatMap(loadFindings);

  const cats = topCategories(all, 15);
  const generatedAt = isoNow();

  writeText(
    engPath("knowledge", "recurring-patterns.md"),
    [
      "# Recurring Patterns",
      "",
      `**Updated:** ${generatedAt}`,
      "",
      "| Pattern / Category | Occurrences (latest audit) |",
      "| ------------------- | -------------------------- |",
      ...cats.map(([k, v]) => `| ${k} | ${v} |`),
      "",
      "These patterns are observational. Remediation belongs to OpenCode.",
      "",
    ].join("\n")
  );

  writeText(
    engPath("knowledge", "code-smells.md"),
    [
      "# Code Smells (from latest audit)",
      "",
      `**Updated:** ${generatedAt}`,
      "",
      ...all
        .filter((f) =>
          ["god-object", "long-function", "duplication", "complexity", "solid-srp"].includes(
            f.category
          )
        )
        .slice(0, 30)
        .map((f) => `- **${f.category}**: ${f.title} — ${f.evidence}`),
      "",
    ].join("\n")
  );

  writeText(
    engPath("knowledge", "common-issues.md"),
    [
      "# Common Issues",
      "",
      `**Updated:** ${generatedAt}`,
      "",
      "## Security",
      "",
      ...loadFindings("security")
        .slice(0, 15)
        .map((f) => `- [${f.severity}] ${f.title}`),
      "",
      "## Architecture Drift",
      "",
      ...loadFindings("architecture-drift")
        .slice(0, 15)
        .map((f) => `- [${f.severity}] ${f.title}`),
      "",
    ].join("\n")
  );

  writeText(
    engPath("knowledge", "review-history.md"),
    [
      "# Review History",
      "",
      `**Last audit:** ${generatedAt}`,
      "",
      "Append-only notes from Engineering Excellence runs.",
      "",
      `| ${generatedAt} | Full repository audit | findings=${all.length} |`,
      "",
    ].join("\n")
  );

  return { generatedAt, findings: all.length };
}
