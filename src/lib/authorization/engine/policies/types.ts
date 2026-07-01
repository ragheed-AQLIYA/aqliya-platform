/**
 * RB-02B Policy Framework — Core Interface
 *
 * Every authorization policy implements this interface.
 * Policies are PLUGINS — the engine orchestrates, policies decide.
 *
 * Key rules (ADR-RB02-017):
 * - Every policy has unified metadata
 * - Every policy declares its Inputs explicitly
 * - No policy references another policy (W3-G12)
 * - Every policy is independently testable (W3-G10)
 * - Every policy emits trace information (W3-G11)
 *
 * @see RB-02A v1.0 §8 — Authorization Policies
 */

import type { AuthorizationRequest, PolicyResult } from '../types';
import { PipelineStage } from '../types';
import type { Decision } from '../types';

/**
 * Evaluation metadata produced by each policy evaluation.
 */
export interface PolicyEvaluationMeta {
  /** How long the evaluation took (ms) */
  durationMs: number;
  /** What inputs were used */
  inputsUsed: string[];
  /** The raw decision before any composition */
  rawDecision: Decision;
}

/**
 * A single authorization policy plugin.
 * Each policy is isolated — it cannot call another policy.
 */
export interface AuthorizationPolicy {
  /** Unique policy identifier (e.g., "POL-01") */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this policy does */
  description: string;
  /** Which pipeline stage evaluates this policy */
  stage: PipelineStage;
  /** Evaluation order within stage (1 = first) */
  priority: number;
  /** What inputs this policy requires */
  inputs: string[];
  /** What kind of decision this policy produces */
  decisionType: 'ELEVATE' | 'RESTRICT' | 'REQUIRE_THEN_ALLOW';
  /** Owner team */
  owner: string;
  /** active / future / deprecated */
  status: 'active' | 'future' | 'deprecated';

  /**
   * Evaluate the policy against an authorization request.
   * Must be pure — no side effects, no calls to other policies.
   * Must produce a PolicyResult with decision, reason, and trace metadata.
   */
  evaluate(request: AuthorizationRequest): Promise<PolicyResult>;
}
