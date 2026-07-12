/**
 * Finding Lifecycle — anti "report factory"
 *
 * Finding → Priority → Assigned Wave → Implemented (OpenCode)
 *   → Verified (Engineering) → Closed → Archived
 *
 * State is stored in engineering/data/os/findings/lifecycle.json
 * and synced from finding memory + Top10.
 */

import { ensureOsDirs, osPath } from "./lib.mjs";
import { writeText, writeJson, readText, isoNow, exists, engPath } from "../lib/fs-utils.mjs";
import { dataPath, loadFindingMemory, appendJsonl } from "../lib/data-lake.mjs";

export const LIFECYCLE_STATES = [
  "finding",
  "prioritized",
  "assigned",
  "implemented",
  "verified",
  "closed",
  "archived",
];

const STATE_ORDER = Object.fromEntries(LIFECYCLE_STATES.map((s, i) => [s, i]));

function lifecyclePath() {
  return dataPath("os/findings", "lifecycle.json");
}

export function loadLifecycle() {
  ensureOsDirs();
  const p = lifecyclePath();
  if (!exists(p)) return { version: 1, updatedAt: null, items: {} };
  try {
    return JSON.parse(readText(p));
  } catch {
    return { version: 1, updatedAt: null, items: {} };
  }
}

export function saveLifecycle(doc) {
  ensureOsDirs();
  doc.updatedAt = isoNow();
  writeJson(lifecyclePath(), doc);
  return doc;
}

/**
 * Sync high-priority findings from memory + Top10 into lifecycle (as "finding"/"prioritized").
 * Does not overwrite advanced states.
 */
export function syncLifecycleFromIntelligence() {
  const doc = loadLifecycle();
  const memory = loadFindingMemory();
  const top10Path = dataPath("recommendations", "top10.json");
  let top10 = [];
  if (exists(top10Path)) {
    try {
      top10 = JSON.parse(readText(top10Path)).top10 || [];
    } catch {
      top10 = [];
    }
  }

  const topFp = new Set(top10.map((t) => t.fingerprint));

  // Seed from top10 first (prioritized)
  for (const t of top10) {
    const fp = t.fingerprint;
    if (!fp) continue;
    const existing = doc.items[fp];
    if (existing && STATE_ORDER[existing.state] >= STATE_ORDER.assigned) continue;
    doc.items[fp] = {
      fingerprint: fp,
      title: t.title,
      severity: t.severity,
      product: t.product,
      files: t.files || [],
      state: "prioritized",
      priority: t.roi,
      wave: existing?.wave || null,
      history: [
        ...(existing?.history || []),
        { at: isoNow(), state: "prioritized", note: "Synced from Top10 ROI ranking" },
      ].slice(-20),
    };
  }

  // High/critical open findings enter as "finding" if not present
  for (const item of Object.values(memory.items || {})) {
    if (!["critical", "high"].includes(item.severity)) continue;
    if (item.status === "resolved") {
      // Auto-close if memory says resolved and lifecycle not archived
      const cur = doc.items[item.fingerprint];
      if (cur && STATE_ORDER[cur.state] < STATE_ORDER.closed && cur.state !== "archived") {
        cur.state = "closed";
        cur.history = [
          ...(cur.history || []),
          { at: isoNow(), state: "closed", note: "Auto-closed: absent from latest audit (resolved in memory)" },
        ].slice(-20);
        doc.items[item.fingerprint] = cur;
      }
      continue;
    }
    if (doc.items[item.fingerprint]) continue;
    if (topFp.has(item.fingerprint)) continue;
    doc.items[item.fingerprint] = {
      fingerprint: item.fingerprint,
      title: item.title,
      severity: item.severity,
      product: null,
      files: item.files || [],
      state: "finding",
      priority: null,
      wave: null,
      history: [{ at: isoNow(), state: "finding", note: "Ingested from finding memory" }],
    };
  }

  // Reopened → bounce back to prioritized
  for (const item of Object.values(memory.items || {})) {
    if (item.status !== "reopened") continue;
    const cur = doc.items[item.fingerprint];
    if (!cur) continue;
    if (STATE_ORDER[cur.state] >= STATE_ORDER.implemented) {
      cur.state = "prioritized";
      cur.history = [
        ...(cur.history || []),
        { at: isoNow(), state: "prioritized", note: "Reopened after fix — returned to priority queue" },
      ].slice(-20);
      doc.items[item.fingerprint] = cur;
    }
  }

  return saveLifecycle(doc);
}

/**
 * Transition a finding's lifecycle state.
 * CLI: eng:os -- lifecycle assign --fp XXX --wave Wave-8
 */
export function transitionFinding(fingerprint, nextState, { wave, note, actor } = {}) {
  if (!LIFECYCLE_STATES.includes(nextState)) {
    throw new Error(`Invalid state: ${nextState}. Use: ${LIFECYCLE_STATES.join(", ")}`);
  }
  const doc = loadLifecycle();
  const item = doc.items[fingerprint];
  if (!item) throw new Error(`Unknown fingerprint: ${fingerprint}. Run eng:os first.`);

  const from = item.state;
  if (STATE_ORDER[nextState] < STATE_ORDER[from] && nextState !== "prioritized") {
    // allow reopen-style downgrade only to prioritized
  }

  item.state = nextState;
  if (wave) item.wave = wave;
  item.history = [
    ...(item.history || []),
    {
      at: isoNow(),
      state: nextState,
      from,
      note: note || `${from} → ${nextState}`,
      actor: actor || "engineering",
    },
  ].slice(-20);
  doc.items[fingerprint] = item;
  saveLifecycle(doc);

  appendJsonl(dataPath("timeline", "events.jsonl"), {
    at: isoNow(),
    type: "finding.lifecycle",
    fingerprint,
    from,
    to: nextState,
    wave: item.wave,
  });

  writeLifecycleReport(doc);
  return item;
}

export function writeLifecycleReport(doc = null) {
  doc = doc || loadLifecycle();
  const items = Object.values(doc.items || {});
  const byState = Object.fromEntries(LIFECYCLE_STATES.map((s) => [s, []]));
  for (const i of items) {
    (byState[i.state] || (byState[i.state] = [])).push(i);
  }

  const md = [
    "# Finding Lifecycle Board",
    "",
    `**Updated:** ${doc.updatedAt || isoNow()}`,
    "",
    "> Every high-priority finding must move: Finding → Priority → Wave → Implemented → Verified → Closed → Archived",
    "",
    "## Pipeline",
    "",
    "```",
    "Finding → Priority → Assigned Wave → Implemented (OpenCode)",
    "       → Verified (Engineering) → Closed → Archived",
    "```",
    "",
    "| State | Count |",
    "| ----- | ----- |",
    ...LIFECYCLE_STATES.map((s) => `| ${s} | ${(byState[s] || []).length} |`),
    "",
    ...LIFECYCLE_STATES.flatMap((s) => {
      const list = byState[s] || [];
      if (!list.length) return [];
      return [
        `## ${s}`,
        "",
        ...list
          .slice(0, 40)
          .map(
            (i) =>
              `- \`${i.fingerprint}\` **[${i.severity || "?"}]** ${i.title}${i.wave ? ` · _${i.wave}_` : ""}`
          ),
        "",
      ];
    }),
    "## Commands",
    "",
    "```bash",
    "npm run eng:os -- lifecycle assign --fp <fingerprint> --wave Wave-8",
    "npm run eng:os -- lifecycle implemented --fp <fingerprint>",
    "npm run eng:os -- lifecycle verified --fp <fingerprint>",
    "npm run eng:os -- lifecycle closed --fp <fingerprint>",
    "npm run eng:os -- lifecycle archived --fp <fingerprint>",
    "```",
    "",
  ].join("\n");

  writeText(osPath("FINDING_LIFECYCLE.md"), md);
  writeJson(engPath("os", "findings", "board.json"), {
    updatedAt: doc.updatedAt,
    counts: Object.fromEntries(LIFECYCLE_STATES.map((s) => [s, (byState[s] || []).length])),
  });
  return doc;
}

export function runFindingLifecycle() {
  const doc = syncLifecycleFromIntelligence();
  writeLifecycleReport(doc);
  return doc;
}
