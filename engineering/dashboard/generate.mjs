/**
 * Engineering Intelligence Dashboard
 * Trends, regressions, top risks, product highlights — not a flat snapshot.
 */

import { readText, engPath, writeText, writeJson, isoNow, exists } from "../lib/fs-utils.mjs";
import { calculateMetrics } from "../metrics/calculate.mjs";
import { evaluateGates } from "../gates/quality-gates.mjs";
import {
  loadMetricsSeries,
  sparkline,
  delta,
  deltaArrow,
  loadFindingMemory,
  loadLatestAudit,
  loadPreviousAudit,
} from "../lib/data-lake.mjs";
import { writeExecutiveDashboard } from "./scorecards.mjs";

function mapScores(s) {
  return {
    security: s.securityScore,
    performance: s.performanceScore,
    complexity: s.codeHealthScore,
    coverage: s.testScore,
    documentation: s.documentationScore,
    deadCode: s.codeHealthScore,
    dependencyHealth: s.dependencyScore,
    architectureDrift: s.architectureHealth,
  };
}

function loadJson(name) {
  const p = engPath("reports", `${name}.json`);
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

export function generateDashboard() {
  const metrics = calculateMetrics();
  const gates = evaluateGates(mapScores(metrics.scores));
  const series = loadMetricsSeries();
  const memory = loadFindingMemory();
  const latest = loadLatestAudit();
  const prev = latest ? loadPreviousAudit(latest.auditId) : null;
  const generatedAt = isoNow();

  const overallValues = series
    .map((s) => s.overallRepositoryHealth ?? s.overall)
    .filter((v) => v != null);
  const cur = metrics.scores.overallRepositoryHealth;
  const prevOverall =
    overallValues.length >= 2 ? overallValues[overallValues.length - 2] : prev?.scores?.overallRepositoryHealth;
  const dOverall = delta(prevOverall, cur);
  const spark = sparkline(overallValues, 12);

  const cards = [
    ["Overall Repository Health", cur],
    ["Security Score", metrics.scores.securityScore],
    ["Performance Score", metrics.scores.performanceScore],
    ["Code Quality", metrics.scores.codeHealthScore],
    ["Architecture Drift", metrics.scores.architectureHealth],
    ["Documentation", metrics.scores.documentationScore],
    ["Tests", metrics.scores.testScore],
    ["Technical Debt", metrics.scores.technicalDebtScore],
    ["Developer Experience", metrics.scores.developerExperience],
    ["Engineering Maturity", metrics.scores.engineeringMaturity],
  ];

  const open = Object.values(memory.items || {}).filter(
    (i) => i.status === "open" || i.status === "reopened"
  );
  const topRisks = open
    .filter((i) => i.severity === "critical" || i.severity === "high")
    .sort((a, b) => (b.occurrences || 0) - (a.occurrences || 0))
    .slice(0, 8);

  const topImprovements = Object.values(memory.items || {})
    .filter((i) => i.status === "resolved")
    .sort((a, b) => String(b.resolvedAt || "").localeCompare(String(a.resolvedAt || "")))
    .slice(0, 8);

  const regression = loadJson("regression-detector");
  const topRegressions = (regression?.findings || [])
    .filter((f) => f.category === "regression")
    .slice(0, 8);

  const exec = writeExecutiveDashboard(metrics.scores);
  const best = exec.cards?.[0];
  const worst = [...(exec.cards || [])].sort((a, b) => a.overall - b.overall)[0];

  const trendTable = [
    "| When | Overall | Security | Perf | Code | Arch | Debt |",
    "| ---- | ------- | -------- | ---- | ---- | ---- | ---- |",
    ...series.slice(-12).map((r) => {
      const o = r.overallRepositoryHealth ?? r.overall;
      return `| ${r.at} | ${o ?? "—"} | ${r.securityScore ?? r.security ?? "—"} | ${r.performanceScore ?? r.performance ?? "—"} | ${r.codeHealthScore ?? r.codeHealth ?? "—"} | ${r.architectureHealth ?? r.architecture ?? "—"} | ${r.technicalDebtScore ?? r.debt ?? "—"} |`;
    }),
  ].join("\n");

  const md = [
    "# AQLIYA Engineering Intelligence Dashboard",
    "",
    `**Generated:** ${generatedAt}  `,
    `**Mode:** Learn from history · OpenCode implements`,
    "",
    "## Repository Health",
    "",
    "```",
    `${spark}  ${cur ?? "—"}  ${dOverall == null ? "" : (dOverall >= 0 ? "↗ +" : "↘ ") + Math.abs(dOverall)}`,
    "```",
    "",
    dOverall == null
      ? "_Delta appears after ≥2 audits in `engineering/data/`._"
      : `Change vs previous audit: **${dOverall >= 0 ? "+" : ""}${dOverall}** ${deltaArrow(dOverall)}`,
    "",
    "## Scorecards",
    "",
    "| Area | Score |",
    "| ---- | ----- |",
    ...cards.map(([label, score]) => `| ${label} | ${score ?? "—"} |`),
    "",
    "## Smart Quality Gates",
    "",
    "| Gate | Status | Score | Prev | Δ | Reason |",
    "| ---- | ------ | ----- | ---- | - | ------ |",
    ...gates.map(
      (g) =>
        `| ${g.gate} | ${g.status} | ${g.score ?? "—"} | ${g.previous ?? "—"} | ${g.delta == null ? "—" : (g.delta >= 0 ? "+" : "") + g.delta} | ${g.reason} |`
    ),
    "",
    "## Top Risks",
    "",
    ...topRisks.map(
      (r) =>
        `- **[${r.severity}]** \`${r.fingerprint}\` ${r.title} _(×${r.occurrences || 1}, ${r.status})_`
    ),
    topRisks.length ? "" : "_No high/critical open findings in memory._",
    "",
    "## Top Improvements (resolved)",
    "",
    ...topImprovements.map(
      (r) => `- \`${r.fingerprint}\` ${r.title} _(resolved ${r.resolvedAt || "?"})_`
    ),
    topImprovements.length ? "" : "_No resolved findings yet — will fill as OpenCode fixes land._",
    "",
    "## Top Regressions",
    "",
    ...topRegressions.map((r) => `- ${r.title}`),
    topRegressions.length ? "" : "_No score regressions vs previous audit._",
    "",
    `**Most improved / strongest product:** ${best?.product ?? "—"} (${best?.overall ?? "—"})  `,
    `**Needs attention:** ${worst?.product ?? "—"} (${worst?.overall ?? "—"})`,
    "",
    "## Trend (data lake)",
    "",
    trendTable || "_No series yet._",
    "",
    "## Intelligence Artifacts",
    "",
    "| View | Path |",
    "| ---- | ---- |",
    "| Memory | [intelligence/MEMORY.md](../intelligence/MEMORY.md) |",
    "| Trends | [intelligence/TRENDS.md](../intelligence/TRENDS.md) |",
    "| Regression | [intelligence/REGRESSION.md](../intelligence/REGRESSION.md) |",
    "| Top 10 | [intelligence/TOP10.md](../intelligence/TOP10.md) |",
    "| Costs | [intelligence/COSTS.md](../intelligence/COSTS.md) |",
    "| Predictions | [intelligence/PREDICTIONS.md](../intelligence/PREDICTIONS.md) |",
    "| Architecture Memory | [intelligence/architecture-memory/INDEX.md](../intelligence/architecture-memory/INDEX.md) |",
    "| Product Scorecard | [PRODUCT_SCORECARD.md](./PRODUCT_SCORECARD.md) |",
    "| Executive | [EXECUTIVE.md](./EXECUTIVE.md) |",
    "",
    "## Operating Rules",
    "",
    "1. Never redesign products from this dashboard.",
    "2. Never auto-apply refactors.",
    "3. Respect Architecture Memory — do not recommend reverting accepted ADRs.",
    "4. Feed Top 10 to OpenCode for implementation.",
    "",
  ].join("\n");

  writeText(engPath("dashboard", "DASHBOARD.md"), md);
  writeJson(engPath("dashboard", "dashboard.json"), {
    generatedAt,
    scores: metrics.scores,
    gates,
    delta: dOverall,
    sparkline: spark,
    memoryStats: memory.stats,
  });

  const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AQLIYA Engineering Intelligence</title>
  <style>
    :root { --bg:#0b1220; --card:#152033; --text:#e8eef8; --muted:#8fa3bf; --accent:#4c9ffe; --pass:#3dd68c; --warn:#f5a524; --fail:#f31260; --up:#3dd68c; --down:#f31260; }
    body { margin:0; font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif; background:radial-gradient(1200px 600px at 10% -10%, #1a2b45, var(--bg)); color:var(--text); }
    main { max-width:1120px; margin:0 auto; padding:2rem 1.25rem 4rem; }
    h1 { font-size:1.85rem; margin:0 0 .35rem; letter-spacing:-.02em; }
    .sub { color:var(--muted); margin-bottom:1.5rem; }
    .hero { background:linear-gradient(135deg,#1b2d48,#132033); border:1px solid #243552; border-radius:16px; padding:1.25rem 1.4rem; margin-bottom:1.25rem; }
    .spark { font-size:1.6rem; letter-spacing:.08em; font-family:ui-monospace, Consolas, monospace; }
    .delta-up { color:var(--up); } .delta-down { color:var(--down); }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:.85rem; }
    .card { background:var(--card); border:1px solid #243552; border-radius:12px; padding:.9rem 1rem; }
    .card .label { color:var(--muted); font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; }
    .card .value { font-size:1.6rem; font-weight:700; margin-top:.3rem; }
    table { width:100%; border-collapse:collapse; margin-top:.75rem; font-size:.92rem; }
    th, td { text-align:left; padding:.5rem .4rem; border-bottom:1px solid #243552; }
    .PASS { color:var(--pass); } .WARNING { color:var(--warn); } .FAIL { color:var(--fail); }
    a { color:var(--accent); }
    ul { padding-left:1.1rem; } li { margin:.35rem 0; color:#d5deeb; }
    h2 { margin-top:1.75rem; font-size:1.15rem; }
  </style>
</head>
<body>
  <main>
    <h1>AQLIYA Engineering Intelligence</h1>
    <p class="sub">${generatedAt} · Audit → History → Trend → Recommendation</p>
    <div class="hero">
      <div class="label" style="color:var(--muted);font-size:.8rem;">Repository Health</div>
      <div class="spark">${spark || "—"}</div>
      <div style="font-size:2rem;font-weight:700;margin-top:.35rem;">${cur ?? "—"}
        <span class="${dOverall != null && dOverall >= 0 ? "delta-up" : "delta-down"}" style="font-size:1rem;margin-inline-start:.5rem;">
          ${dOverall == null ? "" : (dOverall >= 0 ? "↗ +" : "↘ ") + Math.abs(dOverall)}
        </span>
      </div>
    </div>
    <div class="grid">
      ${cards
        .map(
          ([label, score]) =>
            `<div class="card"><div class="label">${label}</div><div class="value">${score ?? "—"}</div></div>`
        )
        .join("\n")}
    </div>
    <h2>Smart Quality Gates</h2>
    <table>
      <thead><tr><th>Gate</th><th>Status</th><th>Score</th><th>Δ</th><th>Reason</th></tr></thead>
      <tbody>
        ${gates
          .map(
            (g) =>
              `<tr><td>${g.gate}</td><td class="${g.status}">${g.status}</td><td>${g.score ?? "—"}</td><td>${g.delta == null ? "—" : (g.delta >= 0 ? "+" : "") + g.delta}</td><td>${g.reason}</td></tr>`
          )
          .join("\n")}
      </tbody>
    </table>
    <h2>Top Risks</h2>
    <ul>${topRisks.map((r) => `<li><strong>[${r.severity}]</strong> ${r.title} (×${r.occurrences || 1})</li>`).join("") || "<li>None</li>"}</ul>
    <h2>Products</h2>
    <p>Strongest: <strong>${best?.product ?? "—"}</strong> · Attention: <strong>${worst?.product ?? "—"}</strong></p>
    <p style="margin-top:2rem;color:var(--muted)">Markdown: <a href="./DASHBOARD.md">DASHBOARD.md</a> · <a href="./EXECUTIVE.md">EXECUTIVE.md</a> · <a href="./PRODUCT_SCORECARD.md">PRODUCT_SCORECARD.md</a></p>
  </main>
</body>
</html>`;

  writeText(engPath("dashboard", "index.html"), html);
  return { metrics, gates, delta: dOverall };
}

export function main() {
  generateDashboard();
  console.log("Intelligence dashboard → engineering/dashboard/");
}

if (process.argv[1]?.endsWith("generate.mjs")) {
  main();
}
