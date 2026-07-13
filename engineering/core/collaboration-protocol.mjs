/**
 * AEOS Platform Core — Agent Collaboration Protocol
 *
 * Defines how agents communicate with each other.
 * This is NOT ad-hoc — every agent interaction follows this protocol:
 *
 *   Request → Context → Evidence → Recommendation → Decision → Approval → Execution → Verification
 *
 * This aligns with AQLIYA's core governance philosophy:
 *   AI assists (Recommendation). Humans decide (Decision). Evidence governs (Evidence).
 *
 * @module core/collaboration-protocol
 * @version 1.0.0
 */

import { emit } from "../kernel/event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// Request
// ═══════════════════════════════════════════════════════════

/** @type {Map<string, object>} */
const pendingRequests = new Map();

/** @type {Array<object>} */
const completedRequests = [];

/**
 * Send a collaboration request from one agent to another.
 *
 * @param {object} request
 * @param {string} request.fromAgent - AgentId of sender
 * @param {string} request.toAgent - AgentId of receiver
 * @param {"review"|"approve"|"inform"|"delegate"} request.type
 * @param {object} request.context - AgentContext
 * @param {unknown} request.payload
 * @param {string} [request.priority] - "critical"|"high"|"medium"|"low"
 * @param {string} [request.deadline] - ISO timestamp
 * @returns {{ requestId: string, status: "sent" }}
 */
export function request({ fromAgent, toAgent, type, context, payload, priority = "medium", deadline = null }) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const entry = {
    id: requestId,
    fromAgent,
    toAgent,
    type,
    context,
    payload,
    priority,
    deadline,
    status: "pending",
    sentAt: new Date().toISOString(),
    respondedAt: null,
  };

  pendingRequests.set(requestId, entry);

  emit("collaboration.requested", {
    requestId,
    fromAgent,
    toAgent,
    type,
    priority,
  }, { source: "collaboration-protocol" });

  return { requestId, status: "sent" };
}

// ═══════════════════════════════════════════════════════════
// Context → Evidence → Recommendation
// ═══════════════════════════════════════════════════════════

/**
 * Respond to a collaboration request.
 * The response MUST include evidence (governance evidence references).
 *
 * @param {object} response
 * @param {string} response.requestId
 * @param {string} response.fromAgent - AgentId of responder
 * @param {"approve"|"reject"|"request_changes"|"acknowledge"} response.decision
 * @param {Array<{ id: string, ruleId: string, finding: string }>} response.evidence
 * @param {string} response.recommendation
 * @param {string} response.rationale
 * @returns {{ success: boolean }}
 */
export function respond({ requestId, fromAgent, decision, evidence, recommendation, rationale }) {
  const req = pendingRequests.get(requestId);
  if (!req) throw new Error(`Collaboration request not found: ${requestId}`);
  if (req.toAgent !== fromAgent) throw new Error(`Agent "${fromAgent}" is not the recipient of request "${requestId}"`);

  req.status = decision;
  req.respondedAt = new Date().toISOString();

  const completedEntry = {
    ...req,
    decision,
    evidence,
    recommendation,
    rationale,
    respondedAt: new Date().toISOString(),
  };

  pendingRequests.delete(requestId);
  completedRequests.push(completedEntry);

  emit("collaboration.responded", {
    requestId,
    fromAgent,
    decision,
    evidenceCount: evidence.length,
  }, { source: "collaboration-protocol" });

  // If rejected or changes requested, notify governance
  if (decision === "reject" || decision === "request_changes") {
    emit("collaboration.blocked", {
      requestId,
      reason: rationale,
      fromAgent,
    }, { source: "collaboration-protocol" });
  }

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// Decision → Approval → Execution → Verification
// ═══════════════════════════════════════════════════════════

/**
 * Check if a collaboration response requires further approval.
 * If the decision was "approve" from a critical agent, execution can proceed.
 * If "request_changes", the sender must revise and re-request.
 *
 * @param {string} requestId
 * @returns {{ canExecute: boolean, requiresChanges: boolean, reason: string }}
 */
export function canExecute(requestId) {
  const completed = completedRequests.find((r) => r.id === requestId);
  if (!completed) {
    const pending = pendingRequests.get(requestId);
    if (pending) return { canExecute: false, requiresChanges: false, reason: "Request still pending" };
    return { canExecute: false, requiresChanges: false, reason: "Request not found" };
  }

  if (completed.decision === "approve") {
    return { canExecute: true, requiresChanges: false, reason: "Approved" };
  }

  if (completed.decision === "reject") {
    return { canExecute: false, requiresChanges: false, reason: "Rejected" };
  }

  if (completed.decision === "request_changes") {
    return { canExecute: false, requiresChanges: true, reason: "Changes requested" };
  }

  return { canExecute: true, requiresChanges: false, reason: "Acknowledged" };
}

// ═══════════════════════════════════════════════════════════
// Query
// ═══════════════════════════════════════════════════════════

/**
 * Get all pending requests for an agent.
 * @param {string} agentId
 * @returns {Array}
 */
export function getPendingFor(agentId) {
  return [...pendingRequests.values()].filter((r) => r.toAgent === agentId);
}

/**
 * Get all requests sent by an agent.
 * @param {string} agentId
 * @returns {Array}
 */
export function getSentBy(agentId) {
  return [...pendingRequests.values(), ...completedRequests].filter((r) => r.fromAgent === agentId);
}

/**
 * Get completed requests.
 * @param {{ fromAgent?: string, toAgent?: string, decision?: string }} [filter]
 * @returns {Array}
 */
export function getCompleted(filter = {}) {
  let results = [...completedRequests];
  if (filter.fromAgent) results = results.filter((r) => r.fromAgent === filter.fromAgent);
  if (filter.toAgent) results = results.filter((r) => r.toAgent === filter.toAgent);
  if (filter.decision) results = results.filter((r) => r.decision === filter.decision);
  return results;
}

// ═══════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════

export default {
  request,
  respond,
  canExecute,
  getPendingFor,
  getSentBy,
  getCompleted,
};
