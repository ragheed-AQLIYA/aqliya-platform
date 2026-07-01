/**
 * RB-02B Authorization Engine — Core Types
 *
 * This file defines the stable interfaces for the AQLIYA Authorization Engine.
 * These types are the contract between the engine and all product guards.
 * They must not change without an RB-02A revision and ADR.
 *
 * @see RB-02A v1.0 §2.5 (Decision Model), §8.1 (Policy Pipeline)
 */

// ─── Decision Outcomes ────────────────────────────────────────────

/**
 * The four possible authorization outcomes.
 * Maps directly to RB-02A §2.5 Authorization Decision Model.
 */
export enum Decision {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  REQUIRE_APPROVAL = 'REQUIRE_APPROVAL',
  READ_ONLY = 'READ_ONLY',
}

/**
 * Decision Precedence rank — higher number = more restrictive = wins.
 * DENY (1) > REQUIRE_APPROVAL (2) > READ_ONLY (3) > ALLOW (4)
 *
 * @see RB-02A §2.5.4
 */
export const DECISION_PRECEDENCE: Record<Decision, number> = {
  [Decision.DENY]: 1,
  [Decision.REQUIRE_APPROVAL]: 2,
  [Decision.READ_ONLY]: 3,
  [Decision.ALLOW]: 4,
};

/**
 * The highest-precedence decision from a set of decisions.
 */
export function highestPrecedence(decisions: Decision[]): Decision {
  return decisions.reduce((a, b) =>
    DECISION_PRECEDENCE[a] < DECISION_PRECEDENCE[b] ? a : b,
  );
}

// ─── Pipeline Stages ──────────────────────────────────────────────

/**
 * The six stages of the Policy Evaluation Pipeline.
 * Maps directly to RB-02A §8.1.1.
 */
export enum PipelineStage {
  IDENTITY_RESOLUTION = 'IDENTITY_RESOLUTION',
  AUTHORIZATION_RESOLUTION = 'AUTHORIZATION_RESOLUTION',
  POLICY_EVALUATION = 'POLICY_EVALUATION',
  WORKFLOW_CONSTRAINTS = 'WORKFLOW_CONSTRAINTS',
  DECISION_COMPOSITION = 'DECISION_COMPOSITION',
  DECISION_TRACE = 'DECISION_TRACE',
}

// ─── Authorization Request ────────────────────────────────────────

/**
 * The complete context needed for an authorization decision.
 * Every field is required at minimum; products may extend via `context`.
 */
export interface AuthorizationRequest {
  /** The authenticated user's ID */
  userId: string;
  /** The organization the user belongs to */
  organizationId: string;
  /** The user's Platform Role (e.g., "ANALYST", "BUSINESS_MANAGER") */
  role: string;
  /** The type of resource being accessed (e.g., "project", "workbook") */
  resourceType: string;
  /** Optional specific resource instance ID */
  resourceId?: string;
  /** The action being performed (e.g., "project.create") */
  action: string;
  /** Product-specific context (workflow state, sensitive fields, etc.) */
  context?: Record<string, unknown>;
}

// ─── Policy Result ────────────────────────────────────────────────

/**
 * The outcome of evaluating a single policy against a request.
 */
export interface PolicyResult {
  /** The policy identifier (e.g., "POL-02") */
  policyId: string;
  /** The decision this policy produced */
  decision: Decision;
  /** Human-readable explanation */
  reason: string;
  /** Optional metadata about the evaluation */
  metadata?: Record<string, unknown>;
}

// ─── Decision Trace ───────────────────────────────────────────────

/**
 * Complete trace of how an authorization decision was reached.
 * Maps to RB-02A §2.5.6 and Chapter 11.
 */
export interface DecisionTrace {
  /** The stages that ran, in sequence */
  evaluationOrder: PipelineStage[];
  /** Results from each evaluated policy */
  policyResults: PolicyResult[];
  /** The final outcome after Decision Precedence */
  winningDecision: Decision;
  /** The policy/rule that produced the winning decision */
  winningPolicy?: string;
  /** Human-readable explanation of the decision */
  reason: string;
  /** Which layers contributed to the decision */
  executionPath: string[];
  /** Per-stage latency in milliseconds */
  stageLatencies: Record<string, number>;
  /** Reference IDs for associated audit events */
  auditEventIds: {
    authorizationEvaluated?: string;
    operationCompleted?: string;
    operationFailed?: string;
    approvalRequest?: string;
  };
}

// ─── Authorization Decision ───────────────────────────────────────

/**
 * The complete result of an authorization check.
 * Includes both the decision and the full trace.
 */
export interface AuthorizationDecision {
  /** The final decision outcome */
  decision: Decision;
  /** Full trace of how the decision was reached */
  trace: DecisionTrace;
  /** HTTP status code corresponding to the decision */
  httpStatus: number;
}

// ─── Pipeline Stage Handler ───────────────────────────────────────

/**
 * A single stage in the policy evaluation pipeline.
 * Each stage evaluates the request and returns a policy result.
 */
export interface StageHandler {
  /** Which pipeline stage this handler belongs to */
  stage: PipelineStage;
  /** Evaluate the request and produce a result */
  evaluate(request: AuthorizationRequest): Promise<PolicyResult>;
}

// ─── HTTP Status Mapping ──────────────────────────────────────────

/**
 * Maps each decision to its HTTP status code.
 * @see RB-02A §2.5.5 (Decision → Action Mapping)
 */
export function decisionToHttpStatus(decision: Decision): number {
  switch (decision) {
    case Decision.ALLOW:
      return 200;
    case Decision.DENY:
      return 403;
    case Decision.REQUIRE_APPROVAL:
      return 202;
    case Decision.READ_ONLY:
      return 200;
  }
}
