/**
 * RB-02B Parity Evidence Package
 *
 * Generates a complete evidence package for W4A.5 Parity Certification.
 * Outputs structured JSON files that serve as the operational baseline
 * before W4B (Dual Decision) begins.
 *
 * Evidence package contents:
 *   - PARITY_SUMMARY.md     — Human-readable report
 *   - PARITY_METRICS.json   — All numeric metrics
 *   - PARITY_COVERAGE.json  — Resource, action, role, permission, policy coverage
 *   - PARITY_POLICY_ACCURACY.json — Per-policy execution stats
 *   - PARITY_MISMATCHES.json — All mismatch details
 *   - PARITY_LATENCY.json   — Latency distribution
 *   - PARITY_BASELINE.json  — Snapshot for future drift comparison
 *
 * @see MIGRATION_PARITY_PLAN.md — W4A.5 Parity Certification
 */

import type { ParityReport } from './parity-report';
import type { ShadowLogger } from './shadow-logger';
import { generateParityReport, formatParityReport, detectDrift } from './parity-report';
import fs from 'fs';
import path from 'path';

/**
 * Evidence package output.
 */
export interface EvidencePackage {
  /** Directory where files were written */
  outputDir: string;
  /** Files written */
  files: string[];
  /** The parity report used */
  report: ParityReport;
  /** Whether this package can serve as a baseline */
  isBaseline: boolean;
}

/**
 * Generate an evidence package from shadow logger data.
 *
 * @param logger The shadow logger instance
 * @param outputDir Directory to write files (default: docs/platform/authorization/parity/)
 * @param previousReport Optional previous report for drift detection
 */
export function generateEvidencePackage(
  logger: ShadowLogger,
  outputDir?: string,
  previousReport?: ParityReport,
): EvidencePackage {
  const dir = outputDir ?? 'docs/platform/authorization/parity';
  const report = generateParityReport(logger);
  const files: string[] = [];

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });

  // 1. PARITY_SUMMARY.md
  const summary = formatParityReport(report);
  fs.writeFileSync(path.join(dir, 'PARITY_SUMMARY.md'), summary, 'utf-8');
  files.push('PARITY_SUMMARY.md');

  // 2. PARITY_METRICS.json
  const metrics = {
    generatedAt: report.generatedAt,
    totalEvaluations: report.totalEvaluations,
    matches: report.matches,
    mismatches: report.mismatches,
    matchRate: report.matchRate,
    unexpectedAllow: report.unexpectedAllow,
    unexpectedDeny: report.unexpectedDeny,
    criticalMismatches: report.criticalMismatches,
    highMismatches: report.highMismatches,
    gatePassed: report.gatePassed,
    engineErrors: report.engineErrors,
    uniqueFingerprints: report.uniqueFingerprints,
    avgLatencyLegacyMs: report.avgLatencyLegacyMs,
    avgLatencyEngineMs: report.avgLatencyEngineMs,
    latencyBudget: report.latencyBudget,
    version: report.version,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_METRICS.json'), JSON.stringify(metrics, null, 2), 'utf-8');
  files.push('PARITY_METRICS.json');

  // 3. PARITY_COVERAGE.json
  const coverage = {
    generatedAt: report.generatedAt,
    resources: report.coverage.resources,
    actions: report.coverage.actions,
    roles: report.coverage.roles,
    policies: report.coverage.policies,
    permissionCoverage: report.permissionCoverage,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_COVERAGE.json'), JSON.stringify(coverage, null, 2), 'utf-8');
  files.push('PARITY_COVERAGE.json');

  // 4. PARITY_POLICY_ACCURACY.json
  const policyAccuracy = {
    generatedAt: report.generatedAt,
    policies: report.policyAccuracy,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_POLICY_ACCURACY.json'), JSON.stringify(policyAccuracy, null, 2), 'utf-8');
  files.push('PARITY_POLICY_ACCURACY.json');

  // 5. PARITY_MISMATCHES.json
  const mismatches = {
    generatedAt: report.generatedAt,
    total: report.mismatches,
    bySeverity: report.mismatchBySeverity,
    details: report.mismatchDetails,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_MISMATCHES.json'), JSON.stringify(mismatches, null, 2), 'utf-8');
  files.push('PARITY_MISMATCHES.json');

  // 6. PARITY_LATENCY.json
  const latency = {
    generatedAt: report.generatedAt,
    avgLegacyMs: report.avgLatencyLegacyMs,
    avgEngineMs: report.avgLatencyEngineMs,
    budget: report.latencyBudget,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_LATENCY.json'), JSON.stringify(latency, null, 2), 'utf-8');
  files.push('PARITY_LATENCY.json');

  // 7. PARITY_BASELINE.json — full snapshot for drift comparison
  const baseline = {
    generatedAt: report.generatedAt,
    version: report.version,
    metrics: {
      totalEvaluations: report.totalEvaluations,
      matchRate: report.matchRate,
      unexpectedAllow: report.unexpectedAllow,
      engineErrors: report.engineErrors,
      avgLatencyEngineMs: report.avgLatencyEngineMs,
    },
    coverage: {
      resourcesCovered: report.coverage.resources.covered,
      policiesExercised: Object.keys(report.policyAccuracy),
      permissionsSeen: Object.keys(report.permissionCoverage),
    },
    policyAccuracy: report.policyAccuracy,
  };
  fs.writeFileSync(path.join(dir, 'PARITY_BASELINE.json'), JSON.stringify(baseline, null, 2), 'utf-8');
  files.push('PARITY_BASELINE.json');

  // Drift detection (if previous report provided)
  if (previousReport) {
    const drift = detectDrift(previousReport, report);
    fs.writeFileSync(path.join(dir, 'PARITY_DRIFT.json'), JSON.stringify(drift, null, 2), 'utf-8');
    files.push('PARITY_DRIFT.json');
  }

  return {
    outputDir: dir,
    files,
    report,
    isBaseline: !previousReport,
  };
}
