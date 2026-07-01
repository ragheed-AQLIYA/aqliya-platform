/**
 * POL-09: Bulk Operation Limit
 *
 * Bulk operations (import, export, batch update) require the same permission
 * as the individual operation PLUS a dedicated bulk-operation permission.
 *
 * Stage: Policy Evaluation (Priority 7)
 * @see RB-02A v1.0 §8.3 — POL-09
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const bulkOperationLimitPolicy: AuthorizationPolicy = {
  id: 'POL-09',
  name: 'Bulk Operation Limit',
  description: 'Bulk operations require individual + dedicated bulk permission',
  stage: PipelineStage.POLICY_EVALUATION,
  priority: 7,
  inputs: ['Action.name', 'Action.isBulk'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'active',

  async evaluate(request) {
    // Check if this is a bulk operation via context flag
    const isBulk = request.context?.isBulkOperation === true;

    if (!isBulk) {
      return {
        policyId: 'POL-09',
        decision: Decision.ALLOW,
        reason: 'Not a bulk operation — policy not applicable',
        metadata: { isBulk: false },
      };
    }

    // Bulk operations must be explicitly permitted
    const bulkAllowed = request.context?.bulkOperationPermitted === true;

    if (!bulkAllowed) {
      return {
        policyId: 'POL-09',
        decision: Decision.DENY,
        reason: `Bulk "${request.action}" requires explicit bulk-operation permission`,
        metadata: {
          isBulk: true,
          bulkPermitted: false,
          action: request.action,
        },
      };
    }

    return {
      policyId: 'POL-09',
      decision: Decision.ALLOW,
      reason: `Bulk "${request.action}" is explicitly permitted`,
      metadata: { isBulk: true, bulkPermitted: true },
    };
  },
};
