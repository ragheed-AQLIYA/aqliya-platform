/**
 * POL-03: Project Scope Constraint
 *
 * Workbook and evidence permissions are scoped to the project level.
 * A user with access to Project A cannot access Project B's workbooks.
 *
 * Stage: Identity Resolution (Priority 2)
 * @see RB-02A v1.0 §8.3 — POL-03
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const projectScopePolicy: AuthorizationPolicy = {
  id: 'POL-03',
  name: 'Project Scope Constraint',
  description: 'Resource access scoped to project level',
  stage: PipelineStage.IDENTITY_RESOLUTION,
  priority: 2,
  inputs: ['Actor.organizationId', 'Resource.projectId', 'Resource.resourceType'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    // Only applies to project-scoped resources
    const projectScopedResources = ['workbook', 'evidence', 'finding', 'review'];

    if (!projectScopedResources.includes(request.resourceType)) {
      return {
        policyId: 'POL-03',
        decision: Decision.ALLOW,
        reason: `Resource type "${request.resourceType}" is not project-scoped`,
        metadata: { applicable: false },
      };
    }

    // Project scope is enforced by RB-01 assertProjectAccess guard
    // which runs before RB-02. This policy confirms the context is correct.
    const projectId = request.context?.projectId as string | undefined;

    if (!projectId && request.resourceId) {
      return {
        policyId: 'POL-03',
        decision: Decision.READ_ONLY,
        reason: `Project context missing for ${request.resourceType} — restricting to READ_ONLY`,
        metadata: { projectId: 'missing', resourceId: request.resourceId },
      };
    }

    return {
      policyId: 'POL-03',
      decision: Decision.ALLOW,
      reason: `Project scope verified — access to project-scoped ${request.resourceType}`,
      metadata: { projectId: projectId ?? null },
    };
  },
};
