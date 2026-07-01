/**
 * POL-08: Resource Sensitivity Classification (Future)
 *
 * Resources with sensitive fields require explicit permission to read
 * those fields, even within the same role.
 *
 * Example: Supplier.crNumber (commercial registration) requires
 * supplier.read + explicit sensitive-data flag.
 *
 * Stage: Policy Evaluation (Priority 8)
 * Status: future — NOT YET IMPLEMENTED
 *
 * @see RB-02A v1.0 §8.3 — POL-08
 */

import { Decision, PipelineStage } from '../types';
import type { AuthorizationPolicy } from './types';

export const resourceSensitivityPolicy: AuthorizationPolicy = {
  id: 'POL-08',
  name: 'Resource Sensitivity Classification',
  description: 'Sensitive fields require explicit permission to read',
  stage: PipelineStage.POLICY_EVALUATION,
  priority: 8,
  inputs: ['Resource.type', 'Resource.field', 'Actor.permissions'],
  decisionType: 'RESTRICT',
  owner: 'Platform Governance',
  status: 'future',

  async evaluate(_request: { userId: string; organizationId: string }) {
    return {
      policyId: 'POL-08',
      decision: Decision.ALLOW,
      reason: 'POL-08 is future — no sensitivity classification active',
      metadata: { status: 'future', note: 'Not yet implemented' },
    };
  },
};
