/**
 * Agent — Recommendation Ranking
 * Ranks refactors by ROI / Impact / Risk / Difficulty / Confidence → Top 10.
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings, SEVERITY } from "../lib/findings.mjs";
import { loadFindingMemory, dataPath, ensureDataLake, productOfPath } from "../lib/data-lake.mjs";
import { readText, writeText, writeJson, engPath, exists, isoNow, ensureDir } from "../lib/fs-utils.mjs";

const AGENT = "recommendation-ranking";

function severityWeight(sev) {
  return SEVERITY[sev] ?? 1;
}

function estimateDifficulty(item) {
  const files = (item.files || []).length;
  if (files >= 8) return 5;
  if (files >= 4) return 4;
  if (files >= 2) return 3;
  if ((item.occurrences || 0) >= 5) return 4;
  return 2;
}

function estimateImpact(item) {
  let impact = severityWeight(item.severity) * 2;
  if ((item.occurrences || 0) >= 3) impact += 3;
  if ((item.reopenedCount || 0) > 0) impact += 4;
  if (["layer-violation", "A01", "A02", "n-plus-one", "chronic"].includes(item.category)) {
    impact += 3;
  }
  return Math.min(10, impact);
}

function estimateRisk(item) {
  // Risk of making the change (not risk of leaving it)
  const files = (item.files || []).length;
  if (/auth|authorization|middleware|prisma\/schema/.test((item.files || []).join(" "))) return 5;
  if (files >= 5) return 4;
  if (item.category === "unused-import" || item.category === "unused-export") return 1;
  return 2;
}

function estimateConfidence(item) {
  let c = 0.55;
  if ((item.occurrences || 0) >= 3) c += 0.15;
  if (item.files?.length) c += 0.1;
  if (item.suggestion) c += 0.1;
  if (item.category === "unused-import") c -= 0.15; // heuristic noise
  return Math.max(0.3, Math.min(0.95, c));
}

function estimateRoi(impact, difficulty, risk, confidence) {
  // Higher impact, lower difficulty/risk → higher ROI
  return Math.round(((impact * confidence) / Math.max(1, difficulty * 0.6 + risk * 0.4)) * 10) / 10;
}

export async function run() {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const memory = loadFindingMemory();
  const open = Object.values(memory.items || {}).filter(
    (i) => i.status === "open" || i.status === "reopened"
  );

  // Also pull latest technical-debt / security findings if memory empty
  let pool = open;
  if (pool.length < 5) {
    for (const name of ["technical-debt", "security", "architecture-drift", "code-health"]) {
      const p = engPath("reports", `${name}.json`);
      if (!exists(p)) continue;
      try {
        const data = JSON.parse(readText(p));
        for (const f of data.findings || []) {
          if (!["critical", "high", "medium"].includes(f.severity)) continue;
          pool.push({
            fingerprint: f.id,
            ...f,
            occurrences: 1,
            status: "open",
            files: f.files || [],
          });
        }
      } catch {
        /* ignore */
      }
    }
  }

  const ranked = pool
    .map((item) => {
      const impact = estimateImpact(item);
      const difficulty = estimateDifficulty(item);
      const risk = estimateRisk(item);
      const confidence = estimateConfidence(item);
      const roi = estimateRoi(impact, difficulty, risk, confidence);
      return {
        fingerprint: item.fingerprint,
        title: item.title,
        agent: item.agent,
        category: item.category,
        severity: item.severity,
        files: item.files || [],
        product: productOfPath((item.files || [])[0] || ""),
        occurrences: item.occurrences || 1,
        impact,
        difficulty,
        risk,
        confidence: Math.round(confidence * 100),
        roi,
        suggestion: item.suggestion || "",
      };
    })
    .sort((a, b) => b.roi - a.roi || b.impact - a.impact);

  // Deduplicate by title+first file
  const seen = new Set();
  const unique = [];
  for (const r of ranked) {
    const k = `${r.title}::${(r.files || [])[0] || ""}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(r);
  }

  const top10 = unique.slice(0, 10);
  const findings = top10.map((r, i) =>
    finding({
      agent: AGENT,
      severity: r.severity || "medium",
      category: "ranked-recommendation",
      title: `#${i + 1} ROI ${r.roi} — ${r.title}`,
      evidence: `impact=${r.impact}/10 difficulty=${r.difficulty}/5 risk=${r.risk}/5 confidence=${r.confidence}% product=${r.product} occurrences=${r.occurrences}`,
      files: r.files,
      suggestion: r.suggestion || "OpenCode should implement smallest safe fix.",
    })
  );

  const md = [
    "# Top 10 Ranked Recommendations",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "| Rank | ROI | Impact | Diff | Risk | Conf | Product | Title |",
    "| ---- | --- | ------ | ---- | ---- | ---- | ------- | ----- |",
    ...top10.map(
      (r, i) =>
        `| ${i + 1} | **${r.roi}** | ${r.impact} | ${r.difficulty} | ${r.risk} | ${r.confidence}% | ${r.product} | ${r.title.replace(/\|/g, "/")} |`
    ),
    "",
    "## Ranking Model",
    "",
    "```",
    "ROI ≈ (Impact × Confidence) / (0.6×Difficulty + 0.4×Risk)",
    "```",
    "",
    "OpenCode remains implementation authority. This list is advisory.",
    "",
    ...top10.flatMap((r, i) => [
      `### ${i + 1}. ${r.title}`,
      "",
      `- **Fingerprint:** \`${r.fingerprint}\``,
      `- **Files:** ${(r.files || []).map((f) => `\`${f}\``).join(", ") || "—"}`,
      `- **Suggestion:** ${r.suggestion || "—"}`,
      "",
    ]),
  ].join("\n");

  writeText(engPath("intelligence", "TOP10.md"), md);
  writeJson(dataPath("recommendations", "top10.json"), { at: isoNow(), top10 });
  writeText(engPath("refactors", "TOP10.md"), md);

  return writeAgentReport({
    name: "recommendation-ranking",
    title: "Recommendation Ranking Report",
    score: scoreFromFindings(findings, { maxDeduction: 20 }),
    findings,
    sections: [{ heading: "Top 10", body: md }],
    meta: { top10 },
  });
}
