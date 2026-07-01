interface CIResult {
  status: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    blocked: boolean;
    blockReasons: string[];
  };
  results: Array<{
    ruleId: string;
    name: string;
    status: string;
    findings: string[];
  }>;
}

function sanitizeMessage(text: string): string {
  return text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

export function formatCI(result: CIResult): string {
  const lines: string[] = [];

  const { summary } = result;

  lines.push(`::group::Governance Audit — ${result.status.toUpperCase()}`);
  lines.push('');

  if (summary.blocked) {
    for (const reason of summary.blockReasons) {
      lines.push(`::error title=Blocking Issue::${sanitizeMessage(reason)}`);
    }
  }

  for (const r of result.results) {
    const label = `${r.ruleId} — ${r.name}`;
    const msg = sanitizeMessage(label);

    if (r.status === 'error') {
      lines.push(`::error title=${msg}::${sanitizeMessage(r.findings.join('; '))}`);
    } else if (r.status === 'fail') {
      lines.push(`::warning title=${msg}::${sanitizeMessage(r.findings.join('; '))}`);
    } else if (r.status === 'warn') {
      lines.push(`::notice title=${msg}::${sanitizeMessage(r.findings.join('; '))}`);
    }
  }

  lines.push('');
  lines.push(`::notice title=Summary::Total=${summary.total} Passed=${summary.passed} Failed=${summary.failed} Warnings=${summary.warnings} Blocked=${summary.blocked}`);
  lines.push('');

  const overallStatus = result.status === 'pass' ? 'success' : 'failure';
  lines.push(`::set-output name=audit-status::${overallStatus}`);
  lines.push(`::set-output name=audit-passed::${summary.passed}`);
  lines.push(`::set-output name=audit-failed::${summary.failed}`);
  lines.push(`::set-output name=audit-warnings::${summary.warnings}`);
  lines.push(`::set-output name=audit-blocked::${summary.blocked}`);

  lines.push('::endgroup::');

  return lines.join('\n');
}
