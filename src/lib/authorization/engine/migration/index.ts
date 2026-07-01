/**
 * RB-02B Migration Utilities — Exports
 *
 * Shadow mode, parity analysis, migration adapter, and evidence package.
 *
 * Usage:
 *   import { ShadowLogger, generateParityReport, generateEvidencePackage, ... } from '@/lib/authorization/engine/migration'
 */

export { ShadowAdapter } from './shadow-adapter';
export type { ShadowComparison, ParityStats } from './shadow-adapter';

export { ShadowLogger, shadowLogger } from './shadow-logger';
export type {
  ShadowRecord,
  ShadowLogExportFormat,
  PolicyAccuracyEntry,
  PermissionCoverageEntry,
  VersionFingerprint,
} from './shadow-logger';
export { getPolicyAccuracy, getPermissionCoverage, generateVersionFingerprint } from './shadow-logger';

export { generateParityReport, formatParityReport, detectDrift } from './parity-report';
export type { ParityReport, CoverageSummary, MismatchDetail, DriftResult } from './parity-report';
export { classifyMismatch, MISMATCH_SEVERITY, generateDecisionFingerprint } from './parity-report';

export { generateEvidencePackage } from './evidence-package';
export type { EvidencePackage } from './evidence-package';

export {
  buildReplayDataset,
  loadReplayDataset,
  serializeReplayDataset,
  saveReplayDataset,
  replayDataset,
} from './decision-replay';
export type {
  ReplayRecord,
  ReplayDataset,
  ReplayResult,
  ReplaySummary,
} from './decision-replay';
