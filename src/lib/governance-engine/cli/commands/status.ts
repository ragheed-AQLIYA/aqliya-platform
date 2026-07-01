import { ExecutionContextBuilder } from '../../context/builder';
import { loadRegistries } from '../helpers';

export async function statusCommand(): Promise<number> {
  const { registries, exitCode } = await loadRegistries();
  if (exitCode !== 0) return exitCode;

  const ctx = ExecutionContextBuilder.build(registries);
  const { metrics, evidence, sortedClaimIds, sortedEvidenceIds } = ctx;

  const totalClaims = sortedClaimIds.length;
  const totalEvidence = sortedEvidenceIds.length;
  const totalProducts = metrics.totalProducts;
  const totalDecisions = metrics.totalDecisions;
  const totalAuthorities = metrics.totalAuthorities;
  const totalSources = metrics.totalSources;
  const totalFindings = registries.findings.length;

  const claimsWithEvidence = totalClaims - ctx.claims.withoutEvidence.length;
  const openFindings = registries.findings.filter(f => f.status === 'Open').length;
  const expiredEvidence = evidence.freshnessStats.expired;

  const freshnessStatus = totalEvidence === 0
    ? 'N/A'
    : expiredEvidence === 0
      ? 'All fresh'
      : `${expiredEvidence}/${totalEvidence} expired`;

  const frozenStatus = registries.frozen ? 'Yes' : 'No';

  const lines: string[] = [
    '# Governance Engine — Health Overview',
    '',
    `Engine Version: 1.0.0`,
    `Baseline Version: M2 v1.2`,
    `Frozen: ${frozenStatus}`,
    '',
    '## Registry Counts',
    '',
    `| Entity        | Count |`,
    `|---------------|-------|`,
    `| Products      | ${String(totalProducts).padStart(4)} |`,
    `| Claims        | ${String(totalClaims).padStart(4)} |`,
    `| Evidence      | ${String(totalEvidence).padStart(4)} |`,
    `| Sources       | ${String(totalSources).padStart(4)} |`,
    `| Authorities   | ${String(totalAuthorities).padStart(4)} |`,
    `| Decisions     | ${String(totalDecisions).padStart(4)} |`,
    `| Findings      | ${String(totalFindings).padStart(4)} |`,
    '',
    '## Quality Metrics',
    '',
    `| Metric              | Value                |`,
    `|---------------------|----------------------|`,
    `| Claims w/ Evidence  | ${String(claimsWithEvidence).padStart(4)} / ${String(totalClaims).padStart(4)} |`,
    `| Open Findings       | ${String(openFindings).padStart(4)} / ${String(totalFindings).padStart(4)} |`,
    `| Freshness Status    | ${freshnessStatus.padEnd(20)} |`,
    `| Evidence Yield      | ${ctx.metrics.evidenceYield.toFixed(2).padStart(6)} |`,
    `| Reuse Ratio         | ${ctx.metrics.reuseRatio.toFixed(2).padStart(6)} |`,
  ];

  process.stdout.write(lines.join('\n') + '\n');
  return 0;
}
