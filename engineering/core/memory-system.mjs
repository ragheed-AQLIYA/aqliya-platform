/**
 * AEOS Platform Core — Memory System
 *
 * Six memory types, each storing different kinds of knowledge.
 * This is NOT just file storage — it's a multi-type memory architecture
 * that enables the system to learn without mixing knowledge types.
 *
 * Memory Types:
 *   - Working Memory: Current cycle state, active tasks, in-flight decisions
 *   - Episodic Memory: Past cycles, what happened, outcomes
 *   - Semantic Memory: Patterns, anti-patterns, facts, rules
 *   - Repository Memory: Digital Twin, file inventory, dependency graphs
 *   - Decision Memory: ADRs, governance decisions, trade-off analyses
 *   - Skill Memory: Skill execution history, quality scores, improvements
 *
 * @module core/memory-system
 * @version 1.0.0
 */

import { emit } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Memory Store
// ═══════════════════════════════════════════════════════════

/**
 * In-memory store. In production, each type can use a different backend
 * (Redis for working, Postgres for episodic, file system for semantic, etc.)
 *
 * @type {Map<string, Map<string, object>>} type → (id → entry)
 */
const stores = new Map();
const TYPES = ["working", "episodic", "semantic", "repository", "decision", "skill"];

for (const type of TYPES) {
  stores.set(type, new Map());
}

// ═══════════════════════════════════════════════════════════
// Write
// ═══════════════════════════════════════════════════════════

/**
 * Store a memory entry.
 *
 * @param {object} entry
 * @param {string} entry.id
 * @param {string} entry.type - MemoryType
 * @param {string} entry.cycleId
 * @param {object} entry.payload
 * @param {string[]} [entry.tags]
 * @param {number} [entry.ttl] - Time-to-live in ms (null = permanent)
 * @param {Array<{ targetId: string, relationType: string, confidence: number }>} [entry.relationships]
 * @returns {{ success: boolean, id: string }}
 */
export function store({ id, type, cycleId, payload, tags = [], ttl = null, relationships = [] }) {
  if (!TYPES.includes(type)) {
    throw new Error(`Unknown memory type: ${type}. Must be one of: ${TYPES.join(", ")}`);
  }

  const store = stores.get(type);
  const now = new Date().toISOString();

  const entry = {
    id,
    type,
    cycleId,
    timestamp: now,
    ttl,
    tags,
    payload,
    relationships,
    accessCount: 0,
    lastAccessed: now,
  };

  store.set(id, entry);

  emit("memory.stored", { id, type, cycleId }, { source: "memory-system" });

  return { success: true, id };
}

/**
 * Store a batch of entries.
 * @param {Array} entries
 */
export function storeBatch(entries) {
  for (const entry of entries) {
    store(entry);
  }
}

// ═══════════════════════════════════════════════════════════
// Read
// ═══════════════════════════════════════════════════════════

/**
 * Retrieve a memory entry by ID and type.
 * @param {string} id
 * @param {string} type
 * @returns {object | null}
 */
export function recall(id, type) {
  const store = stores.get(type);
  if (!store) return null;

  const entry = store.get(id);
  if (!entry) return null;

  // Check TTL expiration
  if (entry.ttl !== null) {
    const age = Date.now() - new Date(entry.timestamp).getTime();
    if (age > entry.ttl) {
      store.delete(id);
      return null;
    }
  }

  entry.accessCount++;
  entry.lastAccessed = new Date().toISOString();

  return entry;
}

/**
 * Query memory entries.
 * @param {object} query - MemoryQuery
 * @param {string} [query.type]
 * @param {string[]} [query.tags]
 * @param {string} [query.cycleId]
 * @param {string} [query.since]
 * @param {number} [query.limit]
 * @param {string} [query.relationTo] - Find entries that relate to this ID
 * @returns {Array}
 */
export function query({ type, tags, cycleId, since, limit, relationTo } = {}) {
  let results = [];

  const storesToSearch = type ? [stores.get(type)] : TYPES.map((t) => stores.get(t));

  for (const store of storesToSearch) {
    if (!store) continue;
    for (const [id, entry] of store) {
      // TTL check
      if (entry.ttl !== null) {
        const age = Date.now() - new Date(entry.timestamp).getTime();
        if (age > entry.ttl) {
          store.delete(id);
          continue;
        }
      }

      if (cycleId && entry.cycleId !== cycleId) continue;
      if (since && entry.timestamp < since) continue;
      if (tags?.length > 0 && !tags.some((t) => entry.tags?.includes(t))) continue;
      if (relationTo && !entry.relationships?.some((r) => r.targetId === relationTo)) continue;

      results.push(entry);
    }
  }

  results.sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first

  if (limit) {
    results = results.slice(0, limit);
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// Forget
// ═══════════════════════════════════════════════════════════

/**
 * Remove a memory entry (soft delete — moves to archive).
 * @param {string} id
 * @param {string} type
 */
export function forget(id, type) {
  const store = stores.get(type);
  if (!store) return false;

  const entry = store.get(id);
  if (!entry) return false;

  // Move to episodic memory as "forgotten" record before deleting
  store("forgotten", {
    id: `forgotten-${id}`,
    type: "episodic",
    cycleId: entry.cycleId,
    payload: { originalId: id, originalType: type, forgottenAt: new Date().toISOString() },
    tags: ["forgotten"],
  });

  store.delete(id);
  emit("memory.forgotten", { id, type }, { source: "memory-system" });
  return true;
}

// ═══════════════════════════════════════════════════════════
// Stats
// ═══════════════════════════════════════════════════════════

/**
 * Count entries by type.
 * @returns {Record<string, number>}
 */
export function countByType() {
  const counts = {};
  for (const type of TYPES) {
    counts[type] = stores.get(type).size;
  }
  return counts;
}

/**
 * Total memory entries.
 * @returns {number}
 */
export function totalEntries() {
  let total = 0;
  for (const type of TYPES) {
    total += stores.get(type).size;
  }
  return total;
}

/**
 * Get most frequently accessed entries.
 * @param {number} [limit=10]
 * @returns {Array}
 */
export function mostAccessed(limit = 10) {
  const all = [];
  for (const type of TYPES) {
    for (const entry of stores.get(type).values()) {
      all.push(entry);
    }
  }
  all.sort((a, b) => b.accessCount - a.accessCount);
  return all.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  TYPES,
  store,
  storeBatch,
  recall,
  query,
  forget,
  countByType,
  totalEntries,
  mostAccessed,
};
