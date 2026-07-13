/**
 * AEOS Platform Core — Plugin SDK
 *
 * The Plugin SDK is the bridge between contracts and implementations.
 * Kernel depends on contracts. Plugins implement contracts.
 * Kernel NEVER knows about specific plugins — only about the PluginLifecycle interface.
 *
 * Architecture:
 *   Kernel → Contract ← Plugin SDK → Plugin Implementation
 *
 * @module core/plugin-sdk
 * @version 1.0.0
 */

import { EVENTS, on, emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Plugin Registry (runtime)
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, { manifest: object, lifecycle: object, state: string }>} */
const registeredPlugins = new Map();

/**
 * Register a plugin with the platform.
 * The plugin must implement the PluginLifecycle contract.
 *
 * @param {object} manifest - PluginManifest
 * @param {object} lifecycle - PluginLifecycle implementation
 * @returns {Promise<{ success: boolean, pluginId: string }>}
 */
export async function registerPlugin(manifest, lifecycle) {
  if (registeredPlugins.has(manifest.id)) {
    throw new Error(`Plugin already registered: ${manifest.id}`);
  }

  // Validate contract compliance
  const requiredMethods = ["onRegister", "onActivate", "onDeactivate", "onUnregister", "healthCheck"];
  for (const method of requiredMethods) {
    if (typeof lifecycle[method] !== "function") {
      throw new Error(`Plugin "${manifest.id}" does not implement "${method}" — violates PluginLifecycle contract`);
    }
  }

  registeredPlugins.set(manifest.id, {
    manifest,
    lifecycle,
    state: "registered",
  });

  // Resolve dependencies
  if (manifest.dependencies?.length > 0) {
    for (const depId of manifest.dependencies) {
      if (!registeredPlugins.has(depId)) {
        throw new Error(`Plugin "${manifest.id}" depends on "${depId}" which is not registered`);
      }
      const dep = registeredPlugins.get(depId);
      if (dep.state !== "active") {
        throw new Error(`Plugin "${manifest.id}" depends on "${depId}" which is not active (state: ${dep.state})`);
      }
    }
  }

  await lifecycle.onRegister();

  emit("plugin.registered", { pluginId: manifest.id, type: manifest.type }, { source: "plugin-sdk" });

  return { success: true, pluginId: manifest.id };
}

/**
 * Activate a registered plugin.
 * @param {string} pluginId
 * @returns {Promise<{ success: boolean }>}
 */
export async function activatePlugin(pluginId) {
  const plugin = registeredPlugins.get(pluginId);
  if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);

  await plugin.lifecycle.onActivate();
  plugin.state = "active";

  emit("plugin.activated", { pluginId }, { source: "plugin-sdk" });

  return { success: true };
}

/**
 * Deactivate a plugin.
 * @param {string} pluginId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deactivatePlugin(pluginId) {
  const plugin = registeredPlugins.get(pluginId);
  if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);

  // Check if other plugins depend on this one
  for (const [id, p] of registeredPlugins) {
    if (p.manifest.dependencies?.includes(pluginId) && p.state === "active") {
      throw new Error(`Cannot deactivate "${pluginId}" — active plugin "${id}" depends on it`);
    }
  }

  await plugin.lifecycle.onDeactivate();
  plugin.state = "inactive";

  emit("plugin.deactivated", { pluginId }, { source: "plugin-sdk" });

  return { success: true };
}

/**
 * Unregister a plugin completely.
 * @param {string} pluginId
 * @returns {Promise<{ success: boolean }>}
 */
export async function unregisterPlugin(pluginId) {
  const plugin = registeredPlugins.get(pluginId);
  if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);
  if (plugin.state === "active") {
    throw new Error(`Cannot unregister active plugin "${pluginId}". Deactivate first.`);
  }

  await plugin.lifecycle.onUnregister();
  registeredPlugins.delete(pluginId);

  emit("plugin.unregistered", { pluginId }, { source: "plugin-sdk" });

  return { success: true };
}

/**
 * Health check all active plugins.
 * @returns {Promise<Array<{ pluginId: string, healthy: boolean, details: string }>>}
 */
export async function healthCheckAll() {
  const results = [];
  for (const [id, plugin] of registeredPlugins) {
    if (plugin.state === "active") {
      try {
        const result = await plugin.lifecycle.healthCheck();
        results.push({ pluginId: id, ...result });
      } catch (err) {
        results.push({ pluginId: id, healthy: false, details: err.message });
      }
    }
  }
  return results;
}

/**
 * Get all registered plugins.
 * @returns {Array<{ id: string, type: string, state: string, version: string }>}
 */
export function listPlugins() {
  return [...registeredPlugins.entries()].map(([id, p]) => ({
    id,
    type: p.manifest.type,
    state: p.state,
    version: p.manifest.version,
  }));
}

// ═══════════════════════════════════════════════════════════
// Plugin SDK exports
// ═══════════════════════════════════════════════════════════

export default {
  registerPlugin,
  activatePlugin,
  deactivatePlugin,
  unregisterPlugin,
  healthCheckAll,
  listPlugins,
};
