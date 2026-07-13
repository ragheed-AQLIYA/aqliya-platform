/**
 * AEOS Kernel — Agent Engine
 *
 * Manages agent lifecycle: IDLE → QUEUED → RUNNING → REVIEW → COMPLETED → ARCHIVED
 * All state transitions pass through the kernel state machine.
 *
 * @module kernel/agent-engine
 * @version 1.1
 */

import { emit, EVENTS } from "./event-engine.mjs";
import { AGENT_STATES, AGENT_TRANSITIONS, validateTransition } from "./state-machine.mjs";

/** @type {Map<string, { state: string, metadata: object, history: Array, startedAt: string | null }>} */
const agents = new Map();

/**
 * Register an agent with the kernel.
 * @param {string} agentId
 * @param {object} metadata
 */
export function registerAgent(agentId, metadata = {}) {
  if (agents.has(agentId)) throw new Error(`Agent already registered: ${agentId}`);

  agents.set(agentId, {
    state: AGENT_STATES.IDLE,
    metadata,
    history: [{ state: AGENT_STATES.IDLE, timestamp: new Date().toISOString(), reason: "registered" }],
    startedAt: null,
  });

  emit(EVENTS.AGENT_REGISTERED, { agentId, metadata }, { source: "agent-engine" });
  return { agentId, state: AGENT_STATES.IDLE };
}

/**
 * Transition an agent to a new state.
 * @param {string} agentId
 * @param {string} targetState
 * @param {string} [reason]
 */
export function transition(agentId, targetState, reason = "") {
  const agent = agents.get(agentId);
  if (!agent) throw new Error(`Agent not found: ${agentId}`);

  const validation = validateTransition(AGENT_TRANSITIONS, agent.state, targetState);
  if (!validation.valid) throw new Error(`Invalid transition for ${agentId}: ${validation.reason}`);

  agent.state = targetState;
  agent.history.push({ state: targetState, timestamp: new Date().toISOString(), reason });

  if (targetState === AGENT_STATES.RUNNING) agent.startedAt = new Date().toISOString();

  emit(`agent.${targetState}`, { agentId }, { source: "agent-engine" });

  return { agentId, previousState: agent.state, newState: targetState };
}

export function getAgent(agentId) { return agents.get(agentId) || null; }
export function getAllAgents() { return [...agents.entries()].map(([id, a]) => ({ id, state: a.state, metadata: a.metadata })); }
export function countByState() {
  const counts = {};
  for (const [, a] of agents) { counts[a.state] = (counts[a.state] || 0) + 1; }
  return counts;
}
export function agentCount() { return agents.size; }

export default { registerAgent, transition, getAgent, getAllAgents, countByState, agentCount };
