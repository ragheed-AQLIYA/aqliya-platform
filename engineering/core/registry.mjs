/**
 * AEOS Platform Core — Universal Registry
 *
 * The Registry is the universal discovery mechanism.
 * Everything that can be registered — agents, skills, policies, metrics,
 * plugins, workflows, products, capabilities — uses the SAME registry.
 *
 * This is NOT just YAML files. It's a unified registry with query capabilities.
 *
 * @module core/registry
 * @version 1.0.0
 */

import { emit, EVENTS } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Registry Store
// ═══════════════════════════════════════════════════════════

/**
 * @type {Map<string, {
 *   id: string,
 *   type: string,
 *   version: string,
 *   registeredAt: string,
 *   updatedAt: string,
 *   status: string,
 *   metadata: object,
 *   dependencies: string[],
 *   dependents: string[],
 *   tags: string[]
 * }>}
 */
const store = new Map();

/**
 * @type {Map<string, string[]>} type → ids index
 */
const typeIndex = new Map();

/**
 * @type {Map<string, string[]>} tag → ids index
 */
const tagIndex = new Map();

// ═══════════════════════════════════════════════════════════
// Register
// ═══════════════════════════════════════════════════════════

/**
 * Register an entity in the universal registry.
 *
 * @param {object} entry
 * @param {string} entry.id - Unique identifier
 * @param {string} entry.type - RegistrableType: "agent" | "skill" | "policy" | "metric" | "plugin" | "workflow" | "product" | "capability"
 * @param {string} entry.version - Semantic version
 * @param {object} entry.metadata - Type-specific metadata
 * @param {string[]} [entry.dependencies] - IDs this entry depends on
 * @param {string[]} [entry.tags] - Tags for discovery
 * @returns {{ success: boolean, id: string }}
 */
export function register({ id, type, version, metadata, dependencies = [], tags = [] }) {
  if (store.has(id)) {
    throw new Error(`Registry: "${id}" already registered. Use update() to modify.`);
  }

  const now = new Date().toISOString();

  const entry = {
    id,
    type,
    version,
    registeredAt: now,
    updatedAt: now,
    status: "active",
    metadata,
    dependencies,
    dependents: [],
    tags,
  };

  store.set(id, entry);

  // Index by type
  if (!typeIndex.has(type)) typeIndex.set(type, []);
  typeIndex.get(type).push(id);

  // Index by tag
  for (const tag of tags) {
    if (!tagIndex.has(tag)) tagIndex.set(tag, []);
    tagIndex.get(tag).push(id);
  }

  // Update dependents on dependency entries
  for (const depId of dependencies) {
    const dep = store.get(depId);
    if (dep) {
      dep.dependents.push(id);
    }
  }

  emit(`registry.registered`, { id, type }, { source: "registry" });
  emit(`${type}.registered`, { id, metadata }, { source: "registry" });

  return { success: true, id };
}

/**
 * Register multiple entries at once.
 * @param {Array} entries
 */
export function registerBatch(entries) {
  for (const entry of entries) {
    register(entry);
  }
}

// ═══════════════════════════════════════════════════════════
// Update
// ═══════════════════════════════════════════════════════════

/**
 * Update a registered entity's metadata or status.
 * @param {string} id
 * @param {{ metadata?: object, status?: string, version?: string, tags?: string[] }} updates
 */
export function update(id, updates) {
  const entry = store.get(id);
  if (!entry) throw new Error(`Registry: "${id}" not found.`);

  if (updates.metadata) entry.metadata = { ...entry.metadata, ...updates.metadata };
  if (updates.status) entry.status = updates.status;
  if (updates.version) entry.version = updates.version;
  if (updates.tags) {
    entry.tags = updates.tags;
    for (const tag of updates.tags) {
      if (!tagIndex.has(tag)) tagIndex.set(tag, []);
      if (!tagIndex.get(tag).includes(id)) tagIndex.get(tag).push(id);
    }
  }
  entry.updatedAt = new Date().toISOString();

  emit(`registry.updated`, { id, type: entry.type }, { source: "registry" });
}

// ═══════════════════════════════════════════════════════════
// Query
// ═══════════════════════════════════════════════════════════

/**
 * Query the registry.
 * @param {object} [filter]
 * @param {string} [filter.type] - Filter by type
 * @param {string} [filter.status] - Filter by status
 * @param {string[]} [filter.tags] - Filter by tags (ANY match)
 * @param {number} [filter.layer] - Filter by layer (for agents only)
 * @param {string} [filter.dependsOn] - Filter by dependency
 * @returns {Array}
 */
export function query(filter = {}) {
  let results = [...store.values()];

  if (filter.type) {
    results = results.filter((e) => e.type === filter.type);
  }
  if (filter.status) {
    results = results.filter((e) => e.status === filter.status);
  }
  if (filter.tags?.length > 0) {
    results = results.filter((e) => e.tags.some((t) => filter.tags.includes(t)));
  }
  if (filter.layer !== undefined) {
    results = results.filter((e) => e.metadata?.layer === filter.layer);
  }
  if (filter.dependsOn) {
    results = results.filter((e) => e.dependencies.includes(filter.dependsOn));
  }

  return results;
}

/**
 * Get a single entry by ID.
 * @param {string} id
 * @returns {object | null}
 */
export function get(id) {
  return store.get(id) || null;
}

/**
 * Get entries by type.
 * @param {string} type
 * @returns {Array}
 */
export function getByType(type) {
  return (typeIndex.get(type) || []).map((id) => store.get(id)).filter(Boolean);
}

/**
 * Get entries by tag.
 * @param {string} tag
 * @returns {Array}
 */
export function getByTag(tag) {
  return (tagIndex.get(tag) || []).map((id) => store.get(id)).filter(Boolean);
}

/**
 * Get the dependency tree for an entry.
 * @param {string} id
 * @returns {{ entry: object, dependencies: Array }}
 */
export function getDependencyTree(id) {
  const entry = store.get(id);
  if (!entry) return null;

  return {
    entry,
    dependencies: entry.dependencies.map((depId) => getDependencyTree(depId)).filter(Boolean),
  };
}

/**
 * Get all entries that depend on a given entry.
 * @param {string} id
 * @returns {Array}
 */
export function getDependents(id) {
  const entry = store.get(id);
  if (!entry) return [];
  return entry.dependents.map((depId) => store.get(depId)).filter(Boolean);
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
  for (const [type] of typeIndex) {
    counts[type] = typeIndex.get(type).length;
  }
  return counts;
}

/**
 * Total registered entries.
 * @returns {number}
 */
export function totalCount() {
  return store.size;
}

/**
 * List all registered types.
 * @returns {string[]}
 */
export function listTypes() {
  return [...typeIndex.keys()];
}

/**
 * List all registered tags.
 * @returns {string[]}
 */
export function listTags() {
  return [...tagIndex.keys()];
}

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════

export default {
  register,
  registerBatch,
  update,
  query,
  get,
  getByType,
  getByTag,
  getDependencyTree,
  getDependents,
  countByType,
  totalCount,
  listTypes,
  listTags,
};
