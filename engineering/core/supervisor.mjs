/**
 * AEOS Platform Core — AEOS Supervisor (Meta-Agent)
 *
 * The AEOS Supervisor is the system's self-management layer.
 * It does NOT perform engineering work — it MANAGES the agents that do.
 *
 * Responsibilities:
 *   - Monitor all agents for quality degradation
 *   - Reschedule work when agents fail
 *   - Detect repeated patterns → trigger skill extraction
 *   - Balance load across agents
 *   - Decide when to start new improvement cycles
 *   - Enforce governance policies globally
 *
 * This is the "system that manages the system."
 *
 * @module core/supervisor
 * @version 1.0.0
 */

import { emit, on, EVENTS } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Supervisor State
// ═══════════════════════════════════════════════════════════

const state = {
  status: "active",
  startedAt: new Date().toISOString(),
  agentsMonitored: 0,
  cyclesSupervised: 0,
  skillsExtracted: 0,
  violationsDetected: 0,
  qualityAlerts: [],
  patternsDetected: [],
};

// ═══════════════════════════════════════════════════════════
// Agent Monitoring
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, { successRate: number, failures: number, lastActive: string, status: string }>} */
const agentHealth = new Map();

/**
 * Register an agent for monitoring.
 * @param {string} agentId
 */
export function monitorAgent(agentId) {
  agentHealth.set(agentId, {
    successRate: 100,
    failures: 0,
    lastActive: new Date().toISOString(),
    status: "active",
  });
  state.agentsMonitored++;
  emit("supervisor.agent_registered", { agentId }, { source: "supervisor" });
}

/**
 * Report agent execution result.
 * @param {string} agentId
 * @param {boolean} success
 * @param {number} durationMs
 */
export function reportExecution(agentId, success, durationMs) {
  const health = agentHealth.get(agentId);
  if (!health) return;

  health.lastActive = new Date().toISOString();

  if (!success) {
    health.failures++;
    // Recalculate rolling success rate (simple: last 10 executions)
    health.successRate = Math.max(0, health.successRate - 10);

    if (health.failures >= 3) {
      health.status = "degraded";
      state.qualityAlerts.push({
        agentId,
        reason: `Agent ${agentId} has ${health.failures} consecutive failures`,
        timestamp: new Date().toISOString(),
      });
      emit("supervisor.quality_alert", { agentId, failures: health.failures }, { source: "supervisor" });
    }
  } else {
    health.successRate = Math.min(100, health.successRate + 2);
    if (health.failures > 0) health.failures = 0;
    if (health.status === "degraded") health.status = "active";
  }
}

/**
 * Check agent health and return degraded agents.
 * @returns {Array<{ agentId: string, status: string, successRate: number }>}
 */
export function checkAgentHealth() {
  const degraded = [];
  for (const [agentId, health] of agentHealth) {
    if (health.status !== "active" || health.successRate < 50) {
      degraded.push({ agentId, status: health.status, successRate: health.successRate, failures: health.failures });
    }
  }
  return degraded;
}

// ═══════════════════════════════════════════════════════════
// Pattern Detection → Skill Extraction
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, number>} pattern → occurrence count */
const patternFrequency = new Map();

/**
 * Report an engineering action. The supervisor tracks frequency
 * to detect patterns worth extracting as skills.
 *
 * @param {string} action - Description of the action
 * @param {string} agentId
 */
export function reportAction(action, agentId) {
  const key = `${agentId}:${action}`;
  const count = (patternFrequency.get(key) || 0) + 1;
  patternFrequency.set(key, count);

  if (count >= 5) {
    state.patternsDetected.push({
      pattern: action,
      agentId,
      frequency: count,
      detectedAt: new Date().toISOString(),
    });

    emit("supervisor.pattern_detected", { pattern: action, agentId, frequency: count }, { source: "supervisor" });
  }
}

/**
 * Get patterns that are candidates for skill extraction.
 * Patterns with frequency >= 5 are candidates.
 * @returns {Array}
 */
export function getSkillCandidates() {
  return [...patternFrequency.entries()]
    .filter(([, count]) => count >= 5)
    .map(([key, count]) => {
      const [agentId, action] = key.split(":");
      return { agentId, action, frequency: count, candidate: true };
    })
    .sort((a, b) => b.frequency - a.frequency);
}

// ═══════════════════════════════════════════════════════════
// Cycle Management
// ═══════════════════════════════════════════════════════════

/**
 * Decide whether to start a new improvement cycle.
 * @returns {{ shouldStart: boolean, reason: string }}
 */
export function shouldStartCycle() {
  const degraded = checkAgentHealth();
  const candidates = getSkillCandidates();

  if (degraded.length > 0) {
    return { shouldStart: true, reason: `${degraded.length} degraded agents need attention` };
  }

  if (candidates.length > 0) {
    return { shouldStart: true, reason: `${candidates.length} skill candidates detected` };
  }

  // Start cycle every 50 actions
  let totalActions = 0;
  for (const [, count] of patternFrequency) totalActions += count;
  if (totalActions > 0 && totalActions % 50 === 0) {
    return { shouldStart: true, reason: "Scheduled cycle after 50 actions" };
  }

  return { shouldStart: false, reason: "No triggers detected" };
}

// ═══════════════════════════════════════════════════════════
// Load Balancing
// ═══════════════════════════════════════════════════════════

/**
 * Suggest which agent should handle a task, based on current load.
 * @param {string[]} capableAgents - Agents capable of the task
 * @returns {string} - Recommended agent ID
 */
export function suggestAgent(capableAgents) {
  let bestAgent = capableAgents[0];
  let bestScore = -1;

  for (const agentId of capableAgents) {
    const health = agentHealth.get(agentId);
    if (!health || health.status !== "active") continue;

    // Score = success rate (higher is better)
    const score = health.successRate;
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agentId;
    }
  }

  return bestAgent;
}

// ═══════════════════════════════════════════════════════════
// Supervisor Report
// ═══════════════════════════════════════════════════════════

/**
 * Get a comprehensive supervisor status report.
 * @returns {object}
 */
export function getReport() {
  return {
    supervisor: {
      status: state.status,
      uptime: Date.now() - new Date(state.startedAt).getTime(),
      agentsMonitored: state.agentsMonitored,
      cyclesSupervised: state.cyclesSupervised,
      skillsExtracted: state.skillsExtracted,
      violationsDetected: state.violationsDetected,
    },
    agentHealth: [...agentHealth.entries()].map(([id, h]) => ({ agentId: id, ...h })),
    qualityAlerts: state.qualityAlerts.slice(-10),
    patternsDetected: state.patternsDetected.slice(-10),
    skillCandidates: getSkillCandidates(),
    shouldCycle: shouldStartCycle(),
  };
}

// ─── Listen to Events ──────────────────────────────────

on("agent.completed", (payload) => {
  reportExecution(payload.agentId, true, payload.durationMs || 0);
});

on("agent.failed", (payload) => {
  reportExecution(payload.agentId, false, payload.durationMs || 0);
});

on("skill.used", (payload) => {
  reportAction(`skill_used:${payload.skillId}`, payload.agentId || "unknown");
});

on("cycle.completed", () => {
  state.cyclesSupervised++;
});

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  monitorAgent,
  reportExecution,
  reportAction,
  checkAgentHealth,
  getSkillCandidates,
  shouldStartCycle,
  suggestAgent,
  getReport,
};
