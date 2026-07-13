/**
 * AEOS Platform Core — Policy Engine
 *
 * Enterprise governance model:
 *   Policy → Control → Rule → Evidence → Decision
 *
 * This is NOT just rule checking. It's a hierarchical governance framework
 * aligned with institutional governance standards.
 *
 * Example:
 *   Security Policy
 *     ↓
 *   Tenant Isolation Control
 *     ↓
 *   Rule: Download routes must be tenant-scoped (GOV-05)
 *     ↓
 *   Evidence: 6 routes missing tenant check
 *     ↓
 *   Decision: BLOCK release until fixed
 *
 * @module core/policy-engine
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Stores
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const policies = new Map();

/** @type {Map<string, object>} */
const controls = new Map();

/** @type {Map<string, object>} */
const rules = new Map();

/** @type {Array<object>} */
const evidenceLog = [];

/** @type {Array<object>} */
const decisions = [];

// ═══════════════════════════════════════════════════════════
// Policy
// ═══════════════════════════════════════════════════════════

/**
 * Define a governance policy.
 * A policy is a high-level governance objective.
 *
 * @param {object} policy
 * @param {string} policy.id
 * @param {string} policy.name
 * @param {string} policy.description
 * @param {string} policy.owner - Division responsible
 * @param {"global"|"product"|"module"} policy.scope
 * @param {string[]} policy.controlIds - Controls under this policy
 */
export function definePolicy({ id, name, description, owner, scope = "global", controlIds = [] }) {
  const policy = { id, name, description, owner, scope, controlIds, version: "1.0", definedAt: new Date().toISOString(), status: "active" };
  policies.set(id, policy);
  emit("policy_engine.policy_defined", { policyId: id, name }, { source: "policy-engine" });
  return policy;
}

export function getPolicy(id) { return policies.get(id) || null; }
export function listPolicies() { return [...policies.values()]; }

// ═══════════════════════════════════════════════════════════
// Control
// ═══════════════════════════════════════════════════════════

/**
 * Define a control under a policy.
 * A control is a specific governance mechanism.
 *
 * @param {object} control
 * @param {string} control.id
 * @param {string} control.policyId
 * @param {string} control.name
 * @param {string} control.description
 * @param {string} control.type - "preventative" | "detective" | "corrective"
 * @param {string[]} control.ruleIds
 */
export function defineControl({ id, policyId, name, description, type = "detective", ruleIds = [] }) {
  if (!policies.has(policyId)) throw new Error(`Policy not found: ${policyId}`);
  const control = { id, policyId, name, description, type, ruleIds, version: "1.0", definedAt: new Date().toISOString(), status: "active" };
  controls.set(id, control);
  policies.get(policyId).controlIds.push(id);
  emit("policy_engine.control_defined", { controlId: id, policyId, name }, { source: "policy-engine" });
  return control;
}

export function getControl(id) { return controls.get(id) || null; }

// ═══════════════════════════════════════════════════════════
// Rule (under a Control)
// ═══════════════════════════════════════════════════════════

/**
 * Define a rule under a control.
 * A rule is a specific, measurable check.
 *
 * @param {object} rule
 * @param {string} rule.id
 * @param {string} rule.controlId
 * @param {string} rule.name
 * @param {"BLOCK"|"WARN"} rule.severity
 * @param {string} rule.check - Human-readable check description
 * @param {number} rule.currentScore - 0-100
 */
export function defineRule({ id, controlId, name, severity = "WARN", check = "", currentScore = 100 }) {
  if (!controls.has(controlId)) throw new Error(`Control not found: ${controlId}`);
  const rule = { id, controlId, name, severity, check, currentScore, trend: "stable", lastAudited: new Date().toISOString() };
  rules.set(id, rule);
  controls.get(controlId).ruleIds.push(id);
  emit("policy_engine.rule_defined", { ruleId: id, controlId, name }, { source: "policy-engine" });
  return rule;
}

export function getRule(id) { return rules.get(id) || null; }
export function listRules() { return [...rules.values()]; }

// ═══════════════════════════════════════════════════════════
// Evidence
// ═══════════════════════════════════════════════════════════

/**
 * Record evidence for a rule.
 * Evidence is the factual basis for governance decisions.
 *
 * @param {string} ruleId
 * @param {string} finding
 * @param {string} location - File, module, or route
 * @param {object} [metadata]
 * @returns {object}
 */
export function recordEvidence(ruleId, finding, location, metadata = {}) {
  if (!rules.has(ruleId)) throw new Error(`Rule not found: ${ruleId}`);
  const rule = rules.get(ruleId);

  const evidence = {
    id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ruleId,
    controlId: rule.controlId,
    policyId: controls.get(rule.controlId)?.policyId,
    finding,
    location,
    severity: rule.severity,
    timestamp: new Date().toISOString(),
    resolved: false,
    resolvedAt: null,
    metadata,
  };

  evidenceLog.push(evidence);
  emit("policy_engine.evidence_recorded", { evidenceId: evidence.id, ruleId, finding }, { source: "policy-engine" });
  return evidence;
}

export function getEvidence(ruleId) { return evidenceLog.filter((e) => e.ruleId === ruleId); }
export function getUnresolved() { return evidenceLog.filter((e) => !e.resolved); }

// ═══════════════════════════════════════════════════════════
// Decision
// ═══════════════════════════════════════════════════════════

/**
 * Make a governance decision based on evidence.
 *
 * @param {object} decision
 * @param {string} decision.ruleId
 * @param {string[]} decision.evidenceIds
 * @param {"approve"|"reject"|"waive"|"defer"} decision.decision
 * @param {string} decision.rationale
 * @param {string} decision.decidedBy
 * @param {string} [decision.expiresAt]
 */
export function makeDecision({ ruleId, evidenceIds, decision: dec, rationale, decidedBy, expiresAt = null }) {
  if (!rules.has(ruleId)) throw new Error(`Rule not found: ${ruleId}`);

  for (const evId of evidenceIds) {
    if (!evidenceLog.find((e) => e.id === evId)) throw new Error(`Evidence not found: ${evId}`);
  }

  const decisionEntry = {
    id: `dec-${Date.now()}`,
    ruleId,
    evidenceIds,
    decision: dec,
    rationale,
    decidedBy,
    decidedAt: new Date().toISOString(),
    expiresAt,
  };

  decisions.push(decisionEntry);

  if (dec === "approve") {
    // Mark evidence as resolved
    for (const evId of evidenceIds) {
      const ev = evidenceLog.find((e) => e.id === evId);
      if (ev) { ev.resolved = true; ev.resolvedAt = new Date().toISOString(); }
    }
  }

  const event = dec === "reject" ? "policy_engine.blocked" : "policy_engine.decision_made";
  emit(event, { ruleId, decision: dec }, { source: "policy-engine" });

  return decisionEntry;
}

export function getDecisions(ruleId) { return decisions.filter((d) => d.ruleId === ruleId); }

// ═══════════════════════════════════════════════════════════
// Audit: Check all rules under a policy
// ═══════════════════════════════════════════════════════════

/**
 * Audit a policy — check all controls and rules.
 * @param {string} policyId
 * @returns {{ policyName: string, controls: Array, passRate: number }}
 */
export function auditPolicy(policyId) {
  const policy = policies.get(policyId);
  if (!policy) throw new Error(`Policy not found: ${policyId}`);

  const results = [];
  let totalRules = 0;
  let passedRules = 0;

  for (const controlId of policy.controlIds) {
    const control = controls.get(controlId);
    const controlResults = [];

    for (const ruleId of control.ruleIds) {
      const rule = rules.get(ruleId);
      totalRules++;
      if (rule.currentScore >= 80) passedRules++;

      controlResults.push({
        ruleId: rule.id,
        ruleName: rule.name,
        score: rule.currentScore,
        severity: rule.severity,
        passed: rule.currentScore >= 80,
        evidence: evidenceLog.filter((e) => e.ruleId === rule.id).length,
        decisions: decisions.filter((d) => d.ruleId === rule.id).length,
      });
    }

    results.push({
      controlId: control.id,
      controlName: control.name,
      type: control.type,
      rules: controlResults,
    });
  }

  return {
    policyName: policy.name,
    controls: results,
    passRate: totalRules > 0 ? Math.round((passedRules / totalRules) * 100) : 100,
  };
}

// ═══════════════════════════════════════════════════════════
// Pre-register Enterprise Policies
// ═══════════════════════════════════════════════════════════

// Security Policy
definePolicy({ id: "enterprise-security", name: "Enterprise Security Policy", description: "Platform-wide security governance.", owner: "Security Division", scope: "global" });

defineControl({ id: "access-control", policyId: "enterprise-security", name: "Access Control", description: "Authentication and authorization governance.", type: "preventative" });
defineControl({ id: "tenant-isolation", policyId: "enterprise-security", name: "Tenant Isolation", description: "Data boundary enforcement.", type: "preventative" });
defineControl({ id: "dependency-security", policyId: "enterprise-security", name: "Dependency Security", description: "Supply chain and dependency governance.", type: "detective" });

defineRule({ id: "GOV-01", controlId: "access-control", name: "NO_PRISMA_IN_CLIENT", severity: "BLOCK", check: "Prisma must not be imported in Client Components.", currentScore: 99 });
defineRule({ id: "GOV-02", controlId: "access-control", name: "ACTIONS_USE_ENFORCE", severity: "BLOCK", check: "Mutating actions must call enforce().", currentScore: 52 });
defineRule({ id: "GOV-03", controlId: "access-control", name: "NO_AUTH_BYPASS", severity: "BLOCK", check: "No authorization bypass patterns.", currentScore: 100 });
defineRule({ id: "GOV-05", controlId: "tenant-isolation", name: "DOWNLOAD_TENANT_SCOPED", severity: "BLOCK", check: "Download routes must validate organizationId.", currentScore: 45 });
defineRule({ id: "GOV-06", controlId: "access-control", name: "NO_AS_ANY", severity: "BLOCK", check: "No as any type casts.", currentScore: 100 });

// Architecture Integrity Policy
definePolicy({ id: "architecture-integrity", name: "Architecture Integrity Policy", description: "Platform architecture governance.", owner: "Architecture Division", scope: "global" });

defineControl({ id: "layer-discipline", policyId: "architecture-integrity", name: "Layer Discipline", description: "Clean architecture layer enforcement.", type: "preventative" });
defineControl({ id: "product-boundaries", policyId: "architecture-integrity", name: "Product Boundaries", description: "Cross-product coupling prevention.", type: "preventative" });

defineRule({ id: "GOV-04", controlId: "product-boundaries", name: "NO_CROSS_DOMAIN_IMPORTS", severity: "BLOCK", check: "No deep imports across product domains.", currentScore: 100 });
defineRule({ id: "GOV-09", controlId: "product-boundaries", name: "PRODUCT_BOUNDARY", severity: "WARN", check: "Code must align with product taxonomy.", currentScore: 95 });

// Governance Compliance Policy
definePolicy({ id: "governance-compliance", name: "Governance Compliance Policy", description: "Audit and governance standards.", owner: "Governance Division", scope: "global" });

defineControl({ id: "audit-trail", policyId: "governance-compliance", name: "Audit Trail", description: "All mutations must be auditable.", type: "detective" });
defineControl({ id: "ai-governance", policyId: "governance-compliance", name: "AI Governance", description: "AI must not make autonomous decisions.", type: "preventative" });

defineRule({ id: "GOV-07", controlId: "audit-trail", name: "AUDIT_TRAIL_REQUIRED", severity: "BLOCK", check: "Mutations must log audit events.", currentScore: 50 });
defineRule({ id: "GOV-08", controlId: "ai-governance", name: "AI_HUMAN_REVIEW_GATE", severity: "BLOCK", check: "AI output must pass human review.", currentScore: 90 });
defineRule({ id: "GOV-10", controlId: "audit-trail", name: "DOCS_AUTHORITY", severity: "WARN", check: "Documentation must respect authority hierarchy.", currentScore: 90 });
defineRule({ id: "GOV-11", controlId: "access-control", name: "NO_ACTIONS_IMPORT_APP", severity: "BLOCK", check: "Actions must not import from app/.", currentScore: 100 });
defineRule({ id: "GOV-12", controlId: "layer-discipline", name: "ROUTE_BOUNDARIES", severity: "WARN", check: "Workspace routes need error/loading/not-found.", currentScore: 55 });

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  definePolicy, getPolicy, listPolicies,
  defineControl, getControl,
  defineRule, getRule, listRules,
  recordEvidence, getEvidence, getUnresolved,
  makeDecision, getDecisions,
  auditPolicy,
};
