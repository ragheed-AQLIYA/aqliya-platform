/**
 * AEOS Kernel — Index / Entry Point
 *
 * @module kernel/index
 * @version 1.1
 */

import _stateMachine from "./state-machine.mjs";
import _eventEngine from "./event-engine.mjs";
import _runtimeEngine from "./runtime-engine.mjs";
import _metricsEngine from "./metrics-engine.mjs";
import _agentEngine from "./agent-engine.mjs";
import _skillEngine from "./skill-engine.mjs";
import _memoryEngine from "./memory-engine.mjs";
import _governanceEngine from "./governance-engine.mjs";
import _registryLoader from "./registry-loader.mjs";

export const stateMachine = _stateMachine;
export const eventEngine = _eventEngine;
export const runtimeEngine = _runtimeEngine;
export const metricsEngine = _metricsEngine;
export const agentEngine = _agentEngine;
export const skillEngine = _skillEngine;
export const memoryEngine = _memoryEngine;
export const governanceEngine = _governanceEngine;
export const registryLoader = _registryLoader;

export const AGENT_STATES = stateMachine.AGENT_STATES;
export const SKILL_STATES = stateMachine.SKILL_STATES;
export const TASK_STATES = stateMachine.TASK_STATES;
export const CYCLE_STATES = stateMachine.CYCLE_STATES;
export const EVENTS = eventEngine.EVENTS;
export const METRICS = metricsEngine.METRICS;

export const KERNEL_VERSION = "1.1.0";
export const KERNEL_STATUS = "active";

export function boot() {
  console.log(`[AEOS Kernel] Booting v${KERNEL_VERSION}...`);
  return {
    version: KERNEL_VERSION,
    engines: [
      "state-machine", "event-engine", "runtime-engine", "metrics-engine",
      "agent-engine", "skill-engine", "memory-engine", "governance-engine (kernel)", "registry-loader",
    ],
    ready: true,
  };
}

export default {
  boot, KERNEL_VERSION, KERNEL_STATUS,
  stateMachine, eventEngine, runtimeEngine, metricsEngine,
  agentEngine, skillEngine, memoryEngine, governanceEngine, registryLoader,
};
