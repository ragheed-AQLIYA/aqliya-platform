/**
 * AEOS Platform Core — Layered Digital Twin
 *
 * The Digital Twin is NOT a single JSON file.
 * It is 11 independently-versioned layers.
 * Each layer changes at its own rate.
 * The twin is built once and incrementally updated.
 *
 * Layers:
 *   1. Repository — file counts, structure
 *   2. Products — product definitions, maturity
 *   3. Domains — bounded contexts, DDD
 *   4. Modules — lib modules, dependencies
 *   5. Entities — Prisma models, enums
 *   6. APIs — route handlers, server actions
 *   7. Routes — page routes, auth status
 *   8. Events — events, audit log schemas
 *   9. Dependencies — import graph
 *  10. Tests — coverage, test files
 *  11. Metrics — health scores, trends
 *
 * @module core/digital-twin
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Layer Definitions
// ═══════════════════════════════════════════════════════════

export const LAYERS = [
  "repository",
  "products",
  "domains",
  "modules",
  "entities",
  "apis",
  "routes",
  "events",
  "dependencies",
  "tests",
  "metrics",
];

/** @type {Map<string, { name: string, version: number, lastScanned: string | null, entities: Record<string, unknown> }>} */
const layers = new Map();

// Initialize layers
for (const name of LAYERS) {
  layers.set(name, {
    name,
    version: 0,
    lastScanned: null,
    entities: {},
  });
}

// ═══════════════════════════════════════════════════════════
// Layer Operations
// ═══════════════════════════════════════════════════════════

/**
 * Update a single layer of the Digital Twin.
 * Only this layer's version is incremented.
 *
 * @param {string} layerName
 * @param {Record<string, unknown>} entities
 * @returns {{ layer: string, version: number }}
 */
export function updateLayer(layerName, entities) {
  const layer = layers.get(layerName);
  if (!layer) throw new Error(`Unknown Digital Twin layer: ${layerName}`);

  const hasChanges = JSON.stringify(entities) !== JSON.stringify(layer.entities);

  if (hasChanges) {
    layer.entities = entities;
    layer.version++;
    layer.lastScanned = new Date().toISOString();

    emit("digital_twin.layer_updated", {
      layer: layerName,
      version: layer.version,
      entityCount: Object.keys(entities).length,
    }, { source: "digital-twin" });
  }

  return { layer: layerName, version: layer.version, changed: hasChanges };
}

/**
 * Get a layer by name.
 * @param {string} layerName
 * @returns {object | null}
 */
export function getLayer(layerName) {
  return layers.get(layerName) || null;
}

/**
 * Get all layers.
 * @returns {Array<{ name: string, version: number, entityCount: number, lastScanned: string | null }>}
 */
export function getAllLayers() {
  return [...layers.values()].map((l) => ({
    name: l.name,
    version: l.version,
    entityCount: Object.keys(l.entities).length,
    lastScanned: l.lastScanned,
  }));
}

/**
 * Get the full twin snapshot.
 * @param {string} cycleId
 * @returns {object}
 */
export function getSnapshot(cycleId) {
  const snapshot = {
    twinId: `twin-${cycleId}`,
    cycleId,
    generatedAt: new Date().toISOString(),
    layers: {},
  };

  for (const [name, layer] of layers) {
    snapshot.layers[name] = {
      version: layer.version,
      lastScanned: layer.lastScanned,
      entityCount: Object.keys(layer.entities).length,
      entities: layer.entities,
    };
  }

  return snapshot;
}

/**
 * Compare two twin snapshots to detect drift.
 * @param {object} before
 * @param {object} after
 * @returns {{ driftedLayers: string[], details: object }}
 */
export function detectDrift(before, after) {
  const driftedLayers = [];

  for (const name of LAYERS) {
    if (before.layers[name]?.version !== after.layers[name]?.version) {
      driftedLayers.push(name);
    }
  }

  emit("digital_twin.drift_detected", { driftedLayers }, { source: "digital-twin" });

  return {
    driftedLayers,
    details: driftedLayers.map((name) => ({
      layer: name,
      versionBefore: before.layers[name]?.version || 0,
      versionAfter: after.layers[name]?.version || 0,
    })),
  };
}

/**
 * Check which layers need rescanning based on file changes.
 * @param {string[]} changedFiles - List of changed file paths
 * @returns {{ needsFullRescan: boolean, layersToRescan: string[] }}
 */
export function determineRescanScope(changedFiles) {
  const layersToRescan = new Set();

  for (const file of changedFiles) {
    if (file.startsWith("prisma/")) {
      layersToRescan.add("entities");
      layersToRescan.add("modules");
    }
    if (file.startsWith("src/app/")) {
      layersToRescan.add("routes");
    }
    if (file.startsWith("src/actions/") || file.startsWith("src/app/api/")) {
      layersToRescan.add("apis");
    }
    if (file.startsWith("src/lib/")) {
      layersToRescan.add("modules");
      layersToRescan.add("domains");
    }
    if (file.startsWith("src/__tests__/") || file.includes(".test.")) {
      layersToRescan.add("tests");
    }
    if (file.startsWith("engineering/")) {
      layersToRescan.add("metrics");
    }
    if (file.startsWith("package.json") || file.startsWith("package-lock.json")) {
      layersToRescan.add("dependencies");
    }

    // Always rescan repository layer
    layersToRescan.add("repository");
  }

  const needsFullRescan = layersToRescan.size >= 5; // Threshold: if 5+ layers affected, full rescan

  return {
    needsFullRescan,
    layersToRescan: [...layersToRescan],
  };
}

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  LAYERS,
  updateLayer,
  getLayer,
  getAllLayers,
  getSnapshot,
  detectDrift,
  determineRescanScope,
};
