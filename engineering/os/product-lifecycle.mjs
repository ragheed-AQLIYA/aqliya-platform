/**
 * Module 4 — Product Lifecycle Monitor
 * Vision → PRD → Domain → API → UX → Tests → Security → Performance → Pilot → Production
 */

import {
  ensureOsDirs,
  osPath,
  productOfPath,
  parseMaturityFromMatrix,
  stageStatus,
  pct,
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
  walkFiles,
} from "../lib/fs-utils.mjs";
import { dataPath, loadFindingMemory } from "../lib/data-lake.mjs";

const TRACKED = [
  { id: "AuditOS", paths: ["src/app/audit", "src/lib/audit"], docs: ["docs/products"] },
  { id: "DecisionOS", paths: ["src/app", "src/actions", "src/lib"], docHint: "decision" },
  { id: "LocalContentOS", paths: ["src/app/local-content", "src/lib/local-content"], docHint: "local-content" },
  { id: "SalesOS", paths: ["src/app/sales", "src/lib/sales"], docHint: "sales" },
  { id: "WorkflowOS", paths: ["src/app/workflowos", "src/lib/workflowos", "src/actions"], docHint: "workflow" },
  { id: "RiskOS", paths: ["src/app/risk"], docHint: "risk" },
  { id: "LocalContactOS", paths: ["src/app/contacts"], docHint: "contact" },
  { id: "ContentStudio", paths: ["src/app/content-studio"], docHint: "content" },
];

const STAGES = [
  "Vision",
  "PRD",
  "Domain",
  "API",
  "UX",
  "Tests",
  "Security",
  "Performance",
  "Pilot",
  "Production",
];

function hasDocs(hint) {
  if (!hint) return false;
  for (const root of ["docs/products", "docs/systems", "docs/engineering"]) {
    if (!exists(abs(root))) continue;
    for (const f of walkFiles([root], { extensions: new Set([".md"]) })) {
      if (rel(f).toLowerCase().includes(hint.toLowerCase())) return true;
    }
  }
  return false;
}

function maturityLevel(raw) {
  const m = String(raw || "").match(/L([0-6])/i);
  return m ? Number(m[1]) : 0;
}

export async function runProductLifecycleMonitor() {
  ensureOsDirs();
  const matrix = parseMaturityFromMatrix();
  const files = collectSourceFiles(["src"]);
  const memory = loadFindingMemory();
  const open = Object.values(memory.items || {}).filter(
    (i) => i.status === "open" || i.status === "reopened"
  );

  // Load compliance + performance scores if present
  let compliance = null;
  let perfScore = null;
  try {
    compliance = JSON.parse(readText(dataPath("os/compliance", "latest.json")) || "null");
  } catch {
    /* ignore */
  }
  try {
    const sec = JSON.parse(readText(abs("engineering/reports/security.json")) || "{}");
    var securityScore = sec.score ?? null;
  } catch {
    var securityScore = null;
  }
  try {
    const perf = JSON.parse(readText(abs("engineering/reports/performance.json")) || "{}");
    perfScore = perf.score ?? null;
  } catch {
    /* ignore */
  }

  const cards = [];

  for (const prod of TRACKED) {
    const productFiles = files.filter((f) =>
      prod.paths.some((p) => rel(f).startsWith(p)) || productOfPath(rel(f)) === prod.id
    );
    const hasRoutes = productFiles.some((f) => rel(f).includes("/app/"));
    const hasActions = productFiles.some((f) => /actions|\.ts$/.test(rel(f)));
    const hasTests = productFiles.some((f) => /__tests__|\.test\./.test(rel(f))) ||
      files.some((f) => rel(f).toLowerCase().includes(prod.id.toLowerCase().replace(/os$/, "")) && /test/.test(rel(f)));
    const docs = hasDocs(prod.docHint) || hasDocs(prod.id.toLowerCase());
    const matRaw = Object.entries(matrix).find(([k]) => k.includes(prod.id.replace("OS", "")) || k === prod.id)?.[1]
      || Object.entries(matrix).find(([k]) => k.toLowerCase().includes(prod.id.toLowerCase()))?.[1]
      || "";
    const level = maturityLevel(matRaw);
    const highFindings = open.filter(
      (i) => productOfPath((i.files || [])[0] || "") === prod.id && (i.severity === "high" || i.severity === "critical")
    ).length;

    const stages = {
      Vision: true,
      PRD: docs || level >= 1,
      Domain: productFiles.length > 5 || level >= 3,
      API: hasActions || hasRoutes,
      UX: hasRoutes,
      Tests: hasTests ? true : "warn",
      Security: securityScore == null ? "warn" : securityScore >= 70 ? true : securityScore >= 55 ? "warn" : false,
      Performance: perfScore == null ? "warn" : perfScore >= 70 ? true : perfScore >= 55 ? "warn" : false,
      Pilot: level >= 5,
      Production: level >= 6,
    };

    // Security warn if many high findings on product
    if (highFindings >= 3 && stages.Security === true) stages.Security = "warn";

    cards.push({
      product: prod.id,
      maturity: matRaw || `L${level}`,
      level,
      fileCount: productFiles.length,
      highFindings,
      stages,
      stageIcons: Object.fromEntries(
        STAGES.map((s) => [s, stageStatus(stages[s], stages[s] === "warn")])
      ),
    });
  }

  const payload = { at: isoNow(), stages: STAGES, products: cards };
  writeJson(dataPath("os/lifecycle", "latest.json"), payload);

  const header = `| Product | ${STAGES.join(" | ")} | Maturity |`;
  const sep = `| ------- | ${STAGES.map(() => "---").join(" | ")} | -------- |`;
  const rows = cards.map(
    (c) =>
      `| ${c.product} | ${STAGES.map((s) => c.stageIcons[s]).join(" | ")} | ${c.maturity.replace(/\|/g, "/").slice(0, 40)} |`
  );

  const md = [
    "# Product Lifecycle Monitor",
    "",
    `**Generated:** ${payload.at}`,
    "",
    header,
    sep,
    ...rows,
    "",
    "## Legend",
    "",
    "✅ complete · ⚠️ at risk / partial · ❌ missing",
    "",
    "Source of maturity: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` + code signals.",
    "",
  ].join("\n");

  writeText(osPath("PRODUCT_LIFECYCLE.md"), md);
  return payload;
}
