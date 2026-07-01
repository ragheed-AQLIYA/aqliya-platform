/**
 * Policy Engine Adapter
 *
 * Bridges the PolicyRegistry with the AuthorizationEngine's StageHandler interface.
 * The engine orchestrates; policies decide. No policy knows another (W3-G12).
 *
 * Each pipeline stage gets its own handler that evaluates all policies
 * registered for that stage, in priority order.
 */

import type { StageHandler, PolicyResult, AuthorizationRequest } from '../types';
import { PipelineStage, Decision, DECISION_PRECEDENCE } from '../types';
import type { PolicyRegistry } from './registry';
import { PolicyRegistry as PolicyRegistryImpl } from './registry';
import { ownershipPolicy } from './pol-01-ownership';
import { creatorPrivilegePolicy } from './pol-02-creator-privilege';
import { projectScopePolicy } from './pol-03-project-scope';
import { integrationRestrictionPolicy } from './pol-04-integration-restriction';
import { externalAuditorRestrictionPolicy } from './pol-05-external-auditor-restriction';
import { timeBasedAccessPolicy } from './pol-06-time-based-access';
import { approvalGatePolicy } from './pol-07-approval-gate';
import { resourceSensitivityPolicy } from './pol-08-resource-sensitivity';
import { bulkOperationLimitPolicy } from './pol-09-bulk-operation-limit';

/**
 * Create stage handlers for all pipeline stages from a PolicyRegistry.
 * Each stage evaluates its registered policies and returns a composite result.
 *
 * The composite result uses Decision Precedence:
 * DENY > REQUIRE_APPROVAL > READ_ONLY > ALLOW
 */
export function createHandlersFromRegistry(
  registry: PolicyRegistry,
): StageHandler[] {
  const stages = [
    PipelineStage.IDENTITY_RESOLUTION,
    PipelineStage.AUTHORIZATION_RESOLUTION,
    PipelineStage.POLICY_EVALUATION,
    PipelineStage.WORKFLOW_CONSTRAINTS,
    PipelineStage.DECISION_COMPOSITION,
    PipelineStage.DECISION_TRACE,
  ];

  return stages.map((stage) => createStageHandler(stage, registry));
}

/**
 * Create a single stage handler that evaluates all policies for that stage.
 */
function createStageHandler(
  stage: PipelineStage,
  registry: PolicyRegistry,
): StageHandler {
  return {
    stage,
    async evaluate(request: AuthorizationRequest): Promise<PolicyResult> {
      const policies = registry.forStage(stage);

      if (policies.length === 0) {
        return {
          policyId: `${stage}_NO_POLICIES`,
          decision: Decision.ALLOW,
          reason: `No policies registered for stage ${stage}`,
          metadata: { stage, policyCount: 0 },
        };
      }

      // Evaluate all policies in priority order
      const results: PolicyResult[] = [];
      for (const policy of policies) {
        const start = Date.now();
        const result = await policy.evaluate(request);
        const duration = Date.now() - start;

        result.metadata = {
          ...result.metadata,
          policyId: policy.id,
          policyName: policy.name,
          evaluationDurationMs: duration,
          stage: policy.stage,
          priority: policy.priority,
        };

        results.push(result);

        // Short-circuit on DENY (highest precedence)
        if (result.decision === Decision.DENY) {
          break;
        }
      }

      // Compose: highest precedence wins
      const decisions = results.map((r) => r.decision);
      const winningDecision = decisions.reduce((a, b) =>
        DECISION_PRECEDENCE[a] < DECISION_PRECEDENCE[b] ? a : b,
      );
      const winningResult = results.find((r) => r.decision === winningDecision)!;

      return {
        policyId: `${stage}_COMPOSITE`,
        decision: winningDecision,
        reason: `Stage ${stage}: ${winningResult.reason}`,
        metadata: {
          stage,
          policyCount: policies.length,
          evaluatedPolicies: results.map((r) => r.metadata?.policyId),
          individualDecisions: decisions,
          winningPolicy: winningResult.metadata?.policyId,
        },
      };
    },
  };
}

/**
 * Create a PolicyRegistry pre-loaded with all default policies.
 */
export function createDefaultRegistry(): PolicyRegistry {
  const registry = new PolicyRegistryImpl();
  registry.registerAll([
    ownershipPolicy,
    creatorPrivilegePolicy,
    projectScopePolicy,
    integrationRestrictionPolicy,
    externalAuditorRestrictionPolicy,
    timeBasedAccessPolicy,
    approvalGatePolicy,
    resourceSensitivityPolicy,
    bulkOperationLimitPolicy,
  ]);
  return registry;
}

/**
 * Create a fully initialized AuthorizationEngine with all default policies.
 * Convenience function for standard setup.
 */
export async function createStandardEngine(): Promise<{
  engine: import('../engine').AuthorizationEngine;
  registry: PolicyRegistry;
}> {
  const registry = createDefaultRegistry();
  const handlers = createHandlersFromRegistry(registry);

  // Dynamic import to avoid circular dependency
  const { AuthorizationEngine } = await import('../engine');
  const engine = new AuthorizationEngine();
  engine.registerStages(handlers);
  engine.initialize();

  return { engine, registry };
}
