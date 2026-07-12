/**
 * Delivery Planner Agent (Program E)
 * Composes next Waves: what enters, why, ROI, risk, effort.
 * LAST-WAVE agent class — see AGENT_FREEZE.md
 */

import { ensureProgramsDirs, computeProductCompletion, PROGRAMS } from "./registry.mjs";
import { syncDeliveryFromPlanner, writeDeliveryBoardMd } from "./delivery-governance.mjs";
import {
  engPath,
  writeText,
  writeJson,
  readText,
  isoNow,
  exists,
} from "../lib/fs-utils.mjs";
import { dataPath, loadFindingMemory, productOfPath } from "../lib/data-lake.mjs";
import { loadLifecycle } from "../os/finding-lifecycle.mjs";

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

function effortDays(item) {
  let d = 0.5;
  if (item.severity === "critical") d = 2;
  else if (item.severity === "high") d = 1;
  else if (item.severity === "medium") d = 0.5;
  d += Math.min(2, ((item.files || []).length || 1) * 0.2);
  if ((item.difficulty || 0) >= 4) d += 1;
  return Math.round(d * 4) / 4;
}

function riskLabel(avgRisk) {
  if (avgRisk >= 4) return "High";
  if (avgRisk >= 2.5) return "Medium";
  return "Low";
}

function nextWaveNumbers(existingWaves, count) {
  const nums = Object.keys(existingWaves || {})
    .map((id) => {
      const m = String(id).match(/Wave-?(\d+)/i);
      return m ? Number(m[1]) : 0;
    })
    .filter(Boolean);
  let start = nums.length ? Math.max(...nums) + 1 : 9;
  return Array.from({ length: count }, (_, i) => `Wave-${start + i}`);
}

/**
 * Build candidate pool from Top10 + lifecycle prioritized/finding (high/critical)
 */
function buildPool() {
  const top10 = loadJson(dataPath("recommendations", "top10.json"))?.top10 || [];
  const life = loadLifecycle();
  const memory = loadFindingMemory();
  const byFp = new Map();

  for (const t of top10) {
    byFp.set(t.fingerprint, {
      fingerprint: t.fingerprint,
      title: t.title,
      severity: t.severity,
      product: t.product || productOfPath((t.files || [])[0] || ""),
      files: t.files || [],
      roi: t.roi ?? 1,
      impact: t.impact ?? 5,
      difficulty: t.difficulty ?? 2,
      risk: t.risk ?? 2,
      confidence: t.confidence ?? 70,
      source: "top10",
    });
  }

  for (const item of Object.values(life.items || {})) {
    if (!["finding", "prioritized"].includes(item.state)) continue;
    if (!["critical", "high"].includes(item.severity)) continue;
    if (byFp.has(item.fingerprint)) continue;
    byFp.set(item.fingerprint, {
      fingerprint: item.fingerprint,
      title: item.title,
      severity: item.severity,
      product: item.product || productOfPath((item.files || [])[0] || ""),
      files: item.files || [],
      roi: item.priority || 2,
      impact: item.severity === "critical" ? 10 : 8,
      difficulty: 3,
      risk: 3,
      confidence: 65,
      source: "lifecycle",
    });
  }

  // Enrich ROI from recommendation ranking weights if missing
  return [...byFp.values()].map((x) => ({
    ...x,
    effortDays: effortDays(x),
    programHint: x.product === "Platform" || x.product === "Core" ? "A" : "B",
  }));
}

export async function runDeliveryPlanner({ waveCount = 3, maxPerWave = 9 } = {}) {
  ensureProgramsDirs();
  const pool = buildPool().sort((a, b) => b.roi - a.roi || b.impact - a.impact);
  const productCompletion = computeProductCompletion();
  const productNeed = Object.fromEntries(
    productCompletion.map((p) => [p.product, 100 - p.pct])
  );

  // Score for wave packing: ROI * (1 + need/100) / effort
  const scored = pool.map((f) => {
    const need = productNeed[f.product] ?? (f.product === "Platform" ? 40 : 30);
    const packScore =
      (f.roi * (1 + need / 100) * (f.confidence / 100)) / Math.max(0.5, f.effortDays);
    return { ...f, packScore, need };
  });
  scored.sort((a, b) => b.packScore - a.packScore);

  const delivery = loadJson(dataPath("programs", "delivery.json")) || { waves: {} };
  const waveIds = nextWaveNumbers(delivery.waves, waveCount);
  const used = new Set();
  const waves = [];

  // Prefer one primary product per wave (focus), fill with same product then platform
  const productOrder = [
    ...productCompletion.map((p) => p.product),
    "Platform",
    "Core",
  ];

  for (let i = 0; i < waveIds.length; i++) {
    const waveId = waveIds[i];
    // Pick focus product: highest need among remaining findings
    const remaining = scored.filter((f) => !used.has(f.fingerprint));
    if (!remaining.length) break;

    const byProd = new Map();
    for (const f of remaining) {
      if (!byProd.has(f.product)) byProd.set(f.product, []);
      byProd.get(f.product).push(f);
    }
    let focus = remaining[0].product;
    let bestNeed = -1;
    for (const [prod, list] of byProd) {
      const need = productNeed[prod] ?? 30;
      const topRoi = list[0]?.roi || 0;
      const score = need + topRoi * 5;
      if (score > bestNeed) {
        bestNeed = score;
        focus = prod;
      }
    }

    const focusItems = remaining.filter((f) => f.product === focus).slice(0, maxPerWave);
    let selected = [...focusItems];
    if (selected.length < Math.min(5, maxPerWave)) {
      const fill = remaining
        .filter((f) => f.product !== focus)
        .slice(0, maxPerWave - selected.length);
      selected = selected.concat(fill);
    }
    selected = selected.slice(0, maxPerWave);
    for (const s of selected) used.add(s.fingerprint);

    const effortDays = Math.round(selected.reduce((s, f) => s + f.effortDays, 0) * 10) / 10;
    const avgRoi =
      selected.length === 0
        ? 0
        : Math.round((selected.reduce((s, f) => s + f.roi, 0) / selected.length) * 10) / 10;
    const avgRisk =
      selected.length === 0
        ? 0
        : selected.reduce((s, f) => s + (f.risk || 2), 0) / selected.length;
    const program = focus === "Platform" || focus === "Core" ? "A" : "B";

    waves.push({
      id: waveId,
      product: focus,
      program,
      findings: selected,
      findingCount: selected.length,
      roi: avgRoi,
      risk: riskLabel(avgRisk),
      effortDays,
      rationale: `Focus ${focus} (completion gap ${productNeed[focus] ?? "?"}%). Pack score prioritizes ROI × need / effort. Program ${program}.`,
    });
  }

  syncDeliveryFromPlanner(waves);
  writeJson(dataPath("programs", "waves", "latest-plan.json"), { at: isoNow(), waves });
  writeJson(dataPath("programs", `plan-${isoNow().replace(/[:.]/g, "-")}.json`), {
    at: isoNow(),
    waves,
  });

  const md = [
    "# Delivery Planner — Proposed Waves",
    "",
    `**Generated:** ${isoNow()}  `,
    `**Pool size:** ${pool.length} · **Waves:** ${waves.length}`,
    "",
    "> EngineeringOS proposes order. Program Governance accepts. OpenCode implements.",
    "",
    ...waves.flatMap((w) => [
      `## ${w.id}`,
      "",
      "```",
      `${w.id}`,
      `${w.product}`,
      `${w.findingCount} Findings`,
      `ROI ${w.roi}`,
      `Risk ${w.risk}`,
      `Effort ${w.effortDays} days`,
      `Program ${w.program}`,
      "```",
      "",
      `**Why:** ${w.rationale}`,
      "",
      "| # | Finding | Severity | ROI | Effort |",
      "| - | ------- | -------- | --- | ------ |",
      ...w.findings.map(
        (f, i) =>
          `| ${i + 1} | ${f.title.replace(/\|/g, "/").slice(0, 55)} | ${f.severity} | ${f.roi} | ${f.effortDays}d |`
      ),
      "",
    ]),
    "## Next",
    "",
    "1. Governance accepts / edits wave.",
    "2. `eng:programs -- --delivery assign --id <fp> --wave Wave-N`",
    "3. OpenCode implements → Engineering verifies → Measured.",
    "",
  ].join("\n");

  writeText(engPath("programs", "DELIVERY_PLAN.md"), md);
  return { waves, poolSize: pool.length };
}
