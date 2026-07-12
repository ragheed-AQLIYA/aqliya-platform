/**
 * Program registry + product completion bars (Program B)
 */

import { engPath, ensureDir, writeText, writeJson, readText, isoNow, exists, abs } from "../lib/fs-utils.mjs";
import { dataPath, ensureDataLake, productOfPath } from "../lib/data-lake.mjs";
import { parseMaturityFromMatrix } from "../os/lib.mjs";

export const PROGRAMS = {
  A: {
    id: "A",
    name: "Platform Completion",
    scope: [
      "Authorization",
      "Feature Flags",
      "Platform Settings",
      "Organizations",
      "Audit Trail",
      "Notification Infrastructure",
      "Background Jobs",
      "Download Center",
      "AI Gateway",
      "Observability",
    ],
  },
  B: {
    id: "B",
    name: "Product Completion",
    products: [
      "DecisionOS",
      "WorkflowOS",
      "SalesOS",
      "AuditOS",
      "LocalContentOS",
      "RiskOS",
      "LocalContactOS",
      "ContentStudio",
    ],
  },
  C: {
    id: "C",
    name: "Engineering Excellence",
    scope: ["KPIs", "Compliance", "Findings", "Verification", "Release Readiness"],
  },
  D: {
    id: "D",
    name: "Architecture Governance",
    scope: [
      "ADRs",
      "Domain Boundaries",
      "Context Maps",
      "Architecture Reviews",
      "Technical Standards",
      "Reference Architecture",
      "Design Decisions",
    ],
  },
  E: {
    id: "E",
    name: "Delivery Governance",
    states: [
      "backlog",
      "selected",
      "assigned",
      "in_progress",
      "verification",
      "accepted",
      "released",
      "measured",
    ],
  },
};

export function ensureProgramsDirs() {
  ensureDataLake();
  ensureDir(engPath("programs"));
  ensureDir(dataPath("programs"));
  ensureDir(dataPath("programs", "waves"));
}

function bar(pct) {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function maturityToPct(raw) {
  const m = String(raw || "").match(/L([0-6])/i);
  if (!m) return 40;
  return Math.round((Number(m[1]) / 6) * 100);
}

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

/**
 * Product completion % = blend of maturity level + open high findings pressure + release ready.
 */
export function computeProductCompletion() {
  ensureProgramsDirs();
  const matrix = parseMaturityFromMatrix();
  const release = loadJson(dataPath("os/release", "latest.json"));
  const scorecard = loadJson(dataPath("products", "scorecard-latest.json"));
  const life = loadJson(dataPath("os/findings", "lifecycle.json"));

  const openByProduct = {};
  for (const item of Object.values(life?.items || {})) {
    if (!["finding", "prioritized", "assigned", "implemented"].includes(item.state)) continue;
    const p = item.product || productOfPath((item.files || [])[0] || "") || "Platform";
    if (!["critical", "high"].includes(item.severity)) continue;
    openByProduct[p] = (openByProduct[p] || 0) + 1;
  }

  const products = [];
  for (const name of PROGRAMS.B.products) {
    const matEntry = Object.entries(matrix).find(
      ([k]) => k === name || k.includes(name.replace("OS", "")) || k.toLowerCase().includes(name.toLowerCase())
    );
    const matPct = maturityToPct(matEntry?.[1]);
    const releaseCard = (release?.cards || []).find((c) => c.product === name);
    const releasePct = releaseCard?.ready ?? matPct;
    const score = (scorecard?.cards || []).find((c) => c.product === name)?.overall;
    const openHigh = openByProduct[name] || 0;
    const pressure = Math.min(25, openHigh * 3);
    // Blend: maturity 50% + release 30% + scorecard 20% − pressure
    let pct = Math.round(
      matPct * 0.5 + releasePct * 0.3 + (score != null ? score : matPct) * 0.2 - pressure
    );
    pct = Math.max(5, Math.min(100, pct));
    products.push({
      product: name,
      pct,
      bar: bar(pct),
      maturity: matEntry?.[1]?.slice(0, 48) || "—",
      openHigh,
      releaseReady: releaseCard?.ready ?? null,
      scorecard: score ?? null,
    });
  }
  products.sort((a, b) => b.pct - a.pct);
  return products;
}

export function writeProgramBStatus() {
  const products = computeProductCompletion();
  const md = [
    "# Program B — Product Completion",
    "",
    `**Updated:** ${isoNow()}`,
    "",
    "Each product is an independent project with its own backlog — not a bag of Waves.",
    "",
    ...products.map(
      (p) =>
        `### ${p.product}\n\n\`\`\`\n${p.product}\n${p.bar}\n${p.pct}%\n\`\`\`\n\n- Maturity signal: ${p.maturity}\n- Open high findings: ${p.openHigh}\n- Release ready: ${p.releaseReady ?? "—"}%\n- Scorecard: ${p.scorecard ?? "—"}\n`
    ),
    "",
    "> Invest next in lowest % / strategic priority (SalesOS, LocalContentOS, AuditOS) per Program Governance.",
    "",
  ].join("\n");
  writeText(engPath("programs", "b-products.md"), md);
  writeJson(dataPath("programs", "product-completion.json"), { at: isoNow(), products });
  return products;
}

export function writeProgramAStatus() {
  const compliance = loadJson(dataPath("os/compliance", "latest.json"));
  const auth =
    compliance?.rules?.find((r) => r.id === "ACTIONS_USE_ENFORCE")?.score ?? null;
  const portal = loadJson(dataPath("os/portal", "latest.json"));
  const items = PROGRAMS.A.scope.map((name) => {
    let status = "⬜";
    let note = "Track in OpenCode backlog";
    if (name === "Authorization" && auth != null) {
      status = auth >= 80 ? "✅" : auth >= 55 ? "🟡" : "🔴";
      note = `enforce adoption ${auth}%`;
    }
    if (name === "Observability" && portal?.overall != null) {
      status = "🟡";
      note = "Engineering portal + ops baselines exist; deepen prod SLOs";
    }
    if (name === "Organizations") {
      status = "🟡";
      note = "Workspace real; deepen org admin UX";
    }
    if (name === "Audit Trail") {
      status = "🟡";
      note = "Platform audit log present — close product gaps via compliance";
    }
    return { name, status, note };
  });

  const md = [
    "# Program A — Platform Completion",
    "",
    `**Updated:** ${isoNow()}`,
    "",
    "| Capability | Status | Note |",
    "| ---------- | ------ | ---- |",
    ...items.map((i) => `| ${i.name} | ${i.status} | ${i.note} |`),
    "",
    "Legend: ✅ healthy · 🟡 in progress · 🔴 gap · ⬜ not scored",
    "",
  ].join("\n");
  writeText(engPath("programs", "a-platform.md"), md);
  writeJson(dataPath("programs", "platform-completion.json"), { at: isoNow(), items, authAdoption: auth });
  return items;
}

export function writeProgramDStatus() {
  const adr = loadJson(dataPath("os/adr", "validation-latest.json"));
  const md = [
    "# Program D — Architecture Governance",
    "",
    `**Updated:** ${isoNow()}`,
    "",
    `| Metric | Value |`,
    `| ------ | ----- |`,
    `| ADR validation overall | ${adr?.overall ?? "—"}% |`,
    `| Validated rules | ${adr?.validations?.length ?? 0} |`,
    "",
    "## Governance surfaces",
    "",
    "- ADRs: `docs/adr/`",
    "- Architecture memory: `engineering/intelligence/architecture-memory/`",
    "- Validate: `npm run eng:os -- --adr`",
    "- Record: `npm run eng:memory -- record --title ...`",
    "",
    "This program is **decision-led**, not report-led.",
    "",
  ].join("\n");
  writeText(engPath("programs", "d-architecture.md"), md);
  return adr;
}
