/**
 * AEOS Platform Core — Evidence-Based Governance Engine
 *
 * Aligned with AQLIYA's core governance philosophy:
 *   "AI assists. Humans decide. Evidence governs."
 *
 * This engine does NOT just check rules. It builds an evidence chain:
 *   Policy → Rule → Validator → Evidence → Decision → Action
 *
 * Every governance decision must be supported by evidence.
 * Waivers and exceptions are tracked with expiration.
 *
 * @module core/governance-engine
 * @version 1.0.0
 */

import { emit } from "../../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Policy & Rule Store
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const policies = new Map();

/** @type {Map<string, object>} */
const rules = new Map();

/** @type {Array<object>} */
const evidenceLog = [];

/** @type {Array<object>} */
const decisions = [];

// ═══════════════════════════════════════════════════════════
// Policy → Rule
// ═══════════════════════════════════════════════════════════

/**
 * Register a governance policy.
 * @param {object} policy
 */
export function registerPolicy(policy) {
  policies.set(policy.id, policy);
  emit("governance.policy_registered", { policyId: policy.id }, { source: "governance-engine" });
}

/**
 * Register a governance rule under a policy.
 * @param {object} rule
 */
export function registerRule(rule) {
  if (!policies.has(rule.policyId)) {
    throw new Error(`Rule "${rule.id}" references unknown policy "${rule.policyId}"`);
  }
  rules.set(rule.id, rule);
  emit("governance.rule_registered", { ruleId: rule.id, policyId: rule.policyId }, { source: "governance-engine" });
}

// ═══════════════════════════════════════════════════════════
// Rule → Validator → Evidence
// ═══════════════════════════════════════════════════════════

/**
 * Validate a rule against current state, producing evidence.
 *
 * @param {string} ruleId
 * @param {{ currentScore: number, findings?: Array }} state
 * @returns {{ passed: boolean, evidence: object }}
 */
export function validate(ruleId, state) {
  const rule = rules.get(ruleId);
  if (!rule) throw new Error(`Rule not found: ${ruleId}`);

  const passed = state.currentScore >= 80; // Threshold: 80% = passing

  const evidence = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ruleId,
    cycleId: state.cycleId || "unknown",
    finding: passed ? "Rule passed" : `Rule below threshold: ${state.currentScore}%`,
    location: state.location || "global",
    severity: rule.severity,
    timestamp: new Date().toISOString(),
    resolved: passed,
    resolvedAt: passed ? new Date().toISOString() : null,
    metadata: { score: state.currentScore, findings: state.findings || [] },
  };

  evidenceLog.push(evidence);

  const event = passed ? "governance.passed" : "governance.violated";
  emit(event, { ruleId, score: state.currentScore, evidenceId: evidence.id }, { source: "governance-engine" });

  return { passed, evidence };
}

/**
 * Validate all rules in a policy.
 * @param {string} policyId
 * @param {object} state
 * @returns {{ policyScore: number, results: Array }}
 */
export function validatePolicy(policyId, state) {
  const policy = policies.get(policyId);
  if (!policy) throw new Error(`Policy not found: ${policyId}`);

  const results = policy.rules.map((ruleId) => validate(ruleId, state));

  const passed = results.filter((r) => r.passed).length;
  const policyScore = Math.round((passed / results.length) * 100);

  return { policyScore, results };
}

/**
 * Validate all registered rules.
 * @param {object} state
 * @returns {{ overallScore: number, byRule: Record<string, boolean> }}
 */
export function validateAll(state) {
  const byRule = {};
  let passed = 0;
  let total = 0;

  for (const [ruleId] of rules) {
    const result = validate(ruleId, state);
    byRule[ruleId] = result.passed;
    if (result.passed) passed++;
    total++;
  }

  return {
    overallScore: total > 0 ? Math.round((passed / total) * 100) : 100,
    byRule,
  };
}

// ═══════════════════════════════════════════════════════════
// Evidence → Decision → Action
// ═══════════════════════════════════════════════════════════

/**
 * Make a governance decision based on evidence.
 *
 * @param {object} decision
 * @param {string} decision.ruleId
 * @param {string[]} decision.evidenceIds
 * @param {"approve"|"reject"|"waive"|"defer"} decision.decision
 * @param {string} decision.rationale
 * @param {string} decision.decidedBy - AgentId
 * @param {string|null} decision.expiresAt - For temporary waivers
 * @returns {object}
 */
export function decide({ ruleId, evidenceIds, decision, rationale, decidedBy, expiresAt = null }) {
  const rule = rules.get(ruleId);
  if (!rule) throw new Error(`Rule not found: ${ruleId}`);

  // All evidence must exist
  for (const evId of evidenceIds) {
    if (!evidenceLog.find((e) => e.id === evId)) {
      throw new Error(`Evidence not found: ${evId}`);
    }
  }

  const decisionEntry = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ruleId,
    evidenceIds,
    decision,
    rationale,
    decidedBy,
    decidedAt: new Date().toISOString(),
    expiresAt,
    rule: rule.name,
    severity: rule.severity,
  };

  decisions.push(decisionEntry);

  emit("governance.decision_made", {
    ruleId,
    decision,
    decidedBy,
    evidenceCount: evidenceIds.length,
  }, { source: "governance-engine" });

  if (decision === "reject") {
    emit("governance.blocked", { ruleId, reason: rationale }, { source: "governance-engine" });
  }

  return decisionEntry;
}

/**
 * Check if a waiver is still valid.
 * @param {string} decisionId
 * @returns {boolean}
 */
export function isWaiverValid(decisionId) {
  const dec = decisions.find((d) => d.id === decisionId);
  if (!dec || dec.decision !== "waive") return false;
  if (!dec.expiresAt) return true;
  return new Date(dec.expiresAt) > new Date();
}

// ═══════════════════════════════════════════════════════════
// Query
// ═══════════════════════════════════════════════════════════

/**
 * Get all evidence for a rule.
 * @param {string} ruleId
 * @returns {Array}
 */
export function getEvidence(ruleId) {
  return evidenceLog.filter((e) => e.ruleId === ruleId);
}

/**
 * Get all decisions for a rule.
 * @param {string} ruleId
 * @returns {Array}
 */
export function getDecisions(ruleId) {
  return decisions.filter((d) => d.ruleId === ruleId);
}

/**
 * Get all unresolved evidence.
 * @returns {Array}
 */
export function getUnresolvedEvidence() {
  return evidenceLog.filter((e) => !e.resolved);
}

/**
 * Get all registered policies.
 * @returns {Array}
 */
export function listPolicies() {
  return [...policies.values()];
}

/**
 * Get all registered rules.
 * @returns {Array}
 */
export function listRules() {
  return [...rules.values()];
}

// ═══════════════════════════════════════════════════════════
// Register Standard Policies & Rules
// ═══════════════════════════════════════════════════════════

// Platform Security Policy
registerPolicy({
  id: "platform-security",
  name: "Platform Security Policy",
  description: "Ensures the AQLIYA platform maintains enterprise security standards.",
  version: "1.0",
  rules: ["GOV-01", "GOV-02", "GOV-03", "GOV-05", "GOV-06", "GOV-11"],
  scope: "global",
  enforcement: "pre-commit",
});

// Architecture Integrity Policy
registerPolicy({
  id: "architecture-integrity",
  name: "Architecture Integrity Policy",
  description: "Protects the AQLIYA platform architecture from drift and boundary violations.",
  version: "1.0",
  rules: ["GOV-04", "GOV-09"],
  scope: "global",
  enforcement: "pre-merge",
});

// Governance Compliance Policy
registerPolicy({
  id: "governance-compliance",
  name: "Governance Compliance Policy",
  description: "Ensures all changes are auditable, traceable, and governed.",
  version: "1.0",
  rules: ["GOV-07", "GOV-08", "GOV-10", "GOV-12"],
  scope: "global",
  enforcement: "pre-release",
});

// Register all 12 rules
const standardRules = [
  { id: "GOV-01", policyId: "platform-security",      name: "NO_PRISMA_IN_CLIENT",       severity: "BLOCK", currentScore: 99, trend: "stable" },
  { id: "GOV-02", policyId: "platform-security",      name: "ACTIONS_USE_ENFORCE",       severity: "BLOCK", currentScore: 52, trend: "declining" },
  { id: "GOV-03", policyId: "platform-security",      name: "NO_AUTH_BYPASS",            severity: "BLOCK", currentScore: 100, trend: "stable" },
  { id: "GOV-04", policyId: "architecture-integrity", name: "NO_CROSS_DOMAIN_IMPORTS",   severity: "BLOCK", currentScore: 100, trend: "stable" },
  { id: "GOV-05", policyId: "platform-security",      name: "DOWNLOAD_TENANT_SCOPED",    severity: "BLOCK", currentScore: 45, trend: "stable" },
  { id: "GOV-06", policyId: "platform-security",      name: "NO_AS_ANY",                 severity: "BLOCK", currentScore: 100, trend: "stable" },
  { id: "GOV-07", policyId: "governance-compliance",  name: "AUDIT_TRAIL_REQUIRED",     severity: "BLOCK", currentScore: 50, trend: "stable" },
  { id: "GOV-08", policyId: "governance-compliance",  name: "AI_HUMAN_REVIEW_GATE",     severity: "BLOCK", currentScore: 90, trend: "stable" },
  { id: "GOV-09", policyId: "architecture-integrity", name: "PRODUCT_BOUNDARY",          severity: "WARN",  currentScore: 95, trend: "stable" },
  { id: "GOV-10", policyId: "governance-compliance",  name: "DOCS_AUTHORITY",           severity: "WARN",  currentScore: 90, trend: "stable" },
  { id: "GOV-11", policyId: "platform-security",      name: "NO_ACTIONS_IMPORT_APP",    severity: "BLOCK", currentScore: 100, trend: "stable" },
  { id: "GOV-12", policyId: "governance-compliance",  name: "ROUTE_BOUNDARIES",         severity: "WARN",  currentScore: 55, trend: "improving" },
];

for (const rule of standardRules) {
  registerRule({
    ...rule,
    description: `Governance rule ${rule.id}: ${rule.name}`,
    check: `Automated check for ${rule.name}`,
    lastAudited: "2026-07-13",
  });
}

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  registerPolicy,
  registerRule,
  validate,
  validatePolicy,
  validateAll,
  decide,
  isWaiverValid,
  getEvidence,
  getDecisions,
  getUnresolvedEvidence,
  listPolicies,
  listRules,
};
