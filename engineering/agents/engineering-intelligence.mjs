/**
 * Agent — Engineering Intelligence
 * Builds knowledge from every audit: recurrence, chronic vs new, resolved, reopened.
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import {
  loadFindingMemory,
  loadLatestAudit,
  loadPreviousAudit,
  dataPath,
  ensureDataLake,
} from "../lib/data-lake.mjs";
import { writeText, writeJson, engPath, isoNow, ensureDir } from "../lib/fs-utils.mjs";

const AGENT = "engineering-intelligence";

export async function run() {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const memory = loadFindingMemory();
  const items = Object.values(memory.items || {});
  const findings = [];

  const chronic = items
    .filter((i) => (i.occurrences || 0) >= 3 && i.status !== "resolved")
    .sort((a, b) => b.occurrences - a.occurrences);

  const reopened = items
    .filter((i) => i.status === "reopened" || (i.reopenedCount || 0) > 0)
    .sort((a, b) => (b.reopenedCount || 0) - (a.reopenedCount || 0));

  const resolved = items
    .filter((i) => i.status === "resolved")
    .sort((a, b) => String(b.resolvedAt || "").localeCompare(String(a.resolvedAt || "")));

  const newest = items
    .filter((i) => (i.occurrences || 0) === 1 && i.status === "open")
    .slice(0, 50);

  for (const c of chronic.slice(0, 25)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: c.severity === "critical" || c.severity === "high" ? c.severity : "medium",
        category: "chronic",
        title: `Chronic finding (${c.occurrences}×): ${c.title}`,
        evidence: `fingerprint=${c.fingerprint}; first=${c.firstSeen}; last=${c.lastSeen}; status=${c.status}`,
        files: c.files || [],
        suggestion: c.suggestion || "Treat as systemic — schedule OpenCode remediation with regression test.",
      })
    );
  }

  for (const r of reopened.slice(0, 15)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "high",
        category: "reopened",
        title: `Reopened after fix: ${r.title}`,
        evidence: `reopenedCount=${r.reopenedCount || 1}; fingerprint=${r.fingerprint}`,
        files: r.files || [],
        suggestion: "Root cause likely incomplete — add guard/test so it cannot regress.",
      })
    );
  }

  const latest = loadLatestAudit();
  const prev = latest ? loadPreviousAudit(latest.auditId) : null;
  let newCount = 0;
  let fixedCount = 0;
  if (latest && prev) {
    const prevSet = new Set(prev.fingerprints || []);
    const curSet = new Set(latest.fingerprints || []);
    for (const fp of curSet) if (!prevSet.has(fp)) newCount += 1;
    for (const fp of prevSet) if (!curSet.has(fp)) fixedCount += 1;
  }

  findings.push(
    finding({
      agent: AGENT,
      severity: "info",
      category: "memory-stats",
      title: "Finding memory inventory",
      evidence: `tracked=${memory.stats?.totalTracked ?? items.length}; open=${memory.stats?.open ?? "?"}; resolved=${memory.stats?.resolved ?? "?"}; reopened=${memory.stats?.reopened ?? "?"}; chronic=${memory.stats?.chronic ?? chronic.length}; newSincePrev=${newCount}; fixedSincePrev=${fixedCount}`,
    })
  );

  // Write intelligence knowledge base
  const kb = [
    "# Engineering Intelligence Memory",
    "",
    `**Updated:** ${isoNow()}`,
    "",
    "## Stats",
    "",
    `| Metric | Value |`,
    `| ------ | ----- |`,
    `| Tracked findings | ${memory.stats?.totalTracked ?? items.length} |`,
    `| Open | ${memory.stats?.open ?? "—"} |`,
    `| Resolved | ${memory.stats?.resolved ?? "—"} |`,
    `| Reopened | ${memory.stats?.reopened ?? "—"} |`,
    `| Chronic (≥3) | ${memory.stats?.chronic ?? chronic.length} |`,
    `| New since previous audit | ${newCount} |`,
    `| Fixed since previous audit | ${fixedCount} |`,
    "",
    "## Chronic Findings",
    "",
    ...chronic.slice(0, 20).flatMap((c) => [
      `### \`${c.fingerprint}\` — ${c.title}`,
      "",
      `- **Occurrences:** ${c.occurrences}`,
      `- **Status:** ${c.status}`,
      `- **First seen:** ${c.firstSeen}`,
      `- **Last seen:** ${c.lastSeen}`,
      `- **Reopened:** ${c.reopenedCount || 0}`,
      `- **Files:** ${(c.files || []).map((f) => `\`${f}\``).join(", ") || "—"}`,
      `- **Root cause hint:** ${c.suggestion || c.evidence || "investigate with OpenCode"}`,
      "",
    ]),
    "## Recently Resolved (OpenCode likely fixed)",
    "",
    ...resolved.slice(0, 15).map(
      (r) =>
        `- \`${r.fingerprint}\` ${r.title} _(resolved ${r.resolvedAt || "?"})_`
    ),
    "",
    "## Reopened (fix did not stick)",
    "",
    ...reopened
      .slice(0, 15)
      .map((r) => `- \`${r.fingerprint}\` ${r.title} ×${r.reopenedCount || 1}`),
    "",
    "## New Findings (this generation)",
    "",
    ...newest.slice(0, 20).map((n) => `- \`${n.fingerprint}\` [${n.severity}] ${n.title}`),
    "",
  ].join("\n");

  writeText(engPath("intelligence", "MEMORY.md"), kb);
  writeJson(dataPath("findings", "intelligence-summary.json"), {
    at: isoNow(),
    stats: memory.stats,
    newCount,
    fixedCount,
    chronicTop: chronic.slice(0, 20).map((c) => c.fingerprint),
    reopenedTop: reopened.slice(0, 15).map((r) => r.fingerprint),
  });

  const score = scoreFromFindings(findings, { maxDeduction: 40 });
  // Intelligence health: more resolved than chronic → higher
  const intelScore = Math.max(
    20,
    Math.min(
      100,
      70 +
        Math.min(20, fixedCount) -
        Math.min(25, chronic.length) -
        Math.min(20, (reopened[0]?.reopenedCount || 0) * 5)
    )
  );

  return writeAgentReport({
    name: "engineering-intelligence",
    title: "Engineering Intelligence Report",
    score: Math.round((score + intelScore) / 2),
    findings,
    sections: [
      {
        heading: "Learning Loop",
        body: [
          "This agent **learns across audits** via `engineering/data/findings/memory.json`.",
          "",
          `- New since previous: **${newCount}**`,
          `- Fixed since previous: **${fixedCount}**`,
          `- Chronic open: **${chronic.length}**`,
          `- Reopened: **${reopened.length}**`,
          "",
          "Full memory: `engineering/intelligence/MEMORY.md`",
        ].join("\n"),
      },
    ],
    meta: { newCount, fixedCount, chronic: chronic.length, reopened: reopened.length },
  });
}
