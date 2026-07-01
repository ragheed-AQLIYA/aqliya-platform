/**
 * POL-02: Creator Privilege
 *
 * A user who creates a resource has implicit update and delete permission
 * on that specific resource, regardless of role.
 *
 * Limitations:
 * - Does NOT grant approval permission (handled by SoD in Chapter 9)
 * - Does NOT override other restrictions (POL-04, POL-05 take precedence)
 *
 * Stage: Policy Evaluation (Priority 5)
 * @see RB-02A v1.0 §8.3 — POL-02
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const creatorPrivilegePolicy: AuthorizationPolicy = {
  id: 'POL-02',
  name: 'Creator Privilege',
  description: 'Resource creator has implicit update/delete on their own resources',
  stage: PipelineStage.POLICY_EVALUATION,
  priority: 5,
  inputs: ['Actor.userId', 'Resource.createdBy'],
  decisionType: 'ELEVATE',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    // Creator privilege only applies to specific resource types
    const applicableResources = [
      'workbook',
      'evidence',
      'finding',
      'supplier',
      'spend-record',
    ];

    if (!applicableResources.includes(request.resourceType)) {
      return {
        policyId: 'POL-02',
        decision: Decision.ALLOW,
        reason: `Resource type "${request.resourceType}" not in creator-privilege scope`,
        metadata: { applicableResources },
      };
    }

    // If no resourceId, we can't determine creator — pass through
    if (!request.resourceId) {
      return {
        policyId: 'POL-02',
        decision: Decision.ALLOW,
        reason: 'No resource ID — creator privilege not applicable',
        metadata: { resourceId: 'not provided' },
      };
    }

    // Creator privilege verification requires a context lookup
    // The actual check (did this user create this resource?) is handled
    // by the domain service that sets request.context.createdByUserId.
    // Here we confirm the policy is active and return contextual ALLOW.
    const createdBy = request.context?.createdByUserId as string | undefined;

    if (createdBy && createdBy === request.userId) {
      return {
        policyId: 'POL-02',
        decision: Decision.ALLOW,
        reason: `User ${request.userId} is the creator of ${request.resourceType} ${request.resourceId} — update/delete permitted`,
        metadata: { isCreator: true, resourceId: request.resourceId },
      };
    }

    // Not the creator — this policy does not apply, pass to next policy
    return {
      policyId: 'POL-02',
      decision: Decision.ALLOW,
      reason: 'User is not the resource creator or creator not specified — privilege not applicable',
      metadata: { isCreator: false },
    };
  },
};
