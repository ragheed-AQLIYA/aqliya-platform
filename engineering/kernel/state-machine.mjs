/**
 * AEOS Kernel — State Machine
 *
 * Defines the state transitions for agents, skills, tasks, and cycles.
 * All engine state changes must pass through this state machine.
 *
 * @module kernel/state-machine
 * @version 1.1
 */

// ─── Agent States ───────────────────────────────────────

export const AGENT_STATES = {
  IDLE: "idle",
  QUEUED: "queued",
  RUNNING: "running",
  REVIEW: "review",
  COMPLETED: "completed",
  FAILED: "failed",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};

/**
 * Valid agent state transitions.
 * Key = current state, Value = array of valid next states.
 */
export const AGENT_TRANSITIONS = {
  [AGENT_STATES.IDLE]: [AGENT_STATES.QUEUED],
  [AGENT_STATES.QUEUED]: [AGENT_STATES.RUNNING, AGENT_STATES.ARCHIVED],
  [AGENT_STATES.RUNNING]: [AGENT_STATES.REVIEW, AGENT_STATES.FAILED],
  [AGENT_STATES.REVIEW]: [AGENT_STATES.COMPLETED, AGENT_STATES.REJECTED],
  [AGENT_STATES.FAILED]: [AGENT_STATES.QUEUED, AGENT_STATES.ARCHIVED],
  [AGENT_STATES.REJECTED]: [AGENT_STATES.QUEUED, AGENT_STATES.ARCHIVED],
  [AGENT_STATES.COMPLETED]: [AGENT_STATES.ARCHIVED],
  [AGENT_STATES.ARCHIVED]: [],
};

// ─── Skill States ───────────────────────────────────────

export const SKILL_STATES = {
  DRAFT: "draft",
  REVIEW: "review",
  ACTIVE: "active",
  DEPRECATED: "deprecated",
  RETIRED: "retired",
  REJECTED: "rejected",
};

export const SKILL_TRANSITIONS = {
  [SKILL_STATES.DRAFT]: [SKILL_STATES.REVIEW],
  [SKILL_STATES.REVIEW]: [SKILL_STATES.ACTIVE, SKILL_STATES.REJECTED],
  [SKILL_STATES.ACTIVE]: [SKILL_STATES.DEPRECATED],
  [SKILL_STATES.DEPRECATED]: [SKILL_STATES.RETIRED, SKILL_STATES.ACTIVE],
  [SKILL_STATES.REJECTED]: [SKILL_STATES.DRAFT],
  [SKILL_STATES.RETIRED]: [],
};

// ─── Task States ────────────────────────────────────────

export const TASK_STATES = {
  BACKLOG: "backlog",
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
  BLOCKED: "blocked",
  CANCELLED: "cancelled",
};

export const TASK_TRANSITIONS = {
  [TASK_STATES.BACKLOG]: [TASK_STATES.PLANNED, TASK_STATES.CANCELLED],
  [TASK_STATES.PLANNED]: [TASK_STATES.IN_PROGRESS, TASK_STATES.BACKLOG],
  [TASK_STATES.IN_PROGRESS]: [TASK_STATES.IN_REVIEW, TASK_STATES.BLOCKED],
  [TASK_STATES.IN_REVIEW]: [TASK_STATES.DONE, TASK_STATES.IN_PROGRESS],
  [TASK_STATES.BLOCKED]: [TASK_STATES.IN_PROGRESS, TASK_STATES.CANCELLED],
  [TASK_STATES.DONE]: [],
  [TASK_STATES.CANCELLED]: [TASK_STATES.BACKLOG],
};

// ─── Cycle States ───────────────────────────────────────

export const CYCLE_STATES = {
  INIT: "init",
  SCANNING: "scanning",
  ANALYZING: "analyzing",
  PLANNING: "planning",
  EXECUTING: "executing",
  VERIFYING: "verifying",
  LEARNING: "learning",
  COMPLETED: "completed",
};

export const CYCLE_TRANSITIONS = {
  [CYCLE_STATES.INIT]: [CYCLE_STATES.SCANNING],
  [CYCLE_STATES.SCANNING]: [CYCLE_STATES.ANALYZING],
  [CYCLE_STATES.ANALYZING]: [CYCLE_STATES.PLANNING],
  [CYCLE_STATES.PLANNING]: [CYCLE_STATES.EXECUTING],
  [CYCLE_STATES.EXECUTING]: [CYCLE_STATES.VERIFYING],
  [CYCLE_STATES.VERIFYING]: [CYCLE_STATES.LEARNING, CYCLE_STATES.EXECUTING],
  [CYCLE_STATES.LEARNING]: [CYCLE_STATES.COMPLETED],
  [CYCLE_STATES.COMPLETED]: [CYCLE_STATES.INIT],
};

// ─── Transition Validator ───────────────────────────────

/**
 * Validates whether a state transition is allowed.
 * @param {Record<string, string[]>} transitions - State transition map
 * @param {string} from - Current state
 * @param {string} to - Target state
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateTransition(transitions, from, to) {
  if (!transitions[from]) {
    return { valid: false, reason: `Unknown source state: ${from}` };
  }
  if (!transitions[from].includes(to)) {
    return {
      valid: false,
      reason: `Invalid transition: ${from} → ${to}. Allowed: ${transitions[from].join(", ")}`,
    };
  }
  return { valid: true };
}

/**
 * Applies a state transition, returning the new state or throwing.
 * @param {Record<string, string[]>} transitions
 * @param {string} current
 * @param {string} target
 * @returns {string} new state
 */
export function applyTransition(transitions, current, target) {
  const result = validateTransition(transitions, current, target);
  if (!result.valid) {
    throw new Error(`State transition error: ${result.reason}`);
  }
  return target;
}

// ─── Exports ────────────────────────────────────────────

export default {
  AGENT_STATES,
  AGENT_TRANSITIONS,
  SKILL_STATES,
  SKILL_TRANSITIONS,
  TASK_STATES,
  TASK_TRANSITIONS,
  CYCLE_STATES,
  CYCLE_TRANSITIONS,
  validateTransition,
  applyTransition,
};
