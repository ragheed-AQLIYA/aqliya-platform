/**
 * Architecture Memory
 *
 * Records architectural decisions so Engineering Excellence does not
 * contradict approved OpenCode decisions over time.
 *
 * Sources:
 * - docs/adr/*
 * - engineering/intelligence/architecture-memory/decisions.jsonl (append-only)
 * - optional explicit records via eng:memory
 */

import fs from "node:fs";
import path from "node:path";
import {
  abs,
  engPath,
  exists,
  readText,
  writeText,
  writeJson,
  isoNow,
  ensureDir,
  walkFiles,
  rel,
} from "../../lib/fs-utils.mjs";
import { appendJsonl, readJsonl, dataPath, ensureDataLake } from "../../lib/data-lake.mjs";

const MEMORY_DIR = () => engPath("intelligence", "architecture-memory");

export function ensureArchitectureMemory() {
  ensureDir(MEMORY_DIR());
  ensureDataLake();
}

export function memoryDecisionsPath() {
  return path.join(MEMORY_DIR(), "decisions.jsonl");
}

/** Scan ADRs into architecture memory (idempotent by id) */
export function syncAdrsIntoMemory() {
  ensureArchitectureMemory();
  const existing = readJsonl(memoryDecisionsPath());
  const existingIds = new Set(existing.map((d) => d.id));

  const adrDir = abs("docs/adr");
  if (!exists(adrDir)) {
    return { added: 0, total: existing.length };
  }

  let added = 0;
  for (const file of walkFiles(["docs/adr"], { extensions: new Set([".md"]) })) {
    const content = readText(file) || "";
    const fileRel = rel(file);
    const base = path.basename(fileRel, ".md");
    const id = base.match(/ADR[-_]?\d+/i)?.[0]?.toUpperCase() || base;
    if (existingIds.has(id) || existingIds.has(`ADR:${fileRel}`)) continue;

    const title =
      content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
      content.match(/title[:\s]+(.+)/i)?.[1]?.trim() ||
      base;
    const status = content.match(/status[:\s]+(\w+)/i)?.[1] || "accepted";
    const product =
      content.match(/product[:\s]+(\w+)/i)?.[1] ||
      inferProduct(content + fileRel);
    const files = [...content.matchAll(/`(src\/[^`]+)`/g)].map((m) => m[1]).slice(0, 20);

    const record = {
      id,
      type: "adr",
      title,
      status,
      product,
      reason: extractReason(content),
      date: isoNow(),
      source: fileRel,
      files,
      pattern: extractPattern(content),
      doNotRevert: true,
    };
    appendJsonl(memoryDecisionsPath(), record);
    existingIds.add(id);
    added += 1;
  }

  return { added, total: existingIds.size };
}

function inferProduct(text) {
  if (/cloudfront|waf|deploy|terraform|infra/i.test(text)) return "Platform";
  if (/auth|rbac|authorization/i.test(text)) return "Core";
  if (/auditos|\/audit/i.test(text)) return "AuditOS";
  if (/local.?content/i.test(text)) return "LocalContentOS";
  if (/salesos|\/sales/i.test(text)) return "SalesOS";
  if (/workflow/i.test(text)) return "WorkflowOS";
  if (/decision/i.test(text)) return "DecisionOS";
  return "Platform";
}

function extractReason(content) {
  const m =
    content.match(/##\s*(Decision|Reason|Rationale|Context)[^\n]*\n+([\s\S]{0,400}?)(?:\n##|$)/i) ||
    content.match(/\*\*Decision:\*\*\s*(.+)/i);
  if (!m) return "See source ADR";
  return String(m[2] || m[1])
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 280);
}

function extractPattern(content) {
  if (/enforce\s*\(/i.test(content)) return "enforce() authorization";
  if (/action-guard|authorize\(/i.test(content)) return "authorize/action-guard";
  if (/server action/i.test(content)) return "Server Action → lib → Prisma";
  return null;
}

/**
 * Record an OpenCode architectural decision explicitly.
 */
export function recordDecision({
  id,
  title,
  product,
  reason,
  files = [],
  pattern = null,
  status = "accepted",
}) {
  ensureArchitectureMemory();
  const record = {
    id: id || `DEC-${Date.now()}`,
    type: "opencode-decision",
    title,
    status,
    product: product || "Platform",
    reason,
    date: isoNow(),
    source: "manual/eng:memory",
    files,
    pattern,
    doNotRevert: true,
  };
  appendJsonl(memoryDecisionsPath(), record);
  rebuildMemoryIndex();
  return record;
}

export function loadDecisions() {
  ensureArchitectureMemory();
  return readJsonl(memoryDecisionsPath());
}

export function rebuildMemoryIndex() {
  const decisions = loadDecisions();
  const md = [
    "# Architecture Memory",
    "",
    `**Updated:** ${isoNow()}  `,
    `**Decisions:** ${decisions.length}`,
    "",
    "> Engineering Excellence must **not** recommend reverting these without a new ADR.",
    "",
    "| ID | Product | Title | Pattern | Date | Source |",
    "| -- | ------- | ----- | ------- | ---- | ------ |",
    ...decisions.map(
      (d) =>
        `| ${d.id} | ${d.product || "—"} | ${(d.title || "").replace(/\|/g, "/")} | ${d.pattern || "—"} | ${String(d.date || "").slice(0, 10)} | ${d.source || "—"} |`
    ),
    "",
    "## Details",
    "",
    ...decisions.flatMap((d) => [
      `### ${d.id} — ${d.title}`,
      "",
      `- **Product:** ${d.product}`,
      `- **Status:** ${d.status}`,
      `- **Reason:** ${d.reason}`,
      `- **Pattern:** ${d.pattern || "—"}`,
      `- **Files:** ${(d.files || []).map((f) => `\`${f}\``).join(", ") || "—"}`,
      `- **Do not revert:** ${d.doNotRevert !== false}`,
      "",
    ]),
  ].join("\n");

  writeText(path.join(MEMORY_DIR(), "INDEX.md"), md);
  writeJson(path.join(MEMORY_DIR(), "index.json"), { at: isoNow(), decisions });
  writeJson(dataPath("history", "architecture-memory.json"), { at: isoNow(), count: decisions.length });
  return decisions;
}

/**
 * Filter recommendations that contradict architecture memory.
 */
export function contradictsMemory(suggestionText = "", files = []) {
  const decisions = loadDecisions();
  const hits = [];
  for (const d of decisions) {
    if (!d.pattern) continue;
    const pat = String(d.pattern).toLowerCase();
    const text = `${suggestionText} ${files.join(" ")}`.toLowerCase();
    // If suggestion says "remove/replace/revert" a protected pattern
    if (
      d.doNotRevert !== false &&
      pat &&
      text.includes(pat.split(" ")[0]) &&
      /revert|remove|replace|go back|undo|legacy/.test(text)
    ) {
      hits.push(d);
    }
  }
  return hits;
}

export function writeArchitectureMemoryReport() {
  const sync = syncAdrsIntoMemory();
  const decisions = rebuildMemoryIndex();
  return { sync, decisions };
}

/** CLI: node engineering/intelligence/architecture-memory/sync.mjs */
export function main(argv = process.argv.slice(2)) {
  if (argv[0] === "record") {
    // eng:memory record --title "..." --product DecisionOS --reason "..."
    const get = (flag) => {
      const i = argv.indexOf(flag);
      return i >= 0 ? argv[i + 1] : null;
    };
    const rec = recordDecision({
      title: get("--title") || "Untitled decision",
      product: get("--product") || "Platform",
      reason: get("--reason") || "",
      pattern: get("--pattern"),
      files: (get("--files") || "").split(",").filter(Boolean),
      id: get("--id"),
    });
    console.log("Recorded:", rec.id);
    return;
  }
  const result = writeArchitectureMemoryReport();
  console.log(`Architecture memory: +${result.sync.added} ADRs · total ${result.decisions.length}`);
}

if (process.argv[1]?.includes("architecture-memory")) {
  main();
}
