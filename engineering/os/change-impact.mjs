/**
 * Module 2 — Change Impact Analysis
 * Before a refactor/wave: what products, tests, ADRs, risks are affected?
 */

import {
  ensureOsDirs,
  osPath,
  productOfPath,
  extractImports,
} from "./lib.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  writeText,
  writeJson,
  isoNow,
  abs,
  exists,
} from "../lib/fs-utils.mjs";
import { dataPath, loadFindingMemory } from "../lib/data-lake.mjs";
import { loadDecisions } from "../intelligence/architecture-memory/sync.mjs";

/**
 * @param {object} opts
 * @param {string} [opts.target] file path, symbol name, or product
 * @param {string} [opts.wave] optional wave label
 */
export async function analyzeChangeImpact(opts = {}) {
  ensureOsDirs();
  const target = opts.target || process.env.ENG_IMPACT_TARGET || "enforce";
  const wave = opts.wave || null;

  const graphPath = dataPath("os/graph", "latest.json");
  let graph = null;
  if (exists(graphPath)) {
    try {
      graph = JSON.parse(readText(graphPath));
    } catch {
      graph = null;
    }
  }

  const files = collectSourceFiles(["src"]);
  const affectedFiles = [];
  const products = new Set();
  const tests = [];
  const actions = [];

  const targetLower = target.toLowerCase();
  const isSymbol = !target.includes("/") && !target.includes("\\");

  for (const f of files) {
    const r = rel(f);
    const content = readText(f) || "";
    let hit = false;
    if (isSymbol) {
      hit = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(content);
    } else {
      hit =
        r === target.replace(/\\/g, "/") ||
        r.startsWith(target.replace(/\\/g, "/")) ||
        content.includes(target);
    }
    if (!hit) continue;
    affectedFiles.push(r);
    products.add(productOfPath(r));
    if (/__tests__|\.test\.|\.spec\./.test(r)) tests.push(r);
    if (r.startsWith("src/actions/")) actions.push(r);
  }

  // Importers of affected files (1-hop)
  const importers = [];
  for (const f of files) {
    const r = rel(f);
    const imps = extractImports(readText(f) || "");
    for (const imp of imps) {
      const norm = imp.replace(/^@\//, "src/");
      if (affectedFiles.some((af) => af.startsWith(norm) || af.includes(norm.replace(/^src\//, "")))) {
        importers.push(r);
        products.add(productOfPath(r));
      }
    }
  }

  const decisions = loadDecisions().filter((d) => {
    const blob = `${d.title} ${d.reason} ${d.pattern} ${(d.files || []).join(" ")}`.toLowerCase();
    return blob.includes(targetLower) || [...products].some((p) => (d.product || "").includes(p));
  });

  const memory = loadFindingMemory();
  const relatedFindings = Object.values(memory.items || {})
    .filter((i) => i.status === "open" || i.status === "reopened")
    .filter((i) =>
      (i.files || []).some((f) => affectedFiles.includes(f)) ||
      (i.title || "").toLowerCase().includes(targetLower)
    )
    .slice(0, 20);

  // Risk score
  let risk = 20;
  risk += Math.min(40, affectedFiles.length);
  risk += Math.min(20, products.size * 5);
  risk += relatedFindings.filter((f) => f.severity === "critical" || f.severity === "high").length * 5;
  if (["enforce", "authorize", "prisma", "auth"].includes(targetLower)) risk += 15;
  risk = Math.min(100, risk);
  const riskLevel = risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW";

  const report = {
    at: isoNow(),
    target,
    wave,
    risk,
    riskLevel,
    products: [...products],
    affectedFiles: affectedFiles.slice(0, 200),
    importers: [...new Set(importers)].slice(0, 100),
    tests: tests.slice(0, 50),
    actions: actions.slice(0, 50),
    adrs: decisions.map((d) => ({ id: d.id, title: d.title })),
    relatedFindings: relatedFindings.map((f) => ({
      fingerprint: f.fingerprint,
      title: f.title,
      severity: f.severity,
    })),
    graphStats: graph?.stats || null,
  };

  const md = [
    "# Change Impact Report",
    "",
    `**Generated:** ${report.at}  `,
    `**Target:** \`${target}\`  `,
    wave ? `**Wave:** ${wave}  ` : "",
    `**Risk:** **${riskLevel}** (${risk}/100)`,
    "",
    "## What will be affected?",
    "",
    `| Dimension | Count |`,
    `| --------- | ----- |`,
    `| Products | ${report.products.length} — ${report.products.join(", ") || "—"} |`,
    `| Files | ${affectedFiles.length} |`,
    `| Importers (1-hop) | ${report.importers.length} |`,
    `| Actions | ${actions.length} |`,
    `| Tests | ${tests.length} |`,
    `| ADRs | ${decisions.length} |`,
    `| Related open findings | ${relatedFindings.length} |`,
    "",
    "## Products",
    "",
    ...report.products.map((p) => `- ${p}`),
    "",
    "## ADRs in scope",
    "",
    ...decisions.map((d) => `- **${d.id}**: ${d.title}`),
    decisions.length ? "" : "_None matched._",
    "",
    "## Tests to run / extend",
    "",
    ...tests.slice(0, 25).map((t) => `- \`${t}\``),
    tests.length ? "" : "_No direct test files hit — add regression coverage before merge._",
    "",
    "## Related open findings",
    "",
    ...relatedFindings.map((f) => `- [${f.severity}] \`${f.fingerprint}\` ${f.title}`),
    "",
    "## Risks",
    "",
    riskLevel === "HIGH"
      ? "- High blast radius — require OpenCode wave plan + Engineering verify before merge."
      : riskLevel === "MEDIUM"
        ? "- Medium impact — run product smoke + targeted tests."
        : "- Localized change — still verify tenant/auth if touching boundaries.",
    "",
    "> This is an Impact Report for planning — OpenCode implements; Engineering verifies.",
    "",
  ].join("\n");

  writeText(osPath("IMPACT_REPORT.md"), md);
  writeJson(dataPath("os/impact", "latest.json"), report);
  if (target) {
    const safe = target.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
    writeJson(dataPath("os/impact", `${safe}.json`), report);
  }
  return report;
}
