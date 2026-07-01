/**
 * RB-02B Authorization Engine — Public API
 *
 * This is the single entry point for the Authorization Engine.
 * Products use this module, not the individual files.
 *
 * Usage:
 *   import { AuthorizationEngine, Decision, PlatformRole, Permission, ... } from '@/lib/authorization/engine'
 */

export { AuthorizationEngine } from './engine';
export {
  Decision,
  DECISION_PRECEDENCE,
  PipelineStage,
  highestPrecedence,
  decisionToHttpStatus,
} from './types';

export type {
  AuthorizationRequest,
  AuthorizationDecision,
  DecisionTrace,
  PolicyResult,
  StageHandler,
} from './types';

// Re-export all registries
export {
  ResourceType,
  ResourceKind,
  Permission,
  Capability,
  PlatformRole,
  ROLE_PERMISSIONS,
  PERMISSION_CAPABILITY,
  PERMISSION_ACTIONS,
  PERMISSION_LABEL,
  CAPABILITY_LABEL,
  RESOURCE_CATALOG,
  PRODUCT_LABELS,
  roleHasPermission,
  permissionsForRole,
  permissionsForResource,
  permissionsForCapability,
  capabilityForPermission,
  parsePlatformRole,
} from './registries';

// Re-export all policies
export {
  PolicyRegistry,
  createDefaultRegistry,
  createHandlersFromRegistry,
  createStandardEngine,
} from './policies';

export type { AuthorizationPolicy } from './policies';

// Re-export migration utilities
export {
  ShadowAdapter,
  ShadowLogger,
  shadowLogger,
  generateParityReport,
  formatParityReport,
  generateEvidencePackage,
  detectDrift,
  buildReplayDataset,
  replayDataset,
} from './migration';

export type {
  ShadowRecord,
  ShadowComparison,
  ParityStats,
  ParityReport,
  EvidencePackage,
  DriftResult,
  ReplayDataset,
  ReplaySummary,
} from './migration';
