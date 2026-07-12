/**
 * Agent — Engineering Cost
 * Estimates fix cost (time/risk/LOC) for open findings — advisory only.
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { loadFindingMemory, dataPath, ensureDataLake, productOfPath } from "../lib/data-lake.mjs";
import { readText, writeText, writeJson, engPath, exists, abs, isoNow, ensureDir, lineCount } from "../lib/fs-utils.mjs";

const AGENT = "engineering-cost";

function locForFiles(files) {
  let total = 0;
  for (const f of files || []) {
    const content = readText(abs(f));
    if (content) total += lineCount(content);
  }
  return total;
}

function estimateDays({ severity, files, loc, occurrences, category }) {
  let days = 0.25;
  if (severity === "critical") days = 2;
  else if (severity === "high") days = 1;
  else if (severity === "medium") days = 0.5;
  else days = 0.25;

  days += Math.min(3, (files?.length || 0) * 0.15);
  days += Math.min(2, loc / 800);
  if ((occurrences || 0) >= 3) days += 0.5;
  if (/auth|authorization|schema|middleware/.test(category + (files || []).join(""))) days += 1;
  if (category === "unused-import" || category === "unused-export") days = Math.min(days, 0.25);
  return Math.round(days * 4) / 4; // quarter days
}

function impactLabel(severity) {
  if (severity === "critical") return "Critical";
  if (severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}

function riskLabel(files, category) {
  const blob = (files || []).join(" ") + category;
  if (/auth|authorization|middleware|schema\.prisma/.test(blob)) return "High";
  if ((files || []).length >= 5) return "Medium";
  return "Low";
}

export async function run() {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const memory = loadFindingMemory();
  let items = Object.values(memory.items || {}).filter(
    (i) => i.status === "open" || i.status === "reopened"
  );

  if (items.length < 5) {
    for (const name of ["technical-debt", "security", "architecture-drift"]) {
      const p = engPath("reports", `${name}.json`);
      if (!exists(p)) continue;
      try {
        const data = JSON.parse(readText(p));
        items = items.concat(
          (data.findings || [])
            .filter((f) => ["critical", "high", "medium"].includes(f.severity))
            .map((f) => ({ ...f, occurrences: 1, status: "open", fingerprint: f.id }))
        );
      } catch {
        /* ignore */
      }
    }
  }

  const costs = items.slice(0, 80).map((item) => {
    const files = item.files || [];
    const loc = locForFiles(files.slice(0, 8));
    const fixCostDays = estimateDays({
      severity: item.severity,
      files,
      loc,
      occurrences: item.occurrences,
      category: item.category,
    });
    return {
      fingerprint: item.fingerprint,
      title: item.title,
      category: item.category,
      severity: item.severity,
      impact: impactLabel(item.severity),
      files: files.length,
      fileList: files.slice(0, 8),
      loc,
      fixCostDays,
      fixCostLabel: fixCostDays <= 0.5 ? `${fixCostDays} day` : `${fixCostDays} days`,
      risk: riskLabel(files, item.category || ""),
      product: productOfPath(files[0] || ""),
    };
  });

  costs.sort((a, b) => b.fixCostDays - a.fixCostDays);

  const totalDays = Math.round(costs.reduce((s, c) => s + c.fixCostDays, 0) * 10) / 10;
  const findings = [
    finding({
      agent: AGENT,
      severity: "info",
      category: "cost-summary",
      title: `Estimated remediation backlog: ~${totalDays} engineer-days`,
      evidence: `${costs.length} costed items (sampled)`,
    }),
    ...costs.slice(0, 25).map((c) =>
      finding({
        agent: AGENT,
        severity: c.severity || "medium",
        category: "fix-cost",
        title: `${c.title}`,
        evidence: `Impact=${c.impact}; Files=${c.files}; LOC≈${c.loc}; Fix Cost=${c.fixCostLabel}; Risk=${c.risk}; Product=${c.product}`,
        files: c.fileList,
      })
    ),
  ];

  const md = [
    "# Engineering Cost Estimates",
    "",
    `**Generated:** ${isoNow()}  `,
    `**Backlog (sampled):** ~**${totalDays}** engineer-days`,
    "",
    "> Estimates are heuristic for prioritization — not contracts or invoices.",
    "",
    "| Issue | Impact | Files | LOC | Fix Cost | Risk | Product |",
    "| ----- | ------ | ----- | --- | -------- | ---- | ------- |",
    ...costs
      .slice(0, 40)
      .map(
        (c) =>
          `| ${c.title.replace(/\|/g, "/").slice(0, 60)} | ${c.impact} | ${c.files} | ${c.loc} | ${c.fixCostLabel} | ${c.risk} | ${c.product} |`
      ),
    "",
  ].join("\n");

  writeText(engPath("intelligence", "COSTS.md"), md);
  writeJson(dataPath("costs", "latest.json"), { at: isoNow(), totalDays, costs: costs.slice(0, 80) });

  return writeAgentReport({
    name: "engineering-cost",
    title: "Engineering Cost Report",
    score: scoreFromFindings(findings, { maxDeduction: 15 }),
    findings,
    sections: [{ heading: "Cost Model", body: md }],
    meta: { totalDays, items: costs.length },
  });
}
