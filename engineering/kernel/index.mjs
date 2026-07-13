/**
 * AEOS Kernel — Index / Entry Point
 *
 * Boot sequence:
 *   1. Load kernel
 *   2. Mount plugin: Agent Registry
 *   3. Mount plugin: Skill Registry
 *   4. Mount plugin: Data Lake
 *   5. Activate Event Bus
 *   6. Runtime Engine becomes ready
 *   7. Agent dispatch begins
 *
 * @module kernel/index
 * @version 1.1
 */

export { default as stateMachine, AGENT_STATES, SKILL_STATES, TASK_STATES, CYCLE_STATES } from "./state-machine.mjs";
export { default as eventEngine, EVENTS } from "./event-engine.mjs";
export { default as runtimeEngine } from "./runtime-engine.mjs";
export { default as metricsEngine, METRICS } from "./metrics-engine.mjs";
export { default as agentEngine } from "./agent-engine.mjs";
export { default as skillEngine } from "./skill-engine.mjs";
export { default as memoryEngine } from "./memory-engine.mjs";
export { default as governanceEngine } from "./governance-engine.mjs";
export { default as registryLoader } from "./registry-loader.mjs";

export const KERNEL_VERSION = "1.1.0";
export const KERNEL_STATUS = "active";

/**
 * Boot the AEOS Kernel.
 */
export function boot() {
  console.log(`[AEOS Kernel] Booting v${KERNEL_VERSION}...`);

  return {
    version: KERNEL_VERSION,
    engines: [
      "state-machine",
      "event-engine",
      "runtime-engine",
      "metrics-engine",
      "agent-engine",
      "skill-engine",
      "memory-engine",
      "governance-engine (kernel)",
      "registry-loader",
    ],
    ready: true,
  };
}

export default {
  boot,
  KERNEL_VERSION,
  KERNEL_STATUS,
  stateMachine,
  eventEngine,
  runtimeEngine,
  metricsEngine,
  agentEngine,
  skillEngine,
  memoryEngine,
  governanceEngine,
  registryLoader,
};
