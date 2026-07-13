/**
 * AEOS Kernel — Memory Engine
 *
 * Orchestrates the 6 memory types at the kernel level.
 * Delegates to the core memory-system for storage but adds
 * kernel-level features: TTL enforcement, cross-type queries, memory compaction.
 *
 * @module kernel/memory-engine
 * @version 1.1
 */

import { emit } from "./event-engine.mjs";

const TYPES = ["working", "episodic", "semantic", "repository", "decision", "skill"];

/** @type {Map<string, Map<string, object>>} */
const stores = new Map();
for (const t of TYPES) stores.set(t, new Map());

/**
 * Store a memory entry at the kernel level.
 */
export function store({ id, type, cycleId, payload, tags = [], ttl = null, relationships = [] }) {
  if (!TYPES.includes(type)) throw new Error(`Invalid memory type: ${type}`);
  const entry = { id, type, cycleId, timestamp: new Date().toISOString(), ttl, tags, payload, relationships, accessCount: 0 };
  stores.get(type).set(id, entry);
  emit("memory.stored", { id, type, cycleId }, { source: "memory-engine" });
  return { id, type };
}

/**
 * Retrieve entry with TTL enforcement.
 */
export function recall(id, type) {
  const store = stores.get(type);
  if (!store) return null;
  const entry = store.get(id);
  if (!entry) return null;
  if (entry.ttl && Date.now() - new Date(entry.timestamp).getTime() > entry.ttl) { store.delete(id); return null; }
  entry.accessCount++;
  return entry;
}

/**
 * Query across all memory types.
 */
export function query({ type, tags, cycleId, since, limit, relationTo } = {}) {
  let results = [];
  const searchTypes = type ? [type] : TYPES;
  for (const t of searchTypes) {
    for (const [, entry] of stores.get(t)) {
      if (entry.ttl && Date.now() - new Date(entry.timestamp).getTime() > entry.ttl) continue;
      if (cycleId && entry.cycleId !== cycleId) continue;
      if (since && entry.timestamp < since) continue;
      if (tags?.length && !tags.some((tg) => entry.tags?.includes(tg))) continue;
      if (relationTo && !entry.relationships?.some((r) => r.targetId === relationTo)) continue;
      results.push(entry);
    }
  }
  results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return limit ? results.slice(0, limit) : results;
}

export function countByType() { const c = {}; for (const t of TYPES) c[t] = stores.get(t).size; return c; }
export function total() { let s = 0; for (const t of TYPES) s += stores.get(t).size; return s; }
export { TYPES };
export default { store, recall, query, countByType, total, TYPES };
