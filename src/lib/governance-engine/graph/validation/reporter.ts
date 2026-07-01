// ENG-001B: Reporter
//
// Converts ValidationSummary into presentation formats.
// Pure functions — no I/O, no CLI, no side effects.
// The Aggregator produces data; the Reporter formats it.
//
// Formats:
//   - JSON (machine-readable)
//   - Markdown (human-readable report)
//   - CLI compact (for terminal output)

import type { ValidationSummary } from './types/validation-issues';

/**
 * Format a validation summary as a JSON string.
 */
export function reportToJson(summary: ValidationSummary): string {
  return JSON.stringify(summary, null, 2);
}

/**
 * Format a validation summary as a Markdown report.
 */
export function reportToMarkdown(summary: ValidationSummary): string {
  const status = summary.passed ? '✅ **PASSED**' : '❌ **FAILED**';
  const lines: string[] = [
    '# Relationship Validation Report',
    '',
    `**Status:** ${status}`,
    `**Validated at:** ${summary.validatedAt}`,
    `**Total issues:** ${summary.totalIssues}`,
    '',
    '## Summary',
    '',
    '| Severity | Count |',
    '|----------|-------|',
    `| Error    | ${summary.counts.errors} |`,
    `| Warning  | ${summary.counts.warnings} |`,
    `| Info     | ${summary.counts.infos} |`,
    '',
    '## By Error Code',
    '',
    '| Code | Count |',
    '|------|-------|',
  ];

  const codeEntries = Object.entries(summary.byCode).sort(([a], [b]) => a.localeCompare(b));
  for (const [code, count] of codeEntries) {
    lines.push(`| ${code} | ${count} |`);
  }

  if (summary.issues.length > 0) {
    lines.push('', '## Issues', '');
    lines.push('| Severity | Code | Entity | Message |');
    lines.push('|----------|------|--------|---------|');

    for (const issue of summary.issues) {
      const sevIcon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
      lines.push(
        `| ${sevIcon} ${issue.severity} | ${issue.code} | ${issue.entityId} | ${escapeMarkdown(issue.message)} |`,
      );
    }
  } else {
    lines.push('', '_No issues found._');
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format a validation summary as a compact CLI string.
 */
export function reportToCli(summary: ValidationSummary): string {
  const status = summary.passed ? 'PASSED' : 'FAILED';
  const lines: string[] = [
    `Validation: ${status}`,
    `  Total: ${summary.totalIssues} issues (${summary.counts.errors} errors, ${summary.counts.warnings} warnings, ${summary.counts.infos} info)`,
  ];

  if (summary.issues.length > 0) {
    lines.push('');
    for (const issue of summary.issues) {
      const label = issue.severity === 'error' ? 'ERR' : issue.severity === 'warning' ? 'WRN' : 'INF';
      lines.push(`  [${label}] [${issue.code}] ${issue.entityId}: ${issue.message}`);
      if (issue.context) {
        lines.push(`         ${issue.context}`);
      }
    }
  }

  return lines.join('\n');
}

function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
