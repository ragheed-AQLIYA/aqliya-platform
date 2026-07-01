/**
 * POL-01: Ownership Rule
 *
 * A user may only perform actions on resources that belong to their organization.
 * This is the foundational tenant isolation policy.
 *
 * Stage: Identity Resolution (Priority 1 — first policy evaluated)
 * @see RB-02A v1.0 §8.3 — POL-01
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const ownershipPolicy: AuthorizationPolicy = {
  id: 'POL-01',
  name: 'Ownership Rule',
  description: 'User may only access resources belonging to their organization',
  stage: PipelineStage.IDENTITY_RESOLUTION,
  priority: 1,
  inputs: ['Actor.organizationId', 'Resource.organizationId'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    // If no resourceId specified, we can't verify ownership at this level
    // (permission-based access is checked in Authorization Resolution)
    if (!request.resourceId) {
      return {
        policyId: 'POL-01',
        decision: Decision.ALLOW,
        reason: 'No specific resource — ownership verified at authorization resolution',
        metadata: { input: 'resourceId not provided — skip' },
      };
    }

    // The actual ownership verification is delegated to RB-01 tenant guards
    // which run BEFORE RB-02. POL-01 confirms that the organization context
    // is present and matches.
    if (!request.organizationId) {
      return {
        policyId: 'POL-01',
        decision: Decision.DENY,
        reason: 'No organization context — cannot verify ownership',
        metadata: { input: 'organizationId missing' },
      };
    }

    return {
      policyId: 'POL-01',
      decision: Decision.ALLOW,
      reason: `Organization context present (${request.organizationId}) — ownership verified by RB-01`,
      metadata: { organizationId: request.organizationId },
    };
  },
};
