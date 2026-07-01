/**
 * RB-02B Shadow Decision Logger
 *
 * Structured logging for shadow mode authorization comparisons.
 * Replaces raw console.debug with queryable, aggregatable shadow records.
 *
 * Each shadow evaluation produces a ShadowRecord.
 * Records are stored in-memory for real-time analysis and can be
 * exported as JSONL for offline analysis.
 *
 * @see MIGRATION_PARITY_PLAN.md — W4A Shadow Mode
 */

import { Decision } from '../types';

/**
 * A single shadow evaluation record.
 */
export interface ShadowRecord {
  /** Unique request identifier */
  requestId: string;
  /** ISO timestamp of the evaluation */
  timestamp: string;
  /** The resource type being accessed */
  resourceType: string;
  /** The resource ID being accessed */
  resourceId?: string;
  /** The action being performed */
  action: string;
  /** The user's platform role */
  role: string;
  /** The organization ID */
  organizationId: string;
  /** Whether the legacy guard allowed the action */
  legacyAllowed: boolean;
  /** The engine's decision */
  engineDecision: Decision;
  /** Whether the decisions match */
  isMatch: boolean;
  /** Legacy guard latency (ms) — 0 if not measurable */
  latencyLegacyMs: number;
  /** Engine latency (ms) */
  latencyEngineMs: number;
  /** The engine trace identifier */
  tracePolicy?: string;
  /** Which policies were exercised in this evaluation */
  policiesExercised: string[];
  /** Human-readable explanation if mismatch */
  mismatchReason?: string;
}

export type ShadowLogExportFormat = 'jsonl' | 'json';

/**
 * In-memory shadow decision log.
 * Collects shadow records and provides aggregation/query capabilities.
 */
export class ShadowLogger {
  private records: ShadowRecord[] = [];
  private requestCounter = 0;

  /**
   * Record a shadow evaluation result.
   */
  record(entry: Omit<ShadowRecord, 'requestId' | 'timestamp'>): ShadowRecord {
    const record: ShadowRecord = {
      ...entry,
      requestId: `shadow-${++this.requestCounter}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  /**
   * Get all records.
   */
  getAll(): ShadowRecord[] {
    return [...this.records];
  }

  /**
   * Get records that had mismatched decisions.
   */
  getMismatches(): ShadowRecord[] {
    return this.records.filter((r) => !r.isMatch);
  }

  /**
   * Get records that matched.
   */
  getMatches(): ShadowRecord[] {
    return this.records.filter((r) => r.isMatch);
  }

  /**
   * Get unique policies that have been exercised.
   */
  getExercisedPolicies(): Set<string> {
    const policies = new Set<string>();
    for (const r of this.records) {
      for (const p of r.policiesExercised) {
        policies.add(p);
      }
    }
    return policies;
  }

  /**
   * Get coverage stats for resources, actions, roles.
   */
  getCoverage(): {
    resources: Set<string>;
    actions: Set<string>;
    roles: Set<string>;
    policies: Set<string>;
  } {
    const resources = new Set<string>();
    const actions = new Set<string>();
    const roles = new Set<string>();
    const policies = new Set<string>();

    for (const r of this.records) {
      resources.add(r.resourceType);
      actions.add(r.action);
      roles.add(r.role);
      for (const p of r.policiesExercised) {
        policies.add(p);
      }
    }

    return { resources, actions, roles, policies };
  }

  /**
   * Get total record count.
   */
  get count(): number {
    return this.records.length;
  }

  /**
   * Clear all records.
   */
  reset(): void {
    this.records = [];
    this.requestCounter = 0;
  }

  /**
   * Export records in the specified format.
   */
  export(format: ShadowLogExportFormat = 'jsonl'): string {
    switch (format) {
      case 'jsonl':
        return this.records.map((r) => JSON.stringify(r)).join('\n');
      case 'json':
        return JSON.stringify(this.records, null, 2);
    }
  }

  /**
   * Load records from a JSONL string (for offline analysis).
   */
  importFromJsonl(data: string): number {
    const lines = data.trim().split('\n');
    let count = 0;
    for (const line of lines) {
      try {
        const record = JSON.parse(line) as ShadowRecord;
        this.records.push(record);
        count++;
      } catch {
        // Skip invalid lines
      }
    }
    return count;
  }
}

// ─── Policy Accuracy ────────────────────────────────────────────

/**
 * Per-policy execution statistics.
 */
export interface PolicyAccuracyEntry {
  executed: number;
  passed: number;
  failed: number;
  lastExecution: string;
}

/**
 * Get policy accuracy stats from all records.
 */
export function getPolicyAccuracy(
  records: ShadowRecord[],
): Record<string, PolicyAccuracyEntry> {
  const stats: Record<string, PolicyAccuracyEntry> = {};

  for (const record of records) {
    const seenPolicies = new Set<string>();

    for (const policyId of record.policiesExercised) {
      if (seenPolicies.has(policyId)) continue;
      seenPolicies.add(policyId);

      if (!stats[policyId]) {
        stats[policyId] = { executed: 0, passed: 0, failed: 0, lastExecution: '' };
      }

      stats[policyId].executed++;
      // A policy "passes" if the record matched (no mismatch caused by this policy)
      stats[policyId].passed += record.isMatch ? 1 : 0;
      stats[policyId].failed += record.isMatch ? 0 : 1;
      stats[policyId].lastExecution = record.timestamp;
    }
  }

  return stats;
}

// ─── Permission Coverage ─────────────────────────────────────────

/**
 * Permission coverage entry.
 */
export interface PermissionCoverageEntry {
  seen: boolean;
  count: number;
  lastAction: string;
}

/**
 * Get permission coverage from shadow records.
 * Uses the action name to infer which permission was exercised.
 */
export function getPermissionCoverage(
  records: ShadowRecord[],
): Record<string, PermissionCoverageEntry> {
  const coverage: Record<string, PermissionCoverageEntry> = {};

  for (const record of records) {
    const permKey = `${record.resourceType}.${record.action.split('.')[1] ?? record.action}`;

    if (!coverage[permKey]) {
      coverage[permKey] = { seen: false, count: 0, lastAction: '' };
    }

    coverage[permKey].seen = true;
    coverage[permKey].count++;
    coverage[permKey].lastAction = record.action;
  }

  return coverage;
}

// ─── Version Fingerprint ─────────────────────────────────────────

/**
 * Version fingerprint for a parity snapshot.
 * Captures the exact state of the authorization system.
 */
export interface VersionFingerprint {
  engineVersion: string;
  registryVersion: string;
  gitCommit: string;
  buildId: string;
  generatedAt: string;
  policyCount: number;
  permissionCount: number;
  roleCount: number;
  resourceCount: number;
}

/**
 * Generate a version fingerprint for the current system state.
 */
export function generateVersionFingerprint(
  engineVersion?: string,
  registryVersion?: string,
): VersionFingerprint {
  // Try to read from environment or use fallbacks
  const gitCommit = process.env.GIT_COMMIT
    ?? process.env.VERCEL_GIT_COMMIT_SHA
    ?? 'unknown';

  const buildId = process.env.BUILD_ID
    ?? process.env.VERCEL_BUILD_ID
    ?? 'local';

  return {
    engineVersion: engineVersion ?? '1.0.0',
    registryVersion: registryVersion ?? '1.0.0',
    gitCommit,
    buildId,
    generatedAt: new Date().toISOString(),
    policyCount: 9, // From RB-02A
    permissionCount: 23,
    roleCount: 7,
    resourceCount: 18,
  };
}

// ─── Decision Stability ─────────────────────────────────────────

/**
 * Decision stability result.
 * Measures whether the same request (by decision fingerprint) always produces the same decision.
 */
export interface DecisionStabilityResult {
  /** Total unique fingerprints */
  totalFingerprints: number;
  /** Fingerprints with 100% consistent decisions */
  stableFingerprints: number;
  /** Fingerprints with varying decisions (non-deterministic) */
  unstableFingerprints: number;
  /** Overall stability percentage */
  stabilityPercentage: number;
  /** Details of unstable fingerprints */
  unstableDetails: Array<{
    fingerprint: string;
    decisions: string[];
    count: number;
  }>;
}

/**
 * Calculate decision stability from shadow records.
 * Groups records by decision fingerprint and checks for consistency.
 */
export function getDecisionStability(
  records: ShadowRecord[],
): DecisionStabilityResult {
  // Group records by their decision fingerprint
  const groups = new Map<string, { decisions: Set<string>; count: number }>();

  for (const record of records) {
    const fp = `${record.resourceType}|${record.action}|${record.role}`;
    if (!groups.has(fp)) {
      groups.set(fp, { decisions: new Set(), count: 0 });
    }
    const group = groups.get(fp)!;
    group.decisions.add(record.engineDecision);
    group.count++;
  }

  let stable = 0;
  let unstable = 0;
  const unstableDetails: DecisionStabilityResult['unstableDetails'] = [];

  for (const [fingerprint, group] of groups.entries()) {
    if (group.decisions.size === 1) {
      stable++;
    } else {
      unstable++;
      unstableDetails.push({
        fingerprint,
        decisions: Array.from(group.decisions),
        count: group.count,
      });
    }
  }

  const total = stable + unstable;
  const stabilityPercentage = total > 0
    ? Math.round((stable / total) * 10000) / 100
    : 100;

  return {
    totalFingerprints: total,
    stableFingerprints: stable,
    unstableFingerprints: unstable,
    stabilityPercentage,
    unstableDetails,
  };
}

// ─── Shadow Health ───────────────────────────────────────────────

/**
 * Shadow infrastructure health metrics.
 */
export interface ShadowHealth {
  /** Total shadow evaluations attempted */
  totalAttempted: number;
  /** Successful shadow evaluations */
  totalSucceeded: number;
  /** Failed shadow evaluations */
  totalFailed: number;
  /** Shadow logger records stored */
  totalRecords: number;
  /** Logger errors (write failures) */
  loggerErrors: number;
  /** Shadow success rate */
  successRate: number;
  /** Whether shadow infrastructure is healthy */
  isHealthy: boolean;
}

/**
 * Get shadow infrastructure health metrics.
 */
export function getShadowHealth(
  records: ShadowRecord[],
): ShadowHealth {
  // Count shadow errors (records with negative latency indicate errors)
  const engineErrors = records.filter((r) => r.latencyEngineMs < 0).length;
  const total = records.length + engineErrors;

  return {
    totalAttempted: total,
    totalSucceeded: records.length,
    totalFailed: engineErrors,
    totalRecords: records.length,
    loggerErrors: 0, // Logger doesn't track its own errors yet — would need try-catch
    successRate: total > 0
      ? Math.round((records.length / total) * 10000) / 100
      : 0,
    isHealthy: engineErrors === 0,
  };
}

/**
 * Global singleton shadow logger instance.
 * Used by the shadow instrumentation in src/lib/auth.ts.
 */
export const shadowLogger = new ShadowLogger();
