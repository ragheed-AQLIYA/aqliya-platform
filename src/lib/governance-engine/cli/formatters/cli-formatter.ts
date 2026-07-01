import type { ValidationResponse } from '../../validators/types';
import type { RuleEngineReport } from '../../types/rules';

interface FormattableValidationResult {
  id: string; name: string; status: string; severity: string;
  details: string; findings: string[];
  ruleId?: string; executionTime?: number; errorCode?: string;
  documentationLink?: string; validatorVersion?: string;
}

function formatValidationResult(result: FormattableValidationResult): string {
  const statusIcon = result.status === 'pass' ? 'PASS' : result.status === 'fail' ? 'FAIL' : result.status === 'warn' ? 'WARN' : 'ERR ';
  const lines: string[] = [
    `  [${statusIcon}] ${result.id} — ${result.name}`,
    `         Severity: ${result.severity}`,
    `         Details: ${result.details}`,
  ];
  // v2 fields
  if (result.ruleId) lines.push(`         Rule:      ${result.ruleId}`);
  if (result.executionTime !== undefined) lines.push(`         Time:      ${result.executionTime.toFixed(1)}ms`);
  if (result.errorCode) lines.push(`         Error:     ${result.errorCode}`);
  if (result.documentationLink) lines.push(`         Docs:      ${result.documentationLink}`);
  if (result.validatorVersion) lines.push(`         Version:   ${result.validatorVersion}`);
  if (result.findings.length > 0) {
    for (const finding of result.findings.slice(0, 5)) {
      lines.push(`           • ${finding}`);
    }
    if (result.findings.length > 5) {
      lines.push(`           … and ${result.findings.length - 5} more`);
    }
  }
  return lines.join('\n');
}

export function formatCLI(result: unknown): string {
  if (result === null || result === undefined) {
    return 'No results.';
  }

  const obj = result as Record<string, unknown>;

  if (typeof obj === 'string') {
    return obj;
  }

  if (Array.isArray(result)) {
    return result.map(formatValidationResult).join('\n\n');
  }

  const lines: string[] = [];

  if ('status' in obj && typeof obj.status === 'string') {
    const statusLabel = obj.status === 'pass' ? 'PASS' : obj.status === 'fail' ? 'FAIL' : obj.status === 'warn' ? 'WARN' : 'ERROR';
    lines.push(`Status: ${statusLabel}`);
  }

  if ('summary' in obj && typeof obj.summary === 'object' && obj.summary !== null) {
    const summary = obj.summary as Record<string, unknown>;
    lines.push('');
    lines.push('  Summary');
    lines.push('  -------');
    if (typeof summary.total === 'number') lines.push(`    Total:    ${summary.total}`);
    if (typeof summary.passed === 'number') lines.push(`    Passed:   ${summary.passed}`);
    if (typeof summary.failed === 'number') lines.push(`    Failed:   ${summary.failed}`);
    if (typeof summary.warnings === 'number') lines.push(`    Warnings: ${summary.warnings}`);
    if (typeof summary.blocked === 'boolean' && summary.blocked) {
      lines.push(`    Blocked:  Yes`);
      if (Array.isArray(summary.blockReasons) && summary.blockReasons.length > 0) {
        for (const reason of summary.blockReasons) {
          lines.push(`      ⛔ ${reason}`);
        }
      }
    }
    lines.push('');
  }

  if ('metadata' in obj && typeof obj.metadata === 'object' && obj.metadata !== null) {
    const meta = obj.metadata as Record<string, unknown>;
    lines.push('  Metadata');
    lines.push('  --------');
    if (typeof meta.duration === 'number') lines.push(`    Duration: ${meta.duration.toFixed(0)}ms`);
    if (typeof meta.timestamp === 'string') lines.push(`    Timestamp: ${meta.timestamp}`);
    if (typeof meta.engineVersion === 'string') lines.push(`    Engine:   ${meta.engineVersion}`);
    if (typeof meta.baselineVersion === 'string') lines.push(`    Baseline: ${meta.baselineVersion}`);
    lines.push('');
  }

  if ('rules' in obj && Array.isArray(obj.rules)) {
    lines.push('  Rule Results');
    lines.push('  ------------');
    for (const rule of obj.rules) {
      const r = rule as Record<string, unknown>;
      lines.push(`    [${String(r.status).toUpperCase().padEnd(5)}] ${r.ruleId ?? r.id} — ${r.name}`);
    }
    lines.push('');
  }

  if ('results' in obj && Array.isArray(obj.results)) {
    lines.push('  Validation Results');
    lines.push('  ------------------');
    for (const r of obj.results) {
      const vr = r as FormattableValidationResult;
      lines.push('');
      lines.push(formatValidationResult(vr));
    }
    lines.push('');
  }

  return lines.join('\n');
}
