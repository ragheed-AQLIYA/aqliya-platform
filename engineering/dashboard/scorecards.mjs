/**
 * Product Scorecard + Executive Dashboard generators
 */

import {
  productOfPath,
  loadFindingMemory,
  loadMetricsSeries,
  sparkline,
  delta,
  deltaArrow,
  dataPath,
  ensureDataLake,
} from "../lib/data-lake.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  lineCount,
  writeText,
  writeJson,
  engPath,
  isoNow,
  ensureDir,
  exists,
} from "../lib/fs-utils.mjs";
import { estimateComplexity } from "../lib/ast-lite.mjs";

const PRODUCTS = [
  "Platform",
  "Core",
  "AuditOS",
  "DecisionOS",
  "LocalContentOS",
  "SalesOS",
  "WorkflowOS",
  "RiskOS",
  "LocalContactOS",
  "ContentStudio",
  "OfficeAI",
  "InstitutionalMemory",
];

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreProduct(stats, openFindings) {
  // Start from 100; subtract for size/complexity/open issues
  let score = 100;
  score -= Math.min(25, Math.floor(stats.loc / 500));
  score -= Math.min(20, Math.floor(stats.avgCx));
  score -= Math.min(30, openFindings.filter((f) => f.severity === "critical").length * 8);
  score -= Math.min(20, openFindings.filter((f) => f.severity === "high").length * 3);
  score -= Math.min(15, openFindings.filter((f) => f.severity === "medium").length * 0.5);
  if (stats.files > 0) {
    // light bonus for having tests nearby — approximate via test file ratio not available per product easily
  }
  return clamp(score);
}

export function buildProductScorecards() {
  ensureDataLake();
  const files = collectSourceFiles(["src"]);
  const statsMap = new Map(PRODUCTS.map((p) => [p, { product: p, files: 0, loc: 0, cx: 0 }]));

  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (/__tests__|\.test\.|\.spec\./.test(fileRel)) continue;
    const product = productOfPath(fileRel);
    const content = readText(absFile);
    if (!content) continue;
    const s = statsMap.get(product) || { product, files: 0, loc: 0, cx: 0 };
    s.files += 1;
    s.loc += lineCount(content);
    s.cx += estimateComplexity(content).fileScore;
    statsMap.set(product, s);
  }

  const memory = loadFindingMemory();
  const open = Object.values(memory.items || {}).filter(
    (i) => i.status === "open" || i.status === "reopened"
  );

  const cards = [];
  for (const [product, s] of statsMap) {
    if (s.files === 0 && product !== "Platform") continue;
    s.avgCx = s.files ? Math.round((s.cx / s.files) * 10) / 10 : 0;
    const related = open.filter((f) => productOfPath((f.files || [])[0] || "") === product);
    const security = related.filter((f) => f.agent === "security").length;
    const debt = related.filter((f) => f.agent === "technical-debt" || f.category === "risk-hotspot").length;
    const arch = related.filter((f) => f.agent === "architecture-drift").length;

    const overall = scoreProduct(s, related);
    cards.push({
      product,
      files: s.files,
      loc: s.loc,
      avgComplexity: s.avgCx,
      openFindings: related.length,
      security: clamp(100 - security * 10),
      performance: clamp(100 - Math.floor(s.avgCx * 1.5)),
      tests: clamp(85), // placeholder until per-product coverage exists
      architecture: clamp(100 - arch * 12),
      debt: clamp(100 - debt * 5),
      maintainability: clamp(100 - s.avgCx * 1.2 - Math.floor(s.loc / 800)),
      overall,
      trend: "=", // filled if history exists
      trendDelta: null,
    });
  }

  // Attach trend from previous product snapshot
  const prevPath = dataPath("products", "scorecard-latest.json");
  if (exists(prevPath)) {
    try {
      const prev = JSON.parse(readText(prevPath));
      const prevMap = new Map((prev.cards || []).map((c) => [c.product, c.overall]));
      for (const c of cards) {
        const p = prevMap.get(c.product);
        const d = delta(p, c.overall);
        c.trendDelta = d;
        c.trend = deltaArrow(d);
      }
    } catch {
      /* ignore */
    }
  }

  cards.sort((a, b) => b.overall - a.overall);
  return cards;
}

export function writeProductScorecards() {
  ensureDir(engPath("dashboard"));
  const cards = buildProductScorecards();
  const at = isoNow();

  const md = [
    "# Product Scorecard",
    "",
    `**Generated:** ${at}`,
    "",
    "| Product | Overall | Sec | Perf | Tests | Arch | Debt | Maint | LOC | Trend |",
    "| ------- | ------- | --- | ---- | ----- | ---- | ---- | ----- | --- | ----- |",
    ...cards.map(
      (c) =>
        `| ${c.product} | **${c.overall}** | ${c.security} | ${c.performance} | ${c.tests} | ${c.architecture} | ${c.debt} | ${c.maintainability} | ${c.loc} | ${c.trend}${c.trendDelta == null ? "" : " " + (c.trendDelta >= 0 ? "+" : "") + c.trendDelta} |`
    ),
    "",
  ].join("\n");

  writeText(engPath("dashboard", "PRODUCT_SCORECARD.md"), md);
  writeJson(dataPath("products", "scorecard-latest.json"), { at, cards });
  writeJson(dataPath("products", `scorecard-${at.replace(/[:.]/g, "-")}.json`), { at, cards });
  return cards;
}

export function writeExecutiveDashboard(platformScores = {}) {
  ensureDir(engPath("dashboard"));
  const cards = writeProductScorecards();
  const series = loadMetricsSeries();
  const overallValues = series.map((s) => s.overallRepositoryHealth ?? s.overall).filter((v) => v != null);
  const spark = sparkline(overallValues, 12);
  const cur = overallValues[overallValues.length - 1] ?? platformScores.overallRepositoryHealth ?? null;
  const prev = overallValues.length >= 2 ? overallValues[overallValues.length - 2] : null;
  const d = delta(prev, cur);

  const best = cards[0];
  const worst = [...cards].sort((a, b) => a.overall - b.overall)[0];

  const md = [
    "# Executive Dashboard — AQLIYA Platform",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "## Platform Health",
    "",
    "```",
    `Repository Health  ${spark}  ${cur ?? "—"}  ${d == null ? "" : (d >= 0 ? "↗ +" : "↘ ") + Math.abs(d)}`,
    "```",
    "",
    "| System | Score |",
    "| ------ | ----- |",
    `| **Platform (overall)** | **${cur ?? "—"}** |`,
    ...cards
      .filter((c) =>
        ["AuditOS", "WorkflowOS", "DecisionOS", "SalesOS", "LocalContentOS", "Core"].includes(
          c.product
        )
      )
      .map((c) => `| ${c.product} | ${c.overall} |`),
    "",
    `**Most improved / strongest:** ${best?.product ?? "—"} (${best?.overall ?? "—"})  `,
    `**Needs attention:** ${worst?.product ?? "—"} (${worst?.overall ?? "—"})`,
    "",
    "## Operating Model",
    "",
    "| Role | Authority |",
    "| ---- | --------- |",
    "| OpenCode | Implementation |",
    "| Cursor Engineering | Quality & Intelligence |",
    "| Program Governance | Architecture direction |",
    "",
    "See also: [PRODUCT_SCORECARD.md](./PRODUCT_SCORECARD.md) · [DASHBOARD.md](./DASHBOARD.md)",
    "",
  ].join("\n");

  writeText(engPath("dashboard", "EXECUTIVE.md"), md);
  writeJson(engPath("dashboard", "executive.json"), {
    at: isoNow(),
    platform: cur,
    delta: d,
    sparkline: spark,
    cards,
  });
  return { cur, d, cards };
}
