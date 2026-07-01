/**
 * RB-02B Policy Framework — Exports
 *
 * Usage:
 *   import { PolicyRegistry, createDefaultRegistry, ... } from '@/lib/authorization/engine/policies'
 */

export { PolicyRegistry } from './registry';
export type { AuthorizationPolicy, PolicyEvaluationMeta } from './types';

export { ownershipPolicy } from './pol-01-ownership';
export { creatorPrivilegePolicy } from './pol-02-creator-privilege';
export { projectScopePolicy } from './pol-03-project-scope';
export { integrationRestrictionPolicy } from './pol-04-integration-restriction';
export { externalAuditorRestrictionPolicy } from './pol-05-external-auditor-restriction';
export { timeBasedAccessPolicy } from './pol-06-time-based-access';
export { approvalGatePolicy } from './pol-07-approval-gate';
export { resourceSensitivityPolicy } from './pol-08-resource-sensitivity';
export { bulkOperationLimitPolicy } from './pol-09-bulk-operation-limit';

export { createHandlersFromRegistry, createStandardEngine, createDefaultRegistry } from './policy-engine-adapter';
