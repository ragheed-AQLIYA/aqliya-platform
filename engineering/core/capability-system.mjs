/**
 * AEOS Platform Core — Capability System
 *
 * Defines the hierarchy:
 *   Capability → Skill → Procedure → Task → Action
 *
 * Capabilities are reusable bundles of skills.
 * Procedures are sequenced skill executions.
 * Tasks are instances of procedures with context.
 * Actions are atomic skill invocations.
 *
 * @module core/capability-system
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Capability Store
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} capabilities */
const capabilities = new Map();

/** @type {Map<string, object>} procedures */
const procedures = new Map();

/** @type {Map<string, object>} actions */
const actions = new Map();

// ═══════════════════════════════════════════════════════════
// Capability
// ═══════════════════════════════════════════════════════════

export function defineCapability({ id, name, description, skills = [], procedures: procIds = [], maturityLevel = 1 }) {
  const cap = { id, name, description, skills, procedures: procIds, maturityLevel, version: "1.0", definedAt: new Date().toISOString() };
  capabilities.set(id, cap);
  emit("capability.defined", { capabilityId: id, name }, { source: "capability-system" });
  return cap;
}

export function getCapability(id) { return capabilities.get(id) || null; }
export function listCapabilities() { return [...capabilities.values()]; }

// ═══════════════════════════════════════════════════════════
// Procedure (sequenced skills)
// ═══════════════════════════════════════════════════════════

export function defineProcedure({ id, capabilityId, name, steps = [], estimatedDurationMs = 60000, requiredSkills = [] }) {
  if (!capabilities.has(capabilityId)) throw new Error(`Capability not found: ${capabilityId}`);

  const proc = { id, capabilityId, name, steps, estimatedDurationMs, requiredSkills, version: "1.0", definedAt: new Date().toISOString() };
  procedures.set(id, proc);

  // Link to capability
  const cap = capabilities.get(capabilityId);
  cap.procedures.push(id);

  emit("procedure.defined", { procedureId: id, capabilityId, name }, { source: "capability-system" });
  return proc;
}

export function getProcedure(id) { return procedures.get(id) || null; }

/**
 * Execute a procedure — runs all actions in sequence.
 * @param {string} procedureId
 * @param {Function} executeAction - (actionId) => Promise<{ success: boolean, output: unknown }>
 * @returns {Promise<{ success: boolean, results: Array }>}
 */
export async function executeProcedure(procedureId, executeAction) {
  const proc = procedures.get(procedureId);
  if (!proc) throw new Error(`Procedure not found: ${procedureId}`);

  emit("procedure.execution_started", { procedureId }, { source: "capability-system" });

  const results = [];
  let overallSuccess = true;

  for (const actionId of proc.steps) {
    const startMs = Date.now();
    try {
      const output = await executeAction(actionId);
      results.push({ actionId, success: true, output, durationMs: Date.now() - startMs });
    } catch (err) {
      results.push({ actionId, success: false, output: err.message, durationMs: Date.now() - startMs });
      overallSuccess = false;
      break; // Stop on first failure
    }
  }

  emit("procedure.execution_completed", { procedureId, overallSuccess }, { source: "capability-system" });

  return { success: overallSuccess, results };
}

// ═══════════════════════════════════════════════════════════
// Action (atomic skill invocation)
// ═══════════════════════════════════════════════════════════

export function defineAction({ id, name, description, agentId, skillId, parameters = {}, expectedOutput = "" }) {
  const action = { id, name, description, agentId, skillId, parameters, expectedOutput, version: "1.0", definedAt: new Date().toISOString() };
  actions.set(id, action);
  emit("action.defined", { actionId: id, name }, { source: "capability-system" });
  return action;
}

export function getAction(id) { return actions.get(id) || null; }
export function listActions() { return [...actions.values()]; }

// ═══════════════════════════════════════════════════════════
// Predefined Capabilities
// ═══════════════════════════════════════════════════════════

// Architecture Review Capability
defineCapability({
  id: "architecture-review",
  name: "Architecture Review",
  description: "Validates architecture compliance — layer discipline, product boundaries, Core reuse, DDD alignment.",
  skills: ["eng-architecture-review", "eng-code-review"],
  maturityLevel: 4,
});

defineProcedure({
  id: "arch-review-procedure",
  capabilityId: "architecture-review",
  name: "Architecture Review Procedure",
  steps: ["load-graph", "check-layers", "check-boundaries", "check-dependencies", "generate-report"],
  estimatedDurationMs: 180000,
  requiredSkills: ["eng-architecture-review"],
});

// Security Audit Capability
defineCapability({
  id: "security-audit",
  name: "Security Audit",
  description: "Comprehensive security posture validation.",
  skills: ["eng-security-audit", "eng-governance-compliance"],
  maturityLevel: 4,
});

// Code Review Capability
defineCapability({
  id: "code-review",
  name: "Code Review",
  description: "Automated code quality review — complexity, duplication, patterns, SOLID.",
  skills: ["eng-code-review"],
  maturityLevel: 3,
});

defineProcedure({
  id: "code-review-procedure",
  capabilityId: "code-review",
  name: "Code Review Procedure",
  steps: ["scan-complexity", "detect-duplication", "check-patterns", "validate-solid", "generate-report"],
  estimatedDurationMs: 120000,
  requiredSkills: ["eng-code-review"],
});

// Release Validation Capability
defineCapability({
  id: "release-validation",
  name: "Release Validation",
  description: "Pre-release gate — validates all governance rules, runs security audit, checks compliance.",
  skills: ["eng-governance-compliance", "eng-security-audit"],
  maturityLevel: 4,
});

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  defineCapability,
  getCapability,
  listCapabilities,
  defineProcedure,
  getProcedure,
  executeProcedure,
  defineAction,
  getAction,
  listActions,
};
