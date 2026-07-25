/**
 * Markdown / JSON report writers.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { engPath, writeText, writeJson, isoNow, ensureDir } from "./fs-utils.mjs";
import { groupBySeverity, summarizeFindings } from "./findings.mjs";

export function reportsDir() {
  const d = engPath("reports");
  ensureDir(d);
  return d;
}

export function writeAgentReport({
  name,
  title,
  score,
  findings,
  sections = [],
  meta = {},
}) {
  const summary = summarizeFindings(findings);
  const grouped = groupBySeverity(findings);
  const generatedAt = isoNow();

  const md = [
    `# ${title}`,
    "",
    `**Agent:** ${name}  `,
    `**Generated:** ${generatedAt}  `,
    `**Score:** ${score}/100  `,
    `**Findings:** ${summary.total} (critical ${summary.critical}, high ${summary.high}, medium ${summary.medium}, low ${summary.low}, info ${summary.info})`,
    "",
    "> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.",
    "",
    "## Summary",
    "",
    `| Severity | Count |`,
    `| -------- | ----- |`,
    `| critical | ${summary.critical} |`,
    `| high | ${summary.high} |`,
    `| medium | ${summary.medium} |`,
    `| low | ${summary.low} |`,
    `| info | ${summary.info} |`,
    "",
  ];

  for (const section of sections) {
    md.push(`## ${section.heading}`, "");
    md.push(section.body.trim(), "");
  }

  for (const sev of ["critical", "high", "medium", "low", "info"]) {
    const list = grouped[sev];
    if (!list.length) continue;
    md.push(`## ${sev.toUpperCase()} Findings`, "");
    for (const f of list) {
      md.push(`### ${f.id} — ${f.title}`);
      md.push("");
      md.push(`- **Category:** ${f.category}`);
      if (f.files?.length) md.push(`- **Files:** ${f.files.map((x) => `\`${x}\``).join(", ")}`);
      md.push(`- **Evidence:** ${f.evidence}`);
      if (f.suggestion) md.push(`- **Suggestion:** ${f.suggestion}`);
      md.push("");
    }
  }

  if (!findings.length) {
    md.push("## Findings", "", "_No findings in this run._", "");
  }

  md.push("---", "", `_AQLIYA Engineering Excellence · ${name}_`, "");

  const base = path.join(reportsDir(), name);
  writeText(`${base}.md`, md.join("\n"));
  writeJson(`${base}.json`, {
    agent: name,
    title,
    generatedAt,
    score,
    summary,
    findings,
    meta,
    scannerQuality: loadScannerQuality(),
  });

  return { score, summary, path: `${base}.md` };
}

export function writeNamedMarkdown(relativeName, content) {
  const file = path.join(reportsDir(), relativeName);
  writeText(file, content.endsWith("\n") ? content : content + "\n");
  return file;
}

/**
 * Load scanner quality metrics from scanner-quality.json if available.
 * Returns null if not found.
 */
export function loadScannerQuality() {
  try {
    const file = path.join(reportsDir(), "scanner-quality.json");
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, "utf8"));
    }
  } catch {
    // Quality metrics not available
  }
  return null;
}

/**
 * Write scanner quality metrics to scanner-quality.json
 */
export function writeScannerQuality(qualityData) {
  const file = path.join(reportsDir(), "scanner-quality.json");
  writeJson(file, qualityData);
  return file;
}
