/**
 * Phase 5 — Auto Refactor Suggestions
 * Never changes application code. Writes suggestion markdown under engineering/refactors/.
 */

import { readText, engPath, writeText, writeJson, isoNow, exists, ensureDir } from "../lib/fs-utils.mjs";

const SOURCE_REPORTS = [
  "code-health",
  "security",
  "performance",
  "technical-debt",
  "architecture-drift",
];

function loadFindings(name) {
  const p = engPath("reports", `${name}.json`);
  if (!exists(p)) return [];
  try {
    return JSON.parse(readText(p)).findings || [];
  } catch {
    return [];
  }
}

function complexityFromSeverity(sev) {
  switch (sev) {
    case "critical":
      return "L";
    case "high":
      return "M";
    case "medium":
      return "S";
    default:
      return "XS";
  }
}

function riskFromSeverity(sev) {
  switch (sev) {
    case "critical":
      return "High — security/correctness";
    case "high":
      return "Medium-High — behavior or boundary risk";
    case "medium":
      return "Medium — maintainability";
    default:
      return "Low — cleanup";
  }
}

export function generateRefactorSuggestions() {
  ensureDir(engPath("refactors"));
  const suggestions = [];
  let idx = 0;

  for (const report of SOURCE_REPORTS) {
    const findings = loadFindings(report).filter((f) =>
      ["critical", "high", "medium"].includes(f.severity)
    );
    for (const f of findings.slice(0, 15)) {
      idx += 1;
      const id = `REF-${String(idx).padStart(3, "0")}`;
      const body = [
        `# ${id} — ${f.title}`,
        "",
        `**Source agent:** ${f.agent || report}  `,
        `**Generated:** ${isoNow()}  `,
        `**Status:** Suggestion only — NOT applied`,
        "",
        "## Problem",
        "",
        f.title,
        "",
        "## Evidence",
        "",
        f.evidence || "_n/a_",
        "",
        "## Files",
        "",
        ...(f.files?.length ? f.files.map((x) => `- \`${x}\``) : ["- _n/a_"]),
        "",
        "## Risk",
        "",
        riskFromSeverity(f.severity),
        "",
        "## Suggested Solution",
        "",
        f.suggestion ||
          "OpenCode should inspect evidence and apply the smallest safe fix following AGENTS.md.",
        "",
        "## Expected Benefit",
        "",
        `- Improves ${f.category || "engineering health"}`,
        "- Reduces future review cost",
        "- Strengthens gate scores without product redesign",
        "",
        "## Estimated Complexity",
        "",
        complexityFromSeverity(f.severity),
        "",
        "---",
        "",
        "_AQLIYA Engineering Excellence — OpenCode remains implementation authority._",
        "",
      ].join("\n");

      writeText(engPath("refactors", `${id}.md`), body);
      suggestions.push({
        id,
        title: f.title,
        agent: f.agent || report,
        severity: f.severity,
        files: f.files || [],
        complexity: complexityFromSeverity(f.severity),
      });
    }
  }

  const index = [
    "# Refactor Suggestions Index",
    "",
    `**Generated:** ${isoNow()}  `,
    `**Count:** ${suggestions.length}`,
    "",
    "> Never auto-applied. OpenCode chooses what to implement.",
    "",
    "| ID | Severity | Complexity | Title | Agent |",
    "| -- | -------- | ---------- | ----- | ----- |",
    ...suggestions.map(
      (s) =>
        `| [${s.id}](./${s.id}.md) | ${s.severity} | ${s.complexity} | ${s.title.replace(/\|/g, "/")} | ${s.agent} |`
    ),
    "",
  ].join("\n");

  writeText(engPath("refactors", "INDEX.md"), index);
  writeJson(engPath("refactors", "index.json"), { generatedAt: isoNow(), suggestions });
  return suggestions;
}

export function main() {
  const list = generateRefactorSuggestions();
  console.log(`Wrote ${list.length} refactor suggestions to engineering/refactors/`);
}

if (process.argv[1]?.endsWith("generate-refactors.mjs")) {
  main();
}
