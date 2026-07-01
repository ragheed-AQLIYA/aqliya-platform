/**
 * RB-02B Authorization Engine
 *
 * The central authorization engine implementing the 6-stage Policy Evaluation
 * Pipeline as defined in RB-02A v1.0 §8.1.1.
 *
 * Design principles:
 * - Fail closed: any error returns DENY
 * - Short-circuit: DENY stops pipeline immediately
 * - Decision Precedence: highest rank wins
 * - Every decision produces a trace
 *
 * @see RB-02A v1.0 §8.1 (Policy Engine Architecture)
 * @see RB-02A v1.0 §2.5 (Decision Model)
 */

import type {
  AuthorizationRequest,
  AuthorizationDecision,
  PolicyResult,
  StageHandler,
} from './types';
import {
  Decision,
  DECISION_PRECEDENCE,
  PipelineStage,
  decisionToHttpStatus,
} from './types';

export class AuthorizationEngine {
  private readonly stages: Map<PipelineStage, StageHandler[]> = new Map();
  private initialized = false;

  // ─── Registration ───────────────────────────────────────────────

  /**
   * Register a stage handler for a specific pipeline stage.
   * Multiple handlers can be registered per stage (they are evaluated in order).
   */
  registerStage(handler: StageHandler): void {
    const existing = this.stages.get(handler.stage) ?? [];
    existing.push(handler);
    this.stages.set(handler.stage, existing);
    this.initialized = false;
  }

  /**
   * Register multiple stage handlers at once.
   */
  registerStages(handlers: StageHandler[]): void {
    for (const handler of handlers) {
      this.registerStage(handler);
    }
  }

  /**
   * Initialize the engine after all stages are registered.
   * Validates that at least one handler exists for each required stage.
   */
  initialize(): void {
    const requiredStages = [
      PipelineStage.IDENTITY_RESOLUTION,
      PipelineStage.AUTHORIZATION_RESOLUTION,
      PipelineStage.POLICY_EVALUATION,
      PipelineStage.WORKFLOW_CONSTRAINTS,
      PipelineStage.DECISION_COMPOSITION,
      PipelineStage.DECISION_TRACE,
    ];

    for (const stage of requiredStages) {
      if (!this.stages.has(stage) || (this.stages.get(stage)?.length ?? 0) === 0) {
        throw new Error(
          `AuthorizationEngine: no handler registered for required stage ${stage}`,
        );
      }
    }

    this.initialized = true;
  }

  // ─── Authorization ──────────────────────────────────────────────

  /**
   * Authorize a request through the full pipeline.
   * Returns a decision with full trace.
   *
   * Fail-closed: any error during evaluation returns DENY.
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    if (!this.initialized) {
      return this.denyResult(request, 'Engine not initialized');
    }

    try {
      return await this.executePipeline(request);
    } catch (error) {
      return this.denyResult(
        request,
        `Engine error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // ─── Pipeline Execution ─────────────────────────────────────────

  private async executePipeline(
    request: AuthorizationRequest,
  ): Promise<AuthorizationDecision> {
    const evaluationOrder: PipelineStage[] = [];
    const policyResults: PolicyResult[] = [];
    const stageLatencies: Record<string, number> = {};

    // Stage 1: Identity Resolution
    const t1 = Date.now();
    const identityResult = await this.evaluateStage(
      PipelineStage.IDENTITY_RESOLUTION,
      request,
    );
    stageLatencies[PipelineStage.IDENTITY_RESOLUTION] = Date.now() - t1;
    evaluationOrder.push(PipelineStage.IDENTITY_RESOLUTION);
    policyResults.push(identityResult);
    if (this.isTerminal(identityResult.decision)) {
      return this.composeDecision(request, evaluationOrder, policyResults, stageLatencies);
    }

    // Stage 2: Authorization Resolution
    const t2 = Date.now();
    const authzResult = await this.evaluateStage(
      PipelineStage.AUTHORIZATION_RESOLUTION,
      request,
    );
    stageLatencies[PipelineStage.AUTHORIZATION_RESOLUTION] = Date.now() - t2;
    evaluationOrder.push(PipelineStage.AUTHORIZATION_RESOLUTION);
    policyResults.push(authzResult);
    if (this.isTerminal(authzResult.decision)) {
      return this.composeDecision(request, evaluationOrder, policyResults, stageLatencies);
    }

    // Stage 3: Policy Evaluation
    const t3 = Date.now();
    const policyResult = await this.evaluateStage(
      PipelineStage.POLICY_EVALUATION,
      request,
    );
    stageLatencies[PipelineStage.POLICY_EVALUATION] = Date.now() - t3;
    evaluationOrder.push(PipelineStage.POLICY_EVALUATION);
    policyResults.push(policyResult);
    if (this.isTerminal(policyResult.decision)) {
      return this.composeDecision(request, evaluationOrder, policyResults, stageLatencies);
    }

    // Stage 4: Workflow Constraints
    const t4 = Date.now();
    const workflowResult = await this.evaluateStage(
      PipelineStage.WORKFLOW_CONSTRAINTS,
      request,
    );
    stageLatencies[PipelineStage.WORKFLOW_CONSTRAINTS] = Date.now() - t4;
    evaluationOrder.push(PipelineStage.WORKFLOW_CONSTRAINTS);
    policyResults.push(workflowResult);
    if (this.isTerminal(workflowResult.decision)) {
      return this.composeDecision(request, evaluationOrder, policyResults, stageLatencies);
    }

    // Stage 5: Decision Composition
    const t5 = Date.now();
    const allDecisions = policyResults.map((r) => r.decision);
    const finalDecision = this.composeDecisions(allDecisions);
    const winningPolicy =
      policyResults.find((r) => r.decision === finalDecision)?.policyId;
    evaluationOrder.push(PipelineStage.DECISION_COMPOSITION);
    stageLatencies[PipelineStage.DECISION_COMPOSITION] = Date.now() - t5;

    // Stage 6: Decision Trace
    const t6 = Date.now();
    evaluationOrder.push(PipelineStage.DECISION_TRACE);
    stageLatencies[PipelineStage.DECISION_TRACE] = Date.now() - t6;

    return {
      decision: finalDecision,
      httpStatus: decisionToHttpStatus(finalDecision),
      trace: {
        evaluationOrder,
        policyResults,
        winningDecision: finalDecision,
        winningPolicy,
        reason: this.buildReason(finalDecision, winningPolicy, policyResults),
        executionPath: evaluationOrder.map((s) => `${s}: ${this.stageOutcome(s, policyResults)}`),
        stageLatencies,
        auditEventIds: {},
      },
    };
  }

  // ─── Stage Helpers ──────────────────────────────────────────────

  private async evaluateStage(
    stage: PipelineStage,
    request: AuthorizationRequest,
  ): Promise<PolicyResult> {
    const handlers = this.stages.get(stage) ?? [];

    // If no handlers registered, default to ALLOW (passthrough)
    if (handlers.length === 0) {
      return {
        policyId: `${stage}_DEFAULT`,
        decision: Decision.ALLOW,
        reason: `No handlers registered for stage ${stage}`,
      };
    }

    // Evaluate all handlers and compose their results
    const results = await Promise.all(
      handlers.map((h) =>
        h.evaluate(request).catch(
          (): PolicyResult => ({
            policyId: `${stage}_ERROR`,
            decision: Decision.DENY,
            reason: `Handler error in stage ${stage}`,
          }),
        ),
      ),
    );

    // Compose: highest precedence wins within the stage
    const decisions = results.map((r) => r.decision);
    const winningDecision = decisions.reduce((a, b) =>
      DECISION_PRECEDENCE[a] < DECISION_PRECEDENCE[b] ? a : b,
    );
    const winningResult = results.find((r) => r.decision === winningDecision);

    return {
      policyId: `${stage}_COMPOSITE`,
      decision: winningDecision,
      reason: winningResult?.reason ?? `Composite result for stage ${stage}`,
      metadata: { handlerCount: handlers.length, individualResults: decisions },
    };
  }

  private isTerminal(decision: Decision): boolean {
    // Only DENY short-circuits the pipeline
    return decision === Decision.DENY;
  }

  private composeDecisions(decisions: Decision[]): Decision {
    if (decisions.length === 0) return Decision.ALLOW;
    return decisions.reduce((a, b) =>
      DECISION_PRECEDENCE[a] < DECISION_PRECEDENCE[b] ? a : b,
    );
  }

  private composeDecision(
    request: AuthorizationRequest,
    evaluationOrder: PipelineStage[],
    policyResults: PolicyResult[],
    stageLatencies: Record<string, number> = {},
  ): AuthorizationDecision {
    const finalDecision = this.composeDecisions(policyResults.map((r) => r.decision));
    const winningPolicy = policyResults.find((r) => r.decision === finalDecision)?.policyId;

    return {
      decision: finalDecision,
      httpStatus: decisionToHttpStatus(finalDecision),
      trace: {
        evaluationOrder,
        policyResults,
        winningDecision: finalDecision,
        winningPolicy,
        reason: this.buildReason(finalDecision, winningPolicy, policyResults),
        executionPath: evaluationOrder.map(
          (s) => `${s}: ${this.stageOutcome(s, policyResults)}`,
        ),
        stageLatencies,
        auditEventIds: {},
      },
    };
  }

  private buildReason(
    decision: Decision,
    winningPolicy: string | undefined,
    results: PolicyResult[],
  ): string {
    const resultLines = results
      .filter((r) => r.decision !== Decision.ALLOW)
      .map((r) => `${r.policyId}: ${r.decision} — ${r.reason}`);

    if (resultLines.length === 0) {
      return `${decision}: No restrictions applied. All stages passed.`;
    }

    return [
      `${decision} (winning: ${winningPolicy ?? 'N/A'})`,
      ...resultLines,
    ].join('\n');
  }

  private stageOutcome(
    stage: PipelineStage,
    results: PolicyResult[],
  ): string {
    const stageResults = results.filter((r) =>
      r.policyId.startsWith(stage),
    );
    if (stageResults.length === 0) return 'NOT_EVALUATED';
    const decisions = stageResults.map((r) => r.decision);
    const winning = this.composeDecisions(decisions);
    return winning;
  }

  private denyResult(request: AuthorizationRequest, reason: string): AuthorizationDecision {
    return {
      decision: Decision.DENY,
      httpStatus: 403,
      trace: {
        evaluationOrder: [],
        policyResults: [
          {
            policyId: 'ENGINE_ERROR',
            decision: Decision.DENY,
            reason,
          },
        ],
        winningDecision: Decision.DENY,
        winningPolicy: 'ENGINE_ERROR',
        reason,
        executionPath: ['ENGINE: FAIL_CLOSED'],
        stageLatencies: {},
        auditEventIds: {},
      },
    };
  }
}
