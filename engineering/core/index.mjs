/**
 * AEOS Platform Core — Index
 *
 * Contract-first architecture:
 *   Everything depends on contracts.
 *   Kernel implements contracts.
 *   Plugins extend through contracts.
 *
 * Boot sequence:
 *   1. Load contracts (types/interfaces)
 *   2. Initialize kernel (event bus, state machine, runtime, metrics)
 *   3. Mount core modules (registry, workflow, memory, governance, etc.)
 *   4. Mount plugins (agents, skills, dashboards, reports)
 *   5. Activate runtime (scheduler starts)
 *   6. Begin execution cycles
 *
 * @module core/index
 * @version 1.0.0
 */

import { boot as bootKernel } from "../kernel/index.mjs";
import * as pluginSdk from "./plugin-sdk.mjs";
import * as registry from "./registry.mjs";
import * as workflowEngine from "./workflow-engine.mjs";
import * as memorySystem from "./memory-system.mjs";
import * as governanceEngine from "./governance-engine.mjs";
import * as collaborationProtocol from "./collaboration-protocol.mjs";
import * as capabilitySystem from "./capability-system.mjs";
import * as digitalTwin from "./digital-twin.mjs";

export const PLATFORM_VERSION = "1.0.0";
export const PLATFORM_NAME = "AEOS Platform Core";

/**
 * Boot the full AEOS Platform.
 * @returns {{ version: string, modules: string[], ready: boolean }}
 */
export function boot() {
  const kernel = bootKernel();

  console.log(`[${PLATFORM_NAME}] Booting v${PLATFORM_VERSION}...`);
  console.log(`[${PLATFORM_NAME}] Kernel: v${kernel.version}`);

  const modules = [
    { name: "contracts", status: "loaded" },
    { name: "plugin-sdk", status: "ready" },
    { name: "registry", status: "ready" },
    { name: "workflow-engine", status: "ready", workflows: 3 },
    { name: "memory-system", status: "ready", types: memorySystem.TYPES.length },
    { name: "governance-engine", status: "ready", policies: governanceEngine.listPolicies().length, rules: governanceEngine.listRules().length },
    { name: "collaboration-protocol", status: "ready" },
    { name: "capability-system", status: "ready", capabilities: capabilitySystem.listCapabilities().length },
    { name: "digital-twin", status: "ready", layers: digitalTwin.LAYERS.length },
  ];

  console.log(`[${PLATFORM_NAME}] ${modules.length} modules loaded. Ready.`);

  return {
    version: PLATFORM_VERSION,
    kernelVersion: kernel.version,
    modules,
    ready: true,
  };
}

// ─── Exports ────────────────────────────────────────────

export { pluginSdk, registry, workflowEngine, memorySystem, governanceEngine, collaborationProtocol, capabilitySystem, digitalTwin };

export default {
  boot,
  PLATFORM_VERSION,
  PLATFORM_NAME,
  pluginSdk,
  registry,
  workflowEngine,
  memorySystem,
  governanceEngine,
  collaborationProtocol,
  capabilitySystem,
  digitalTwin,
};
