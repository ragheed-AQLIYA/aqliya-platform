/**
 * POL-05: External Auditor Restriction
 *
 * External auditors have READ_ONLY access with enhanced audit logging:
 * - Cannot create, update, or delete any resource
 * - Cannot export data from the platform
 * - Cannot view other users' roles or permissions
 * - Cannot access settings
 *
 * Stage: Policy Evaluation (Priority 4)
 * @see RB-02A v1.0 §8.3 — POL-05
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const externalAuditorRestrictionPolicy: AuthorizationPolicy = {
  id: 'POL-05',
  name: 'External Auditor Restriction',
  description: 'External auditors have READ_ONLY access with enhanced audit logging',
  stage: PipelineStage.POLICY_EVALUATION,
  priority: 4,
  inputs: ['Actor.role', 'Action.name'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    if (request.role !== 'EXTERNAL_AUDITOR') {
      return {
        policyId: 'POL-05',
        decision: Decision.ALLOW,
        reason: 'User is not an external auditor — policy not applicable',
        metadata: { role: request.role },
      };
    }

    // Mutations are denied
    const mutationActions = [
      'create',
      'update',
      'delete',
      'archive',
      'upload',
      'calibrate',
      'override',
      'invite',
      'activate',
      'deactivate',
      'assignRole',
      'revokeRole',
      'editContent',
      'editStructure',
      'approve',
    ];

    const actionVerb = request.action.split('.')[1];
    if (mutationActions.includes(actionVerb)) {
      return {
        policyId: 'POL-05',
        decision: Decision.DENY,
        reason: `External auditors cannot perform mutations ("${request.action}")`,
        metadata: { action: request.action, restriction: 'no-mutations' },
      };
    }

    // Export actions are denied
    if (actionVerb === 'export' || request.action === 'report.export') {
      return {
        policyId: 'POL-05',
        decision: Decision.DENY,
        reason: 'External auditors cannot export data',
        metadata: { action: request.action, restriction: 'no-export' },
      };
    }

    // Settings access is denied
    if (request.resourceType === 'settings') {
      return {
        policyId: 'POL-05',
        decision: Decision.DENY,
        reason: 'External auditors cannot access settings',
        metadata: { action: request.action, restriction: 'no-settings' },
      };
    }

    // All other read actions are permitted but restricted to READ_ONLY
    return {
      policyId: 'POL-05',
      decision: Decision.READ_ONLY,
      reason: `External auditor — "${request.action}" permitted as READ_ONLY with enhanced audit logging`,
      metadata: { action: request.action, mode: 'read-only-enhanced-audit' },
    };
  },
};
