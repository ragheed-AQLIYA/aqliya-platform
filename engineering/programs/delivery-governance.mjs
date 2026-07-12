/**
 * Program E — Delivery Governance board
 * Backlog → Selected → Assigned → In Progress → Verification → Accepted → Released → Measured
 */

import { PROGRAMS, ensureProgramsDirs } from "./registry.mjs";
import {
  engPath,
  writeText,
  writeJson,
  readText,
  isoNow,
  exists,
} from "../lib/fs-utils.mjs";
import { dataPath, appendJsonl } from "../lib/data-lake.mjs";

const STATES = PROGRAMS.E.states;

function boardPath() {
  return dataPath("programs", "delivery.json");
}

export function loadDeliveryBoard() {
  ensureProgramsDirs();
  if (!exists(boardPath())) {
    return { version: 1, updatedAt: null, items: {}, waves: {} };
  }
  try {
    return JSON.parse(readText(boardPath()));
  } catch {
    return { version: 1, updatedAt: null, items: {}, waves: {} };
  }
}

export function saveDeliveryBoard(doc) {
  doc.updatedAt = isoNow();
  writeJson(boardPath(), doc);
  return doc;
}

export function upsertDeliveryItem(item) {
  const doc = loadDeliveryBoard();
  const id = item.id;
  const prev = doc.items[id];
  doc.items[id] = {
    ...prev,
    ...item,
    id,
    state: item.state || prev?.state || "backlog",
    history: [
      ...(prev?.history || []),
      {
        at: isoNow(),
        state: item.state || prev?.state || "backlog",
        note: item.note || "upsert",
      },
    ].slice(-30),
  };
  saveDeliveryBoard(doc);
  writeDeliveryBoardMd(doc);
  return doc.items[id];
}

export function transitionDelivery(id, nextState, { note, wave } = {}) {
  if (!STATES.includes(nextState)) {
    throw new Error(`Invalid delivery state: ${nextState}`);
  }
  const doc = loadDeliveryBoard();
  const item = doc.items[id];
  if (!item) throw new Error(`Unknown delivery item: ${id}`);
  const from = item.state;
  item.state = nextState;
  if (wave) item.wave = wave;
  item.history = [
    ...(item.history || []),
    { at: isoNow(), from, state: nextState, note: note || `${from} → ${nextState}` },
  ].slice(-30);
  doc.items[id] = item;
  if (wave) {
    doc.waves[wave] = doc.waves[wave] || { id: wave, items: [], updatedAt: isoNow() };
    if (!doc.waves[wave].items.includes(id)) doc.waves[wave].items.push(id);
    doc.waves[wave].updatedAt = isoNow();
  }
  saveDeliveryBoard(doc);
  appendJsonl(dataPath("timeline", "events.jsonl"), {
    at: isoNow(),
    type: "delivery.transition",
    id,
    from,
    to: nextState,
    wave,
  });
  writeDeliveryBoardMd(doc);
  return item;
}

/**
 * Seed backlog from planned waves + prioritized findings.
 */
export function syncDeliveryFromPlanner(plannedWaves = []) {
  const doc = loadDeliveryBoard();
  for (const wave of plannedWaves) {
    const waveId = wave.id;
    doc.waves[waveId] = {
      id: waveId,
      program: wave.program || "E",
      product: wave.product,
      roi: wave.roi,
      risk: wave.risk,
      effortDays: wave.effortDays,
      rationale: wave.rationale,
      items: wave.findings?.map((f) => f.fingerprint) || [],
      updatedAt: isoNow(),
    };
    for (const f of wave.findings || []) {
      const id = f.fingerprint;
      if (doc.items[id] && !["backlog", "selected"].includes(doc.items[id].state)) continue;
      doc.items[id] = {
        id,
        title: f.title,
        product: f.product || wave.product,
        severity: f.severity,
        roi: f.roi,
        program: wave.programHint || (wave.product === "Platform" ? "A" : "B"),
        wave: waveId,
        state: "selected",
        effortDays: f.effortDays,
        history: [
          ...(doc.items[id]?.history || []),
          { at: isoNow(), state: "selected", note: `Selected into ${waveId} by Delivery Planner` },
        ].slice(-30),
      };
    }
  }
  saveDeliveryBoard(doc);
  writeDeliveryBoardMd(doc);
  return doc;
}

export function writeDeliveryBoardMd(doc = null) {
  doc = doc || loadDeliveryBoard();
  const byState = Object.fromEntries(STATES.map((s) => [s, []]));
  for (const item of Object.values(doc.items || {})) {
    (byState[item.state] || (byState[item.state] = [])).push(item);
  }

  const md = [
    "# Program E — Delivery Governance Board",
    "",
    `**Updated:** ${doc.updatedAt || isoNow()}`,
    "",
    "```",
    "Backlog → Selected → Assigned → In Progress",
    "    → Verification → Accepted → Released → Measured",
    "```",
    "",
    "> Not `Prompt → Done`. Every packet must be measured after release.",
    "",
    "| State | Count |",
    "| ----- | ----: |",
    ...STATES.map((s) => `| ${s} | ${(byState[s] || []).length} |`),
    "",
    "## Waves",
    "",
    ...Object.values(doc.waves || {})
      .slice(-15)
      .reverse()
      .flatMap((w) => [
        `### ${w.id}`,
        "",
        `- Product/Focus: **${w.product || "—"}**`,
        `- ROI: ${w.roi ?? "—"} · Risk: ${w.risk ?? "—"} · Effort: ${w.effortDays ?? "—"} days`,
        `- Items: ${(w.items || []).length}`,
        `- Rationale: ${w.rationale || "—"}`,
        "",
      ]),
    Object.keys(doc.waves || {}).length ? "" : "_No waves planned yet — run Delivery Planner._",
    "",
    ...STATES.flatMap((s) => {
      const list = byState[s] || [];
      if (!list.length) return [];
      return [
        `## ${s}`,
        "",
        ...list
          .slice(0, 25)
          .map(
            (i) =>
              `- \`${i.id}\` **[${i.severity || "?"}]** ${i.title}${i.wave ? ` · _${i.wave}_` : ""}${i.program ? ` · Program ${i.program}` : ""}`
          ),
        "",
      ];
    }),
    "## Commands",
    "",
    "```bash",
    "npm run eng:programs",
    "npm run eng:programs -- --delivery assign --id <fp> --wave Wave-9",
    "npm run eng:programs -- --delivery in_progress --id <fp>",
    "npm run eng:programs -- --delivery verification --id <fp>",
    "npm run eng:programs -- --delivery accepted --id <fp>",
    "npm run eng:programs -- --delivery released --id <fp>",
    "npm run eng:programs -- --delivery measured --id <fp>",
    "```",
    "",
  ].join("\n");

  writeText(engPath("programs", "DELIVERY_BOARD.md"), md);
  return doc;
}
