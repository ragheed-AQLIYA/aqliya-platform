/**
 * POL-07: Approval Gate
 *
 * Certain actions require explicit approval from a second user with
 * the appropriate role before taking effect.
 *
 * The approval rules are defined in Chapter 10 (Approval Boundaries).
 * This policy triggers the REQUIRE_APPROVAL decision, which the engine
 * routes to the Approval Dispatcher.
 *
 * Stage: Workflow (Priority 1)
 * @see RB-02A v1.0 §8.3 — POL-07
 * @see RB-02A v1.0 Chapter 10 — Approval Boundaries
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

/** Actions that require approval per RB-02A Chapter 10 */
const APPROVAL_REQUIRED_ACTIONS: Record<string, { authority: string }> = {
  'project.delete': { authority: 'Dual ORG_ADMIN' },
  'workbook.export': { authority: 'Single BUSINESS_MANAGER' },
  'report.export': { authority: 'Single BUSINESS_MANAGER' },
  'evidence.delete': { authority: 'Single BUSINESS_MANAGER' },
  'review.override': { authority: 'Single ORG_ADMIN' },
  'classification-rule.delete': { authority: 'Single ORG_ADMIN' },
  'settings.update': { authority: 'Single ORG_ADMIN (second)' },
  'membership.assignRole': { authority: 'Single ORG_ADMIN (different)' },
  'import.create': { authority: 'Single BUSINESS_MANAGER' },
};

export const approvalGatePolicy: AuthorizationPolicy = {
  id: 'POL-07',
  name: 'Approval Gate',
  description: 'Certain sensitive actions require approval from a second authorized user',
  stage: PipelineStage.WORKFLOW_CONSTRAINTS,
  priority: 1,
  inputs: ['Actor.role', 'Action.name', 'Resource.type'],
  decisionType: 'REQUIRE_THEN_ALLOW',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    const approvalRule = APPROVAL_REQUIRED_ACTIONS[request.action];

    if (!approvalRule) {
      return {
        policyId: 'POL-07',
        decision: Decision.ALLOW,
        reason: `Action "${request.action}" does not require approval`,
        metadata: { requiresApproval: false },
      };
    }

    return {
      policyId: 'POL-07',
      decision: Decision.REQUIRE_APPROVAL,
      reason: `Action "${request.action}" requires approval from ${approvalRule.authority}`,
      metadata: {
        requiresApproval: true,
        approvalAuthority: approvalRule.authority,
        action: request.action,
      },
    };
  },
};
