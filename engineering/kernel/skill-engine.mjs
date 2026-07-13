/**
 * AEOS Kernel — Skill Engine
 *
 * Manages skill lifecycle: DRAFT → REVIEW → ACTIVE → DEPRECATED → RETIRED
 * Matches skills to agents based on capability requirements.
 *
 * @module kernel/skill-engine
 * @version 1.1
 */

import { emit, EVENTS } from "./event-engine.mjs";
import { SKILL_STATES, SKILL_TRANSITIONS, validateTransition } from "./state-machine.mjs";

/** @type {Map<string, { state: string, metadata: object, history: Array, qualityScore: number, timesUsed: number }>} */
const skills = new Map();

/**
 * Register a skill.
 * @param {string} skillId
 * @param {object} metadata
 */
export function registerSkill(skillId, metadata = {}) {
  if (skills.has(skillId)) throw new Error(`Skill already registered: ${skillId}`);

  skills.set(skillId, {
    state: metadata.status || SKILL_STATES.ACTIVE,
    metadata,
    history: [{ state: metadata.status || SKILL_STATES.ACTIVE, timestamp: new Date().toISOString() }],
    qualityScore: metadata.qualityScore || 70,
    timesUsed: 0,
  });

  emit(EVENTS.SKILL_REGISTERED, { skillId, metadata }, { source: "skill-engine" });
  return { skillId, state: skills.get(skillId).state };
}

/**
 * Record skill usage — updates quality score.
 * @param {string} skillId
 * @param {boolean} success
 * @param {number} durationMs
 */
export function recordUsage(skillId, success, durationMs) {
  const skill = skills.get(skillId);
  if (!skill) return;

  skill.timesUsed++;
  skill.qualityScore = success
    ? Math.min(100, skill.qualityScore + 1)
    : Math.max(0, skill.qualityScore - 3);

  emit(EVENTS.SKILL_USED, { skillId, success, durationMs, qualityScore: skill.qualityScore }, { source: "skill-engine" });
}

/**
 * Find skills compatible with an agent.
 * @param {string[]} agentSkills - Skill IDs from agent metadata
 * @returns {Array}
 */
export function getCompatibleSkills(agentSkills) {
  return [...skills.values()]
    .filter((s) => agentSkills.includes(s.metadata.id) || s.metadata.compatibleAgents?.some((a) => agentSkills.includes(a)))
    .map((s) => ({ id: s.metadata.id, name: s.metadata.name, qualityScore: s.qualityScore, timesUsed: s.timesUsed }));
}

/**
 * Deprecate a skill.
 * @param {string} skillId
 * @param {string} reason
 */
export function deprecateSkill(skillId, reason) {
  return transition(skillId, SKILL_STATES.DEPRECATED, reason);
}

/**
 * Transition a skill state.
 */
export function transition(skillId, targetState, reason = "") {
  const skill = skills.get(skillId);
  if (!skill) throw new Error(`Skill not found: ${skillId}`);

  const validation = validateTransition(SKILL_TRANSITIONS, skill.state, targetState);
  if (!validation.valid) throw new Error(`Invalid skill transition: ${validation.reason}`);

  skill.state = targetState;
  skill.history.push({ state: targetState, timestamp: new Date().toISOString(), reason });

  emit(`skill.${targetState}`, { skillId }, { source: "skill-engine" });

  return { skillId, previousState: skill.state, newState: targetState };
}

export function getSkill(skillId) { return skills.get(skillId) || null; }
export function getAllSkills() { return [...skills.values()].map((s) => ({ id: s.metadata.id, name: s.metadata.name, state: s.state, qualityScore: s.qualityScore, timesUsed: s.timesUsed })); }
export function skillCount() { return skills.size; }

export default { registerSkill, recordUsage, getCompatibleSkills, deprecateSkill, transition, getSkill, getAllSkills, skillCount };
