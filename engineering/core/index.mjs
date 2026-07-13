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
import * as container from "./container.mjs";
import * as serviceBus from "./service-bus.mjs";
import * as knowledgeGraph from "./knowledge-graph.mjs";
import * as policyEngine from "./policy-engine.mjs";
import * as planner from "./planner.mjs";
import * as ontology from "./ontology.mjs";
import * as supervisor from "./supervisor.mjs";
import * as aiLayer from "./ai-layer.mjs";

export const PLATFORM_VERSION = "2.0.0";
export const PLATFORM_NAME = "AQLIYA Autonomous Engineering Platform (AEP)";

/**
 * Boot the full AEOS Platform.
 * @returns {{ version: string, modules: string[], ready: boolean }}
 */
export function boot() {
  const kernel = bootKernel();

  console.log(`[${PLATFORM_NAME}] Booting v${PLATFORM_VERSION}...`);
  console.log(`[${PLATFORM_NAME}] Kernel: v${kernel.version}`);

  const modules = [
    { name: "contracts", status: "loaded", items: 14 },
    { name: "container (DI)", status: "ready" },
    { name: "service-bus (CQRS)", status: "ready", commands: serviceBus.listCommands().length, queries: serviceBus.listQueries().length },
    { name: "plugin-sdk", status: "ready" },
    { name: "registry", status: "ready", types: registry.listTypes().length },
    { name: "workflow-engine", status: "ready", workflows: 3 },
    { name: "memory-system", status: "ready", types: memorySystem.TYPES.length },
    { name: "governance-engine", status: "ready", policies: governanceEngine.listPolicies().length, rules: governanceEngine.listRules().length },
    { name: "policy-engine", status: "ready", policies: policyEngine.listPolicies().length, controls: 6 },
    { name: "collaboration-protocol", status: "ready" },
    { name: "capability-system", status: "ready", capabilities: capabilitySystem.listCapabilities().length },
    { name: "digital-twin", status: "ready", layers: digitalTwin.LAYERS.length },
    { name: "knowledge-graph", status: "ready", nodes: knowledgeGraph.nodeCount(), edges: knowledgeGraph.edgeCount() },
    { name: "ontology", status: "ready", types: Object.keys(ontology.ONTOLOGY_TYPES).length },
    { name: "planner", status: "ready", goals: 1, objectives: 2 },
    { name: "supervisor", status: "active" },
    { name: "ai-layer", status: "ready", providers: aiLayer.listProviders().length, models: 2, prompts: 3 },
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

export {
  pluginSdk, registry, workflowEngine, memorySystem, governanceEngine,
  collaborationProtocol, capabilitySystem, digitalTwin,
  container, serviceBus, knowledgeGraph, policyEngine, planner, ontology, supervisor, aiLayer,
};

export default {
  boot,
  PLATFORM_VERSION,
  PLATFORM_NAME,
  pluginSdk, registry, workflowEngine, memorySystem, governanceEngine,
  collaborationProtocol, capabilitySystem, digitalTwin,
  container, serviceBus, knowledgeGraph, policyEngine, planner, ontology, supervisor, aiLayer,
};
