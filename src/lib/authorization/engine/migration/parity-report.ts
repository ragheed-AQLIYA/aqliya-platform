/**
 * RB-02B Parity Report Generator
 *
 * Generates structured parity reports from shadow evaluation data.
 * Used to determine when W4A (Shadow) → W4B (Dual) → W4C (Cutover) gates pass.
 *
 * @see MIGRATION_PARITY_PLAN.md
 */

import { Decision } from '../types';
import { createHash } from 'crypto';
import type { ShadowLogger, PolicyAccuracyEntry, PermissionCoverageEntry, VersionFingerprint, DecisionStabilityResult, ShadowHealth } from './shadow-logger';
import {
  getPolicyAccuracy,
  getPermissionCoverage,
  generateVersionFingerprint,
  getDecisionStability,
  getShadowHealth,
} from './shadow-logger';

// ─── Decision Drift Detection ────────────────────────────────────

/**
 * Drift detection result — compares two parity snapshots.
 */
export interface DriftResult {
  /** Whether drift was detected */
  hasDrifted: boolean;
  /** Change in match rate */
  matchRateDelta: number;
  /** New mismatches since last snapshot */
  newMismatches: number;
  /** Policies where accuracy changed */
  policyDrift: Array<{
    policyId: string;
    previousAccuracy: number;
    currentAccuracy: number;
  }>;
  /** Severity of the drift */
  severity: 'none' | 'minor' | 'major' | 'critical';
  /** Human-readable summary */
  summary: string;
}

/**
 * Detect drift between a previous and current parity report.
 */
export function detectDrift(
  previous: ParityReport,
  current: ParityReport,
): DriftResult {
  const matchRateDelta = Math.round((current.matchRate - previous.matchRate) * 100) / 100;
  const newMismatches = current.mismatches - previous.mismatches;

  // Policy drift
  const policyDrift: DriftResult['policyDrift'] = [];
  const prevPolicy = previous.policyAccuracy ?? {};
  const currPolicy = current.policyAccuracy ?? {};

  for (const [policyId, curr] of Object.entries(currPolicy) as [string, PolicyAccuracyEntry][]) {
    const prev = prevPolicy[policyId] as PolicyAccuracyEntry | undefined;
    if (prev) {
      const prevAcc = prev.executed > 0 ? (prev.passed / prev.executed) * 100 : 100;
      const currAcc = curr.executed > 0 ? (curr.passed / curr.executed) * 100 : 100;
      if (Math.abs(currAcc - prevAcc) > 1) {
        policyDrift.push({ policyId, previousAccuracy: Math.round(prevAcc), currentAccuracy: Math.round(currAcc) });
      }
    }
  }

  // Determine severity
  let severity: DriftResult['severity'] = 'none';
  if (matchRateDelta < -0.5 || current.unexpectedAllow > previous.unexpectedAllow) {
    severity = 'critical';
  } else if (matchRateDelta < -0.1 || newMismatches > 10) {
    severity = 'major';
  } else if (matchRateDelta < 0 || newMismatches > 0) {
    severity = 'minor';
  }

  const summary = severity === 'none'
    ? `No drift detected. Match rate: ${current.matchRate}% (${matchRateDelta >= 0 ? '+' : ''}${matchRateDelta}%).`
    : `⚠️ ${severity.toUpperCase()} drift: match rate ${matchRateDelta}% (${previous.matchRate}% → ${current.matchRate}%). ${newMismatches} new mismatches.`;

  return {
    hasDrifted: severity !== 'none',
    matchRateDelta,
    newMismatches,
    policyDrift,
    severity,
    summary,
  };
}

// ─── ParityMismatchType ─────────────────────────────────────────

/**
 * Classified types of authorization decision mismatches.
 * Each type has a severity that determines gate impact.
 */
export enum ParityMismatchType {
  /** Engine allowed what legacy denied — CRITICAL: potential security bypass */
  DENY_TO_ALLOW = 'DENY_TO_ALLOW',
  /** Engine denied what legacy allowed — HIGH: potential user-facing regression */
  ALLOW_TO_DENY = 'ALLOW_TO_DENY',
  /** Engine returned REQUIRE_APPROVAL where legacy allowed — MEDIUM: expected change */
  ALLOW_TO_REQUIRE_APPROVAL = 'ALLOW_TO_REQUIRE_APPROVAL',
  /** Engine returned READ_ONLY where legacy allowed differently — MEDIUM */
  ALLOW_TO_READ_ONLY = 'ALLOW_TO_READ_ONLY',
  /** Engine returned READ_ONLY where legacy denied — MEDIUM */
  DENY_TO_READ_ONLY = 'DENY_TO_READ_ONLY',
  /** Engine returned REQUIRE_APPROVAL where legacy denied — LOW */
  DENY_TO_REQUIRE_APPROVAL = 'DENY_TO_REQUIRE_APPROVAL',
  /** Cannot classify — LOW */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Severity levels for mismatch types.
 */
export const MISMATCH_SEVERITY: Record<ParityMismatchType, string> = {
  [ParityMismatchType.DENY_TO_ALLOW]: 'CRITICAL',
  [ParityMismatchType.ALLOW_TO_DENY]: 'HIGH',
  [ParityMismatchType.ALLOW_TO_REQUIRE_APPROVAL]: 'MEDIUM',
  [ParityMismatchType.ALLOW_TO_READ_ONLY]: 'MEDIUM',
  [ParityMismatchType.DENY_TO_READ_ONLY]: 'MEDIUM',
  [ParityMismatchType.DENY_TO_REQUIRE_APPROVAL]: 'LOW',
  [ParityMismatchType.UNKNOWN]: 'LOW',
};

/**
 * Classify a mismatch between legacy and engine decisions.
 */
export function classifyMismatch(
  legacyAllowed: boolean,
  engineDecision: Decision,
): ParityMismatchType {
  if (legacyAllowed) {
    switch (engineDecision) {
      case Decision.DENY: return ParityMismatchType.ALLOW_TO_DENY;
      case Decision.REQUIRE_APPROVAL: return ParityMismatchType.ALLOW_TO_REQUIRE_APPROVAL;
      case Decision.READ_ONLY: return ParityMismatchType.ALLOW_TO_READ_ONLY;
      default: return ParityMismatchType.UNKNOWN;
    }
  } else {
    // Legacy denied
    switch (engineDecision) {
      case Decision.ALLOW:
      case Decision.READ_ONLY:
        return ParityMismatchType.DENY_TO_ALLOW;
      case Decision.REQUIRE_APPROVAL:
        return ParityMismatchType.DENY_TO_REQUIRE_APPROVAL;
      default: return ParityMismatchType.UNKNOWN;
    }
  }
}

// ─── Decision Fingerprint ────────────────────────────────────────

/**
 * Generate a unique fingerprint for an authorization decision.
 * A hash of: role + action + resourceType + policies exercised + final decision.
 *
 * Use cases:
 * - Detect duplicate decisions
 * - Compare behavior across builds
 * - Track decision stability over time
 */
export function generateDecisionFingerprint(
  role: string,
  action: string,
  resourceType: string,
  policiesExercised: string[],
  decision: Decision,
): string {
  const canonical = [
    role,
    action,
    resourceType,
    [...policiesExercised].sort().join(','),
    decision,
  ].join('|');

  return createHash('sha256').update(canonical).digest('hex').substring(0, 16);
}

// ─── Latency Budget ──────────────────────────────────────────────

/**
 * Latency budget thresholds.
 * If exceeded, the gate does NOT pass even if decisions match.
 */
export const LATENCY_BUDGET = {
  avgIncreaseMs: 5,
  p95Ms: 10,
  p99Ms: 20,
};

/**
 * Calculate latency percentiles.
 */
export function calculateLatencyPercentiles(
  latencies: number[],
): { avg: number; p95: number; p99: number; max: number } {
  if (latencies.length === 0) {
    return { avg: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1] ?? sorted[sorted.length - 1];
  const p99 = sorted[Math.ceil(sorted.length * 0.99) - 1] ?? sorted[sorted.length - 1];
  const max = sorted[sorted.length - 1];
  return {
    avg: Math.round(avg * 10) / 10,
    p95,
    p99,
    max,
  };
}

/**
 * Check if engine latency is within budget.
 */
export function isLatencyWithinBudget(
  engineLatencies: number[],
  legacyLatencies: number[],
): { ok: boolean; details: Record<string, number | string> } {
  const engineStats = calculateLatencyPercentiles(engineLatencies);
  const legacyStats = calculateLatencyPercentiles(legacyLatencies);

  const avgIncrease = Math.round((engineStats.avg - legacyStats.avg) * 10) / 10;

  const details: Record<string, number | string> = {
    engineAvg: engineStats.avg,
    engineP95: engineStats.p95,
    engineP99: engineStats.p99,
    legacyAvg: legacyStats.avg,
    avgIncreaseMs: avgIncrease,
  };

  const ok = avgIncrease <= LATENCY_BUDGET.avgIncreaseMs
    && engineStats.p95 <= LATENCY_BUDGET.p95Ms
    && engineStats.p99 <= LATENCY_BUDGET.p99Ms;

  return { ok, details };
}

// ─── Coverage Summary ────────────────────────────────────────────

/**
 * Coverage summary for the parity report.
 */
export interface CoverageSummary {
  resources: { covered: string[]; missing: string[] };
  actions: { covered: string[]; missing: string[] };
  roles: { covered: string[]; missing: string[] };
  policies: { covered: string[]; missing: string[] };
}

/**
 * Mismatch detail for analysis.
 */
export interface MismatchDetail {
  requestId: string;
  resourceType: string;
  action: string;
  role: string;
  legacyAllowed: boolean;
  engineDecision: string;
  mismatchType: ParityMismatchType;
  severity: string;
  isUnexpectedAllow: boolean;
  isUnexpectedDeny: boolean;
  tracePolicy?: string;
  decisionFingerprint: string;
}

/**
 * Complete parity report.
 */
export interface ParityReport {
  generatedAt: string;

  // Version
  version: VersionFingerprint;

  // Summary
  totalEvaluations: number;
  matches: number;
  mismatches: number;
  matchRate: number;

  // Coverage
  coverage: CoverageSummary;
  permissionCoverage: Record<string, PermissionCoverageEntry>;

  // Policy accuracy
  policyAccuracy: Record<string, PolicyAccuracyEntry>;

  // Mismatch analysis
  mismatchDetails: MismatchDetail[];
  mismatchBySeverity: Record<string, number>;
  unexpectedAllow: number;
  unexpectedDeny: number;
  criticalMismatches: number;
  highMismatches: number;

  // Decision Stability
  decisionStability: DecisionStabilityResult;

  // Shadow Health
  shadowHealth: ShadowHealth;

  // Latency
  avgLatencyLegacyMs: number;
  avgLatencyEngineMs: number;
  latencyBudget: { ok: boolean; details: Record<string, number | string> };

  // Reliability
  engineErrors: number;
  uniqueFingerprints: number;

  // Gate
  gatePassed: boolean;
}

/**
 * The set of resources that should be covered for W4B readiness.
 * Based on RB-02A v1.0 §3.3 — Resource Catalog (DecisionOS subset).
 */
export const REQUIRED_RESOURCES = [
  'decision',
];

/**
 * The set of action types that should be covered.
 */
export const REQUIRED_ACTION_TYPES = [
  'read',
  'create',
  'update',
];

/**
 * All 7 platform roles — ALL must be exercised.
 */
export const REQUIRED_ROLES = [
  'ORG_ADMIN',
  'BUSINESS_MANAGER',
  'REVIEWER',
  'ANALYST',
  'READ_ONLY',
  'EXTERNAL_AUDITOR',
  'INTEGRATION_ACCOUNT',
];

/**
 * All 7 active policies — ALL must be exercised.
 */
export const REQUIRED_POLICIES = [
  'POL-01',
  'POL-02',
  'POL-03',
  'POL-04',
  'POL-05',
  'POL-07',
  'POL-09',
];

/**
 * Generate a parity report from a ShadowLogger instance.
 */
export function generateParityReport(logger: ShadowLogger): ParityReport {
  const records = logger.getAll();
  const mismatches = records.filter((r) => !r.isMatch);
  const matches = records.filter((r) => r.isMatch);
  const coverage = logger.getCoverage();

  // Coverage analysis
  const coveredResources = new Set(coverage.resources);
  const coveredActions = new Set(coverage.actions);
  const coveredRoles = new Set(coverage.roles);
  const coveredPolicies = coverage.policies;

  // Mismatch analysis with classification + fingerprints
  const mismatchDetails: MismatchDetail[] = mismatches.map((r) => {
    const engineDecision = r.engineDecision as Decision;
    const mismatchType = classifyMismatch(r.legacyAllowed, engineDecision);
    const fingerprint = generateDecisionFingerprint(
      r.role, r.action, r.resourceType, r.policiesExercised, engineDecision,
    );

    return {
      requestId: r.requestId,
      resourceType: r.resourceType,
      action: r.action,
      role: r.role,
      legacyAllowed: r.legacyAllowed,
      engineDecision: r.engineDecision,
      mismatchType,
      severity: MISMATCH_SEVERITY[mismatchType],
      isUnexpectedAllow: mismatchType === ParityMismatchType.DENY_TO_ALLOW,
      isUnexpectedDeny: mismatchType === ParityMismatchType.ALLOW_TO_DENY,
      tracePolicy: r.tracePolicy,
      decisionFingerprint: fingerprint,
    };
  });

  const unexpectedAllow = mismatchDetails.filter((m) => m.isUnexpectedAllow).length;
  const unexpectedDeny = mismatchDetails.filter((m) => m.isUnexpectedDeny).length;
  const criticalMismatches = mismatchDetails.filter((m) => m.severity === 'CRITICAL').length;
  const highMismatches = mismatchDetails.filter((m) => m.severity === 'HIGH').length;

  // Mismatches by severity
  const mismatchBySeverity: Record<string, number> = {};
  for (const m of mismatchDetails) {
    mismatchBySeverity[m.severity] = (mismatchBySeverity[m.severity] ?? 0) + 1;
  }

  // Unique fingerprints across all records
  const fingerprints = new Set<string>();
  for (const r of records) {
    const fp = generateDecisionFingerprint(
      r.role, r.action, r.resourceType, r.policiesExercised, r.engineDecision as Decision,
    );
    fingerprints.add(fp);
  }

  // Latency
  const latencyLegacy = records
    .filter((r) => r.latencyLegacyMs > 0)
    .map((r) => r.latencyLegacyMs);
  const latencyEngine = records
    .filter((r) => r.latencyEngineMs > 0)
    .map((r) => r.latencyEngineMs);

  const avgLatencyLegacyMs = latencyLegacy.length > 0
    ? Math.round((latencyLegacy.reduce((a, b) => a + b, 0) / latencyLegacy.length) * 10) / 10
    : 0;
  const avgLatencyEngineMs = latencyEngine.length > 0
    ? Math.round((latencyEngine.reduce((a, b) => a + b, 0) / latencyEngine.length) * 10) / 10
    : 0;

  const latencyBudget = isLatencyWithinBudget(latencyEngine, latencyLegacy);

  // Engine error count
  const engineErrors = records.filter((r) => r.latencyEngineMs < 0).length;

  // Gate assessment
  const matchRate = records.length > 0
    ? Math.round((matches.length / records.length) * 10000) / 100
    : 0;

  // Policy accuracy
  const policyAccuracy = getPolicyAccuracy(records);

  // Permission coverage
  const permissionCoverage = getPermissionCoverage(records);

  // Decision stability
  const decisionStability = getDecisionStability(records);

  // Shadow health
  const shadowHealth = getShadowHealth(records);

  // Version fingerprint
  const version = generateVersionFingerprint();

  // Gate assessment
  const gatePassed = evaluateGate(
    records.length, matchRate, unexpectedAllow, criticalMismatches, highMismatches,
    coverage, coveredPolicies, latencyBudget.ok, engineErrors,
  );

  return {
    generatedAt: new Date().toISOString(),
    version,
    totalEvaluations: records.length,
    matches: matches.length,
    mismatches: mismatches.length,
    matchRate,
    coverage: {
      resources: {
        covered: Array.from(coveredResources),
        missing: REQUIRED_RESOURCES.filter((r) => !coveredResources.has(r)),
      },
      actions: {
        covered: Array.from(coveredActions),
        missing: REQUIRED_ACTION_TYPES.filter((a) => !coveredActions.has(a)),
      },
      roles: {
        covered: Array.from(coveredRoles),
        missing: REQUIRED_ROLES.filter((r) => !coveredRoles.has(r)),
      },
      policies: {
        covered: Array.from(coveredPolicies),
        missing: REQUIRED_POLICIES.filter((p) => !coveredPolicies.has(p)),
      },
    },
    permissionCoverage,
    policyAccuracy,
    decisionStability,
    shadowHealth,
    mismatchDetails,
    mismatchBySeverity,
    unexpectedAllow,
    unexpectedDeny,
    criticalMismatches,
    highMismatches,
    avgLatencyLegacyMs,
    avgLatencyEngineMs,
    latencyBudget,
    engineErrors,
    uniqueFingerprints: fingerprints.size,
    gatePassed,
  };
}

/**
 * Evaluate whether the W4B entry gate passes.
 * Conditions (all must be met):
 *   - ≥99% match rate
 *   - Zero unexpected ALLOW (DENY→ALLOW)
 *   - Zero critical mismatches
 *   - Zero high mismatches
 *   - All required resources covered
 *   - All active policies exercised
 *   - Latency within budget
 *   - Zero engine errors
 */
function evaluateGate(
  totalEvals: number,
  matchRate: number,
  unexpectedAllow: number,
  criticalMismatches: number,
  highMismatches: number,
  coverage: { resources: Set<string>; roles: Set<string> },
  exercisedPolicies: Set<string>,
  latencyOk: boolean,
  engineErrors: number,
): boolean {
  if (totalEvals < 10) return false; // minimum sample
  if (matchRate < 99) return false;
  if (unexpectedAllow > 0) return false;
  if (criticalMismatches > 0) return false;
  if (highMismatches > 0) return false;
  if (!latencyOk) return false;
  if (engineErrors > 0) return false;

  const allResourcesCovered = REQUIRED_RESOURCES.every((r) => coverage.resources.has(r));
  if (!allResourcesCovered) return false;

  const allPoliciesExercised = REQUIRED_POLICIES.every((p) => exercisedPolicies.has(p));
  if (!allPoliciesExercised) return false;

  return true;
}

/**
 * Format a parity report as a markdown table for display.
 */
export function formatParityReport(report: ParityReport): string {
  const lines: string[] = [];
  lines.push('## Parity Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('### Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|------:|');
  lines.push(`| Total evaluations | ${report.totalEvaluations} |`);
  lines.push(`| Matching | ${report.matches} |`);
  lines.push(`| Mismatches | ${report.mismatches} |`);
  lines.push(`| Match rate | ${report.matchRate}% |`);
  lines.push(`| Unexpected ALLOW | ${report.unexpectedAllow} |`);
  lines.push(`| Unexpected DENY | ${report.unexpectedDeny} |`);
  lines.push(`| Critical mismatches | ${report.criticalMismatches} |`);
  lines.push(`| High mismatches | ${report.highMismatches} |`);
  lines.push(`| Avg legacy latency | ${report.avgLatencyLegacyMs} ms |`);
  lines.push(`| Avg engine latency | ${report.avgLatencyEngineMs} ms |`);
  lines.push(`| Latency budget OK | ${report.latencyBudget.ok ? '✅' : '❌'} (P95: ${report.latencyBudget.details.engineP95}ms ≤ 10ms) |`);
  lines.push(`| Engine errors | ${report.engineErrors} |`);
  lines.push(`| Unique fingerprints | ${report.uniqueFingerprints} |`);
  lines.push(`| Gate passed (W4B ready) | ${report.gatePassed ? '✅ YES' : '❌ NO'} |`);
  lines.push('');
  lines.push('### Coverage');
  lines.push('');
  lines.push('#### Resources');
  lines.push(`- Covered: ${report.coverage.resources.covered.join(', ') || '(none)'}`);
  if (report.coverage.resources.missing.length > 0) {
    lines.push(`- ❌ Missing: ${report.coverage.resources.missing.join(', ')}`);
  }
  lines.push('');
  lines.push('#### Actions');
  lines.push(`- Covered: ${report.coverage.actions.covered.join(', ') || '(none)'}`);
  if (report.coverage.actions.missing.length > 0) {
    lines.push(`- ⚠️ Missing: ${report.coverage.actions.missing.join(', ')}`);
  }
  lines.push('');
  lines.push('#### Roles');
  lines.push(`- Covered: ${report.coverage.roles.covered.join(', ') || '(none)'}`);
  if (report.coverage.roles.missing.length > 0) {
    lines.push(`- ⚠️ Missing: ${report.coverage.roles.missing.join(', ')}`);
  }
  lines.push('');
  lines.push('#### Policies');
  lines.push(`- Exercised: ${report.coverage.policies.covered.join(', ') || '(none)'}`);
  if (report.coverage.policies.missing.length > 0) {
    lines.push(`- ❌ Missing: ${report.coverage.policies.missing.join(', ')}`);
  }
  lines.push('');
  if (report.mismatches > 0) {
    lines.push('### Mismatch Details');
    lines.push('');
    lines.push('| # | Resource | Action | Role | Legacy | Engine | Type | Severity | Fingerprint |');
    lines.push('|---|----------|--------|------|--------|--------|------|:--------:|:-----------:|');
    report.mismatchDetails.slice(0, 20).forEach((m, i) => {
      lines.push(`| ${i + 1} | ${m.resourceType} | ${m.action} | ${m.role} | ${m.legacyAllowed} | ${m.engineDecision} | ${m.mismatchType} | ${m.severity} | ${m.decisionFingerprint} |`);
    });
    if (report.mismatchDetails.length > 20) {
      lines.push(`| ... and ${report.mismatchDetails.length - 20} more |`);
    }
  }
  lines.push('');
  lines.push(`**Gate assessment:** ${report.gatePassed ? '✅ Ready for W4B (Dual Decision)' : '❌ Not yet ready'}`);
  return lines.join('\n');
}
