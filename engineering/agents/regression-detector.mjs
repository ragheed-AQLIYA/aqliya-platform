/**
 * Agent — Regression Detector
 * Compares previous vs current audit (pre-merge / post-wave).
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import {
  listAuditIds,
  loadAudit,
  loadLatestAudit,
  loadPreviousAudit,
  delta,
  deltaArrow,
  dataPath,
  ensureDataLake,
} from "../lib/data-lake.mjs";
import { writeText, writeJson, engPath, isoNow, ensureDir } from "../lib/fs-utils.mjs";

const AGENT = "regression-detector";

const SCORE_KEYS = [
  ["overallRepositoryHealth", "Overall", "overall"],
  ["securityScore", "Security", "security"],
  ["performanceScore", "Performance", "performance"],
  ["codeHealthScore", "Code Health", "codeHealth"],
  ["architectureHealth", "Architecture Drift", "architecture"],
  ["documentationScore", "Documentation", null],
  ["testScore", "Tests", null],
  ["technicalDebtScore", "Technical Debt", "debt"],
  ["dependencyScore", "Dependencies", null],
];

function scoreOf(audit, key, short) {
  if (!audit?.scores) return null;
  return audit.scores[key] ?? (short ? audit.scores[short] : null) ?? null;
}

export async function run(options = {}) {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const ids = listAuditIds();
  let before = null;
  let after = null;

  if (options.beforeId && options.afterId) {
    before = loadAudit(options.beforeId);
    after = loadAudit(options.afterId);
  } else {
    after = loadLatestAudit();
    before = after ? loadPreviousAudit(after.auditId) : null;
  }

  const findings = [];
  const rows = [];

  if (!before || !after) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "bootstrap",
        title: "Need two audits to detect regressions",
        evidence: `audits available=${ids.length}`,
      })
    );
  } else {
    for (const [key, label, short] of SCORE_KEYS) {
      const a = scoreOf(before, key, short);
      const b = scoreOf(after, key, short);
      const d = delta(a, b);
      const arrow = deltaArrow(d);
      rows.push({ label, before: a, after: b, delta: d, arrow });

      if (d != null && d <= -5) {
        findings.push(
          finding({
            agent: AGENT,
            severity: d <= -10 ? "high" : "medium",
            category: "regression",
            title: `Regression: ${label} ${arrow} ${d}`,
            evidence: `${before.auditId}: ${a} → ${after.auditId}: ${b}`,
            suggestion: "Block merge if gate is FAIL and regression is security/architecture.",
          })
        );
      } else if (d != null && d >= 5) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "info",
            category: "improvement",
            title: `Improvement: ${label} ${arrow} +${d}`,
            evidence: `${a} → ${b}`,
          })
        );
      }
    }

    // Fingerprint-level regressions (new high/critical)
    const beforeSet = new Set(before.fingerprints || []);
    const afterSet = new Set(after.fingerprints || []);
    const introduced = [...afterSet].filter((fp) => !beforeSet.has(fp)).length;
    const removed = [...beforeSet].filter((fp) => !afterSet.has(fp)).length;
    findings.push(
      finding({
        agent: AGENT,
        severity: introduced > 20 ? "medium" : "info",
        category: "finding-delta",
        title: `Finding delta: +${introduced} new · −${removed} resolved`,
        evidence: `before=${before.findingCount} after=${after.findingCount}`,
      })
    );
  }

  const table = [
    "| Dimension | Before | After | Δ | Dir |",
    "| --------- | ------ | ----- | - | --- |",
    ...rows.map(
      (r) =>
        `| ${r.label} | ${r.before ?? "—"} | ${r.after ?? "—"} | ${r.delta == null ? "—" : (r.delta >= 0 ? "+" : "") + r.delta} | ${r.arrow} |`
    ),
  ].join("\n");

  const md = [
    "# Regression Detection",
    "",
    `**Generated:** ${isoNow()}`,
    before && after
      ? `**Compare:** \`${before.auditId}\` → \`${after.auditId}\``
      : "**Compare:** insufficient history",
    "",
    table,
    "",
    "> Use before merge / after OpenCode wave. Findings only — does not block git by itself unless `--ci`.",
    "",
  ].join("\n");

  writeText(engPath("intelligence", "REGRESSION.md"), md);
  writeJson(dataPath("regressions", "latest.json"), {
    at: isoNow(),
    before: before?.auditId,
    after: after?.auditId,
    rows,
  });

  const regressions = findings.filter((f) => f.category === "regression").length;
  const score = Math.max(15, 100 - regressions * 12);

  return writeAgentReport({
    name: "regression-detector",
    title: "Regression Detector Report",
    score,
    findings,
    sections: [{ heading: "Before → After", body: md }],
    meta: { before: before?.auditId, after: after?.auditId, rows },
  });
}
