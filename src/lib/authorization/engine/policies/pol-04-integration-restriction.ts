/**
 * POL-04: Integration Account Restriction
 *
 * Integration accounts are limited to API access only:
 * - Cannot access UI
 * - Cannot create or modify memberships
 * - Cannot override decisions
 * - Cannot export data beyond configured scope
 *
 * Stage: Policy Evaluation (Priority 3 — evaluated early for restricted roles)
 * @see RB-02A v1.0 §8.3 — POL-04
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const integrationRestrictionPolicy: AuthorizationPolicy = {
  id: 'POL-04',
  name: 'Integration Account Restriction',
  description: 'Integration accounts have API-only restricted access',
  stage: PipelineStage.POLICY_EVALUATION,
  priority: 3,
  inputs: ['Actor.role', 'Action.name'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    if (request.role !== 'INTEGRATION_ACCOUNT') {
      return {
        policyId: 'POL-04',
        decision: Decision.ALLOW,
        reason: 'User is not an integration account — policy not applicable',
        metadata: { role: request.role },
      };
    }

    // Integration accounts cannot perform membership or override actions
    const restrictedActions = [
      'membership.invite',
      'membership.activate',
      'membership.deactivate',
      'membership.assignRole',
      'membership.revokeRole',
      'review.override',
      'settings.update',
    ];

    if (restrictedActions.includes(request.action)) {
      return {
        policyId: 'POL-04',
        decision: Decision.DENY,
        reason: `Integration accounts cannot perform "${request.action}"`,
        metadata: { restrictedAction: request.action },
      };
    }

    // Export actions require configured scope
    if (request.action === 'export.create' || request.action === 'workbook.export') {
      return {
        policyId: 'POL-04',
        decision: Decision.REQUIRE_APPROVAL,
        reason: 'Integration account export requires approval from BUSINESS_MANAGER',
        metadata: { requiresApproval: true },
      };
    }

    return {
      policyId: 'POL-04',
      decision: Decision.ALLOW,
      reason: `Integration account action "${request.action}" is permitted`,
      metadata: { action: request.action },
    };
  },
};
