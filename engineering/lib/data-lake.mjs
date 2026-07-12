/**
 * Engineering Data Lake — append-only persistence
 *
 * Never replaces history. Each audit is a new snapshot.
 * Findings are fingerprinted so recurrence can be learned.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  engPath,
  ensureDir,
  writeJson,
  writeText,
  readText,
  exists,
  isoNow,
} from "../lib/fs-utils.mjs";

export const DATA_ROOT = () => engPath("data");

export function dataPath(...parts) {
  return path.join(DATA_ROOT(), ...parts);
}

export function ensureDataLake() {
  for (const d of [
    "audits",
    "metrics",
    "history",
    "timeline",
    "findings",
    "trends",
    "products",
    "regressions",
    "recommendations",
    "costs",
    "predictions",
  ]) {
    ensureDir(dataPath(d));
  }
}

/** Stable fingerprint for a finding across audits */
export function fingerprintFinding(f) {
  const files = (f.files || []).slice().sort().join("|");
  const key = [f.agent || "", f.category || "", normalizeTitle(f.title || ""), files].join("::");
  return crypto.createHash("sha1").update(key).digest("hex").slice(0, 12);
}

function normalizeTitle(title) {
  return title
    .replace(/\(priority \d+\)/gi, "")
    .replace(/\(\d+ lines\)/gi, "")
    .replace(/\bMI=\d+\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function newAuditId(at = isoNow()) {
  const stamp = at.replace(/[:.]/g, "-");
  return `audit-${stamp}`;
}

export function listAuditIds() {
  const dir = dataPath("audits");
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

export function loadAudit(auditId) {
  const p = dataPath("audits", `${auditId}.json`);
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

export function loadLatestAudit() {
  const ids = listAuditIds();
  if (!ids.length) return null;
  return loadAudit(ids[ids.length - 1]);
}

export function loadPreviousAudit(currentId) {
  const ids = listAuditIds();
  const idx = ids.indexOf(currentId);
  if (idx > 0) return loadAudit(ids[idx - 1]);
  if (idx === -1 && ids.length) return loadAudit(ids[ids.length - 1]);
  return null;
}

export function appendJsonl(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify(obj) + "\n", "utf8");
}

export function readJsonl(filePath) {
  const raw = readText(filePath);
  if (!raw) return [];
  return raw
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Ingest a completed audit snapshot into the data lake (append-only).
 */
export function ingestAuditSnapshot({
  auditId,
  startedAt,
  finishedAt,
  agentResults,
  scores,
  gates,
  findingsByAgent,
}) {
  ensureDataLake();

  const allFindings = [];
  for (const [agent, findings] of Object.entries(findingsByAgent || {})) {
    for (const f of findings) {
      const fp = fingerprintFinding({ ...f, agent: f.agent || agent });
      allFindings.push({
        ...f,
        agent: f.agent || agent,
        fingerprint: fp,
        auditId,
        seenAt: finishedAt,
      });
    }
  }

  const snapshot = {
    auditId,
    startedAt,
    finishedAt,
    scores,
    gates,
    agents: agentResults,
    findingCount: allFindings.length,
    fingerprints: allFindings.map((f) => f.fingerprint),
  };

  writeJson(dataPath("audits", `${auditId}.json`), snapshot);
  writeJson(dataPath("metrics", `${auditId}.json`), {
    auditId,
    at: finishedAt,
    scores,
  });

  appendJsonl(dataPath("metrics", "series.jsonl"), {
    auditId,
    at: finishedAt,
    ...scores,
  });

  appendJsonl(dataPath("timeline", "events.jsonl"), {
    at: finishedAt,
    type: "audit.completed",
    auditId,
    overall: scores?.overallRepositoryHealth ?? null,
    findingCount: allFindings.length,
  });

  // Update finding memory (learn recurrence)
  updateFindingMemory(auditId, finishedAt, allFindings);

  // Persist per-audit findings blob (append-only file)
  writeJson(dataPath("findings", `${auditId}.json`), {
    auditId,
    at: finishedAt,
    findings: allFindings,
  });

  writeJson(dataPath("audits", "latest.json"), {
    auditId,
    at: finishedAt,
    scores,
  });

  return { auditId, findingCount: allFindings.length, fingerprints: allFindings.length };
}

function updateFindingMemory(auditId, at, findings) {
  const indexPath = dataPath("findings", "memory.json");
  let memory = { version: 1, updatedAt: at, items: {} };
  if (exists(indexPath)) {
    try {
      memory = JSON.parse(readText(indexPath));
    } catch {
      /* keep fresh */
    }
  }
  if (!memory.items) memory.items = {};

  const currentFps = new Set(findings.map((f) => f.fingerprint));

  // Mark appearances
  for (const f of findings) {
    const prev = memory.items[f.fingerprint] || {
      fingerprint: f.fingerprint,
      agent: f.agent,
      category: f.category,
      title: f.title,
      severity: f.severity,
      files: f.files || [],
      firstSeen: at,
      lastSeen: at,
      occurrences: 0,
      audits: [],
      status: "open",
      resolvedAt: null,
      reopenedCount: 0,
      rootCauseHints: [],
      relatedRefactors: [],
    };

    const alreadyInThisAudit = prev.audits?.includes(auditId);
    if (!alreadyInThisAudit) {
      prev.occurrences = (prev.occurrences || 0) + 1;
      prev.audits = [...(prev.audits || []), auditId].slice(-50);
    }
    prev.lastSeen = at;
    prev.severity = f.severity;
    prev.files = f.files || prev.files;
    prev.title = f.title || prev.title;
    prev.evidence = f.evidence;
    prev.suggestion = f.suggestion;

    if (prev.status === "resolved") {
      prev.status = "reopened";
      prev.reopenedCount = (prev.reopenedCount || 0) + 1;
      prev.resolvedAt = null;
    } else {
      prev.status = "open";
    }

    memory.items[f.fingerprint] = prev;
  }

  // Findings that were open but missing now → resolved
  for (const [fp, item] of Object.entries(memory.items)) {
    if (!currentFps.has(fp) && (item.status === "open" || item.status === "reopened")) {
      item.status = "resolved";
      item.resolvedAt = at;
      item.lastResolvedAudit = auditId;
      memory.items[fp] = item;
    }
  }

  memory.updatedAt = at;
  memory.stats = {
    totalTracked: Object.keys(memory.items).length,
    open: Object.values(memory.items).filter((i) => i.status === "open").length,
    resolved: Object.values(memory.items).filter((i) => i.status === "resolved").length,
    reopened: Object.values(memory.items).filter((i) => i.status === "reopened").length,
    chronic: Object.values(memory.items).filter((i) => (i.occurrences || 0) >= 3).length,
  };

  writeJson(indexPath, memory);
  return memory;
}

export function loadFindingMemory() {
  const p = dataPath("findings", "memory.json");
  if (!exists(p)) return { version: 1, items: {}, stats: {} };
  try {
    return JSON.parse(readText(p));
  } catch {
    return { version: 1, items: {}, stats: {} };
  }
}

export function loadMetricsSeries() {
  return readJsonl(dataPath("metrics", "series.jsonl"));
}

/**
 * Map a file path to a product bucket for scorecards.
 */
export function productOfPath(fileRel = "") {
  const p = fileRel.replace(/\\/g, "/");
  if (/\/audit\/|\/auditos\/|lib\/audit|actions\/audit|actions\/approval|actions\/tender/.test(p))
    return "AuditOS";
  if (/local-content|localcontent|LocalContent/.test(p)) return "LocalContentOS";
  if (/\/sales\/|lib\/sales|sales-actions/.test(p)) return "SalesOS";
  if (/decision|\/decisions\//.test(p)) return "DecisionOS";
  if (/workflowos|sunbul/.test(p)) return "WorkflowOS";
  if (/\/risk\//.test(p)) return "RiskOS";
  if (/contacts|localcontact/.test(p)) return "LocalContactOS";
  if (/content-studio|contentstudio/.test(p)) return "ContentStudio";
  if (/assistant|office-ai/.test(p)) return "OfficeAI";
  if (/institutional-memory/.test(p)) return "InstitutionalMemory";
  if (/authorization|governance|middleware|lib\/auth/.test(p)) return "Core";
  return "Platform";
}

export function sparkline(values, width = 8) {
  if (!values.length) return "—";
  const blocks = "▁▂▃▄▅▆▇█";
  const nums = values.filter((v) => v != null && Number.isFinite(v));
  if (!nums.length) return "—";
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  return nums
    .slice(-width)
    .map((v) => blocks[Math.min(7, Math.floor(((v - min) / span) * 7))])
    .join("");
}

export function delta(prev, cur) {
  if (prev == null || cur == null) return null;
  return Math.round((cur - prev) * 10) / 10;
}

export function deltaArrow(d) {
  if (d == null) return "=";
  if (d > 0) return "↑";
  if (d < 0) return "↓";
  return "=";
}
