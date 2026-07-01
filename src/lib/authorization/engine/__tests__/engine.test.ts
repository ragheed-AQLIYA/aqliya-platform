/**
 * Tests for the RB-02B Authorization Engine
 *
 * Coverage targets (per RB-02A Gate G3):
 * - ALLOW path
 * - DENY path (short-circuit)
 * - REQUIRE_APPROVAL path
 * - READ_ONLY path
 * - Decision Precedence
 * - Fail-closed on error
 * - Pipeline stage execution order
 */

import { AuthorizationEngine } from '../engine';
import { Decision, PipelineStage } from '../types';
import type { AuthorizationRequest, StageHandler, PolicyResult } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────

const defaultRequest: AuthorizationRequest = {
  userId: 'usr_test',
  organizationId: 'org_test',
  role: 'ANALYST',
  resourceType: 'workbook',
  action: 'workbook.read',
};

function createHandler(
  stage: PipelineStage,
  decision: Decision,
  policyId = `${stage}_HANDLER`,
  reason?: string,
): StageHandler {
  return {
    stage,
    async evaluate(_req: AuthorizationRequest): Promise<PolicyResult> {
      return {
        policyId,
        decision,
        reason: reason ?? `${stage} returned ${decision}`,
      };
    },
  };
}

// ─── Tests ────────────────────────────────────────────────────────

describe('AuthorizationEngine', () => {
  // ─── Initialization ─────────────────────────────────────────

  describe('initialization', () => {
    it('throws if no handlers are registered', () => {
      const engine = new AuthorizationEngine();
      expect(() => engine.initialize()).toThrow(
        /no handler registered for required stage/,
      );
    });

    it('initializes successfully with all stages', () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      expect(() => engine.initialize()).not.toThrow();
    });
  });

  // ─── ALLOW Path ─────────────────────────────────────────────

  describe('ALLOW path', () => {
    it('returns ALLOW when all stages pass', async () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.ALLOW);
      expect(result.httpStatus).toBe(200);
      expect(result.trace.evaluationOrder).toHaveLength(6);
      expect(result.trace.winningDecision).toBe(Decision.ALLOW);
    });

    it('includes all 6 stages in evaluation order', async () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.trace.evaluationOrder).toEqual([
        PipelineStage.IDENTITY_RESOLUTION,
        PipelineStage.AUTHORIZATION_RESOLUTION,
        PipelineStage.POLICY_EVALUATION,
        PipelineStage.WORKFLOW_CONSTRAINTS,
        PipelineStage.DECISION_COMPOSITION,
        PipelineStage.DECISION_TRACE,
      ]);
    });
  });

  // ─── DENY Path (Short-Circuit) ──────────────────────────────

  describe('DENY short-circuit', () => {
    it('short-circuits on DENY from Identity Resolution', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.DENY, 'POL-01'),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.WORKFLOW_CONSTRAINTS, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.DENY);
      expect(result.httpStatus).toBe(403);
      // Should not have evaluated all stages — short-circuited
      expect(result.trace.winningPolicy).toBe('IDENTITY_RESOLUTION_COMPOSITE');
    });

    it('short-circuits on DENY from Policy Evaluation', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.DENY, 'POL-07'),
      );
      engine.registerStage(
        createHandler(PipelineStage.WORKFLOW_CONSTRAINTS, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.DENY);
      expect(result.trace.winningPolicy).toBe('POLICY_EVALUATION_COMPOSITE');
    });
  });

  // ─── REQUIRE_APPROVAL Path ──────────────────────────────────

  describe('REQUIRE_APPROVAL path', () => {
    it('returns REQUIRE_APPROVAL when workflow stage requires it', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.WORKFLOW_CONSTRAINTS,
          Decision.REQUIRE_APPROVAL,
          'A02',
        ),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.REQUIRE_APPROVAL);
      expect(result.httpStatus).toBe(202);
      expect(result.trace.winningPolicy).toBe('WORKFLOW_CONSTRAINTS_COMPOSITE');
    });
  });

  // ─── READ_ONLY Path ─────────────────────────────────────────

  describe('READ_ONLY path', () => {
    it('returns READ_ONLY when a policy restricts to read-only', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.POLICY_EVALUATION,
          Decision.READ_ONLY,
          'POL-05',
        ),
      );
      engine.registerStage(
        createHandler(PipelineStage.WORKFLOW_CONSTRAINTS, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.READ_ONLY);
      expect(result.httpStatus).toBe(200);
      expect(result.trace.winningPolicy).toBe('POLICY_EVALUATION_COMPOSITE');
    });
  });

  // ─── Decision Precedence ────────────────────────────────────

  describe('Decision Precedence', () => {
    it('DENY overrides REQUIRE_APPROVAL', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      // Policy says DENY, Workflow says REQUIRE_APPROVAL
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.DENY, 'POL-03'),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.WORKFLOW_CONSTRAINTS,
          Decision.REQUIRE_APPROVAL,
          'A03',
        ),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.DENY);
    });

    it('REQUIRE_APPROVAL overrides ALLOW', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.WORKFLOW_CONSTRAINTS,
          Decision.REQUIRE_APPROVAL,
          'A02',
        ),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.REQUIRE_APPROVAL);
    });

    it('READ_ONLY overrides ALLOW', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.IDENTITY_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.AUTHORIZATION_RESOLUTION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.POLICY_EVALUATION,
          Decision.READ_ONLY,
          'POL-05',
        ),
      );
      engine.registerStage(
        createHandler(PipelineStage.WORKFLOW_CONSTRAINTS, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_COMPOSITION, Decision.ALLOW),
      );
      engine.registerStage(
        createHandler(PipelineStage.DECISION_TRACE, Decision.ALLOW),
      );
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.READ_ONLY);
    });
  });

  // ─── Fail Closed ────────────────────────────────────────────

  describe('fail closed', () => {
    it('returns DENY if engine not initialized', async () => {
      const engine = new AuthorizationEngine();
      // Don't initialize
      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.DENY);
      expect(result.httpStatus).toBe(403);
    });

    it('returns DENY if a handler throws', async () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        if (stage === PipelineStage.IDENTITY_RESOLUTION) {
          engine.registerStage({
            stage,
            async evaluate() {
              throw new Error('Identity provider unavailable');
            },
          });
        } else {
          engine.registerStage(createHandler(stage, Decision.ALLOW));
        }
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.decision).toBe(Decision.DENY);
      expect(result.trace.policyResults[0].decision).toBe(Decision.DENY);
    });
  });

  // ─── Trace Completeness ─────────────────────────────────────

  describe('Decision Trace', () => {
    it('includes policy results for all evaluated stages', async () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.trace.policyResults.length).toBeGreaterThanOrEqual(4);
      expect(result.trace.winningDecision).toBeDefined();
      expect(result.trace.executionPath.length).toBeGreaterThan(0);
    });

    it('includes reason in decision', async () => {
      const engine = new AuthorizationEngine();
      const stages = Object.values(PipelineStage);
      for (const stage of stages) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      expect(result.trace.reason).toBeTruthy();
    });
  });

  // ─── Multiple Handlers per Stage ────────────────────────────

  describe('multiple handlers per stage', () => {
    it('composes multiple handlers within the same stage', async () => {
      const engine = new AuthorizationEngine();
      engine.registerStage(
        createHandler(PipelineStage.POLICY_EVALUATION, Decision.ALLOW, 'POL-01'),
      );
      engine.registerStage(
        createHandler(
          PipelineStage.POLICY_EVALUATION,
          Decision.READ_ONLY,
          'POL-05',
        ),
      );
      // Other stages
      for (const stage of [
        PipelineStage.IDENTITY_RESOLUTION,
        PipelineStage.AUTHORIZATION_RESOLUTION,
        PipelineStage.WORKFLOW_CONSTRAINTS,
        PipelineStage.DECISION_COMPOSITION,
        PipelineStage.DECISION_TRACE,
      ]) {
        engine.registerStage(createHandler(stage, Decision.ALLOW));
      }
      engine.initialize();

      const result = await engine.authorize(defaultRequest);
      // READ_ONLY (rank 3) > ALLOW (rank 4)
      expect(result.decision).toBe(Decision.READ_ONLY);
    });
  });
});
