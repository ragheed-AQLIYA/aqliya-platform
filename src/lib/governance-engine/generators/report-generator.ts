import { GovernanceRegistries } from '../types/entities';
import { parseDate } from '../shared/date';
import { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

export class ReportGenerator {
  generate(registries: GovernanceRegistries, _validationResults: unknown, context?: ExecutionContext): { content: string } {
    const ctx = context ?? ExecutionContextBuilder.build(registries);
    const now = new Date();

    const totalClaims = ctx.metrics.totalClaims || registries.claims.length;
    const totalEvidence = ctx.metrics.totalEvidence || registries.evidence.length;
    const totalProducts = ctx.metrics.totalProducts || registries.products.length;
    const totalDecisions = ctx.metrics.totalDecisions || registries.decisions.length;

    let freshCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;

    const allEvidence = [...ctx.evidence.byId.values()];
    const evidenceItems = allEvidence.length > 0 ? allEvidence : registries.evidence;
    for (const ev of evidenceItems) {
      try {
        const expiryDate = parseDate(ev.freshness.expires);
        const diffMs = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          expiredCount++;
        } else if (daysRemaining <= 30) {
          expiringCount++;
        } else {
          freshCount++;
        }
      } catch {
        expiredCount++;
      }
    }

    const sortedFindings = [...registries.findings].sort((a, b) => {
      const severityOrder: Record<string, number> = {
        Critical: 0,
        High: 1,
        Medium: 2,
        Low: 3,
        Observation: 4,
      };
      const aOrder = severityOrder[a.severity] ?? 99;
      const bOrder = severityOrder[b.severity] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.id.localeCompare(b.id);
    });

    const topFindings = sortedFindings.slice(0, 10);

    const openFindings = registries.findings.filter(
      (f) => f.status === 'Open'
    ).length;

    const lines: string[] = [
      '# Governance Report Summary',
      '',
      '## Overview',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Claims | ${totalClaims} |`,
      `| Total Evidence | ${totalEvidence} |`,
      `| Total Products | ${totalProducts} |`,
      `| Total Decisions | ${totalDecisions} |`,
      `| Open Findings | ${openFindings} |`,
      '',
      '## Freshness Overview',
      '',
      `| Category | Count |`,
      `|----------|-------|`,
      `| Fresh (>30 days) | ${freshCount} |`,
      `| Expiring (1-30 days) | ${expiringCount} |`,
      `| Expired (<0 days) | ${expiredCount} |`,
      '',
      '## Top Findings (by severity)',
      '',
      '| ID | Severity | Product | Status | Description |',
      '|----|----------|---------|--------|-------------|',
      ...topFindings.map(
        (f) =>
          `| ${f.id} | ${f.severity} | ${f.product} | ${f.status} | ${f.description} |`
      ),
    ];

    return { content: lines.join('\n') };
  }
}
