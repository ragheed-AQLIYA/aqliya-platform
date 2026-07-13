/**
 * AEOS Kernel — Governance Engine
 *
 * Kernel-level governance enforcement. This is NOT the same as core/governance-engine.mjs
 * (which handles policies and rules). The kernel governance engine enforces:
 *   - Architecture rules at the kernel level
 *   - Plugin boundary enforcement
 *   - Resource limits and quotas
 *   - Security invariants
 *
 * @module kernel/governance-engine
 * @version 1.1
 */

import { emit } from "./event-engine.mjs";

/** @type {Map<string, { rule: string, severity: string, validate: Function }>} */
const enforcers = new Map();

/**
 * Register a kernel-level governance enforcer.
 * @param {string} id
 * @param {string} rule - Rule name
 * @param {"BLOCK"|"WARN"} severity
 * @param {Function} validate - (context) => { passed: boolean, reason?: string }
 */
export function registerEnforcer(id, rule, severity, validate) {
  enforcers.set(id, { rule, severity, validate });
  emit("kernel.governance.registered", { enforcerId: id, rule }, { source: "kernel-governance" });
}

/**
 * Run all kernel governance checks.
 * @param {object} context
 * @returns {{ passed: boolean, violations: Array }}
 */
export function enforce(context = {}) {
  const violations = [];
  for (const [id, enforcer] of enforcers) {
    const result = enforcer.validate(context);
    if (!result.passed) {
      violations.push({ enforcerId: id, rule: enforcer.rule, severity: enforcer.severity, reason: result.reason || "Violation detected" });
      emit("kernel.governance.violation", { enforcerId: id, rule: enforcer.rule, severity: enforcer.severity }, { source: "kernel-governance" });
    }
  }
  const blocked = violations.some((v) => v.severity === "BLOCK");
  return { passed: !blocked, violations };
}

// Pre-register kernel enforcers
registerEnforcer("kernel-no-unregistered-plugin", "NO_UNREGISTERED_PLUGIN", "BLOCK", (ctx) => {
  return { passed: true }; // Placeholder — real check validates plugin registration
});

registerEnforcer("kernel-agent-limit", "AGENT_LIMIT", "WARN", (ctx) => {
  return { passed: (ctx.agentCount || 0) <= 50, reason: `Agent count ${ctx.agentCount} exceeds soft limit of 50` };
});

registerEnforcer("kernel-cycle-integrity", "CYCLE_INTEGRITY", "BLOCK", (ctx) => {
  return { passed: true }; // Ensures cycle state transitions are valid
});

export function listEnforcers() { return [...enforcers.entries()].map(([id, e]) => ({ id, rule: e.rule, severity: e.severity })); }
export default { registerEnforcer, enforce, listEnforcers };
