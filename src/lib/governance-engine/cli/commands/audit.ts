import { GovernanceValidator } from '../../validators/governance-validator';
import { EntityResolver } from '../../resolver/entity-resolver';
import { loadRegistries } from '../helpers';

export async function auditCommand(
  options: { scope?: string; output?: string },
): Promise<number> {
  const { registries, exitCode } = await loadRegistries(options.scope);
  if (exitCode !== 0) return exitCode;

  const startTime = performance.now();

  const entityResolver = new EntityResolver(registries);
  const resolutionResult = entityResolver.resolveAll();

  const govValidator = new GovernanceValidator(registries);
  const govResult = await govValidator.validate();

  const totalDuration = performance.now() - startTime;

  const auditReport: string[] = [
    '# Governance Audit Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Duration: ${totalDuration.toFixed(0)}ms`,
    `Engine Version: 1.0.0`,
    `Baseline Version: M2 v1.2`,
    `Registries Frozen: ${registries.frozen}`,
    '',
    '## Entity Resolution',
    '',
    `| Metric              | Value |`,
    `|---------------------|-------|`,
    `| Resolved References | ${resolutionResult.resolved} |`,
    `| Failed References   | ${resolutionResult.failed} |`,
    `| Circular Dependencies | ${resolutionResult.circularDeps.length} |`,
    '',
  ];

  if (resolutionResult.failures.length > 0) {
    auditReport.push('### Resolution Failures\n');
    auditReport.push('| Entity Type | Entity ID | Reference Type | Reference ID | Reason |');
    auditReport.push('|-------------|-----------|----------------|--------------|--------|');
    for (const f of resolutionResult.failures) {
      auditReport.push(`| ${f.entityType} | ${f.entityId} | ${f.refType} | ${f.refId} | ${f.reason} |`);
    }
    auditReport.push('');
  }

  if (resolutionResult.circularDeps.length > 0) {
    auditReport.push('### Circular Dependencies\n');
    for (const dep of resolutionResult.circularDeps) {
      auditReport.push(`- ${dep}`);
    }
    auditReport.push('');
  }

  auditReport.push('## Governance Validation');
  auditReport.push('');
  auditReport.push(`Status: ${govResult.status}`);
  auditReport.push(`Total Checks: ${govResult.summary.total}`);
  auditReport.push(`Passed: ${govResult.summary.passed}`);
  auditReport.push(`Failed: ${govResult.summary.failed}`);
  auditReport.push(`Warnings: ${govResult.summary.warnings}`);
  auditReport.push('');

  const failedResults = govResult.results.filter(r => r.status === 'fail');
  if (failedResults.length > 0) {
    auditReport.push('### Failed Checks\n');
    auditReport.push('| ID | Name | Severity | Details |');
    auditReport.push('|----|------|----------|---------|');
    for (const r of failedResults) {
      auditReport.push(`| ${r.id} | ${r.name} | ${r.severity} | ${r.details} |`);
    }
    auditReport.push('');
  }

  const warnResults = govResult.results.filter(r => r.status === 'warn');
  if (warnResults.length > 0) {
    auditReport.push('### Warnings\n');
    auditReport.push('| ID | Name | Details |');
    auditReport.push('|----|------|---------|');
    for (const r of warnResults) {
      auditReport.push(`| ${r.id} | ${r.name} | ${r.details} |`);
    }
    auditReport.push('');
  }

  const reportContent = auditReport.join('\n');

  if (options.output) {
    try {
      const fs = await import('node:fs/promises');
      await fs.writeFile(options.output, reportContent, 'utf-8');
      process.stdout.write(`Audit report written to ${options.output}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Failed to write audit report: ${message}\n`);
      return 1;
    }
  } else {
    process.stdout.write(reportContent + '\n');
  }

  if (govResult.status === 'fail') return 2;
  if (govResult.status === 'warn') return 1;
  return 0;
}
