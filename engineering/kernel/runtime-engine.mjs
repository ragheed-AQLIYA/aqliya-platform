/**
 * AEOS Kernel — Runtime Engine
 *
 * The execution core. Manages the scheduler, queue, and execution context
 * for all agents. All agent dispatch goes through this engine.
 *
 * @module kernel/runtime-engine
 * @version 1.1
 */

import { emit, EVENTS } from "./event-engine.mjs";
import { AGENT_STATES, applyTransition } from "./state-machine.mjs";

// ─── Agent Queue ────────────────────────────────────────

/** @type {Array<{ agentId: string, task: any, priority: number, queuedAt: string }>} */
let queue = [];

// ─── Active Agents ──────────────────────────────────────

/** @type {Map<string, { state: string, startedAt: string | null, task: any }>} */
const agentStates = new Map();

// ─── Scheduler ──────────────────────────────────────────

/**
 * Add a task to the agent queue.
 * @param {string} agentId
 * @param {any} task
 * @param {number} [priority=5]
 * @returns {{ queued: boolean, position: number }}
 */
export function enqueue(agentId, task, priority = 5) {
  const entry = {
    agentId,
    task,
    priority,
    queuedAt: new Date().toISOString(),
  };

  queue.push(entry);
  queue.sort((a, b) => b.priority - a.priority);

  if (!agentStates.has(agentId)) {
    agentStates.set(agentId, { state: AGENT_STATES.IDLE, startedAt: null, task: null });
  } else {
    applyTransition(AGENT_STATES.IDLE, agentStates.get(agentId).state, AGENT_STATES.QUEUED);
    agentStates.get(agentId).state = AGENT_STATES.QUEUED;
  }

  emit(EVENTS.AGENT_DISPATCHED, { agentId, task: task.summary || task, priority }, { source: "runtime-engine" });

  return { queued: true, position: queue.filter((q) => q.agentId === agentId).length };
}

/**
 * Dequeue and execute the next highest-priority task.
 * @returns {{ agentId: string, task: any } | null}
 */
export function dequeue() {
  if (queue.length === 0) return null;

  const next = queue.shift();
  const state = agentStates.get(next.agentId);

  if (state) {
    state.state = AGENT_STATES.RUNNING;
    state.startedAt = new Date().toISOString();
    state.task = next.task;
  }

  emit(EVENTS.AGENT_RUNNING, { agentId: next.agentId }, { source: "runtime-engine" });

  return next;
}

/**
 * Mark an agent's task as completed.
 * @param {string} agentId
 * @param {{ success: boolean, output?: any }} result
 */
export function complete(agentId, result) {
  const state = agentStates.get(agentId);
  if (!state) return;

  if (result.success) {
    state.state = AGENT_STATES.COMPLETED;
  } else {
    state.state = AGENT_STATES.FAILED;
  }

  emit(EVENTS.AGENT_COMPLETED, {
    agentId,
    success: result.success,
    output: result.output,
  }, { source: "runtime-engine" });

  // Auto-archive after completion
  state.state = AGENT_STATES.ARCHIVED;
  emit(EVENTS.AGENT_ARCHIVED, { agentId }, { source: "runtime-engine" });
}

/**
 * Execute a full cycle: INIT → SCANNING → ANALYZING → PLANNING → EXECUTING → VERIFYING → LEARNING → COMPLETED
 * @param {string} cycleId
 * @param {Array<{ agentId: string, task: any }>} tasks
 * @returns {Promise<{ cycleId: string, results: Array }>}
 */
export async function executeCycle(cycleId, tasks) {
  emit(EVENTS.CYCLE_STARTED, { cycleId, taskCount: tasks.length }, { source: "runtime-engine" });

  const results = [];

  for (const task of tasks) {
    enqueue(task.agentId, task.task, task.priority || 5);
    const dequeued = dequeue();
    if (dequeued) {
      emit(EVENTS.CYCLE_PHASE_CHANGED, {
        cycleId,
        phase: "executing",
        agentId: dequeued.agentId,
      }, { source: "runtime-engine" });

      try {
        // In a real implementation, this would dispatch to the actual agent
        // For now, we simulate execution
        const result = { success: true, output: `Simulated execution for ${dequeued.agentId}` };
        complete(dequeued.agentId, result);
        results.push({ agentId: dequeued.agentId, ...result });
      } catch (err) {
        complete(dequeued.agentId, { success: false, output: err.message });
        results.push({ agentId: dequeued.agentId, success: false, error: err.message });
      }
    }
  }

  emit(EVENTS.CYCLE_COMPLETED, { cycleId, resultCount: results.length }, { source: "runtime-engine" });

  return { cycleId, results };
}

// ─── State Query ────────────────────────────────────────

/**
 * Get the current state of an agent.
 * @param {string} agentId
 * @returns {{ state: string, startedAt: string | null } | null}
 */
export function getAgentState(agentId) {
  const state = agentStates.get(agentId);
  return state ? { state: state.state, startedAt: state.startedAt } : null;
}

/**
 * Get the current queue.
 * @returns {Array}
 */
export function getQueue() {
  return [...queue].map((q) => ({
    agentId: q.agentId,
    priority: q.priority,
    queuedAt: q.queuedAt,
    summary: q.task?.summary || q.task,
  }));
}

/**
 * Get all agent states.
 * @returns {Record<string, string>}
 */
export function getAllAgentStates() {
  const states = {};
  for (const [id, state] of agentStates) {
    states[id] = state.state;
  }
  return states;
}

/**
 * Count agents by state.
 * @returns {Record<string, number>}
 */
export function countByState() {
  const counts = {};
  for (const [, state] of agentStates) {
    counts[state.state] = (counts[state.state] || 0) + 1;
  }
  return counts;
}

// ─── Exports ────────────────────────────────────────────

export default {
  enqueue,
  dequeue,
  complete,
  executeCycle,
  getAgentState,
  getQueue,
  getAllAgentStates,
  countByState,
};
