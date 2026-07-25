import { type Evidence } from '../../types/entities';

function formatDateForContent(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildFreshnessSection(evidence: Evidence[]): string {
  const lines: string[] = [];
  lines.push('## Freshness');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');

  const dates = evidence
    .map((ev) => ev.freshness?.evidenceDate)
    .filter((d): d is string => !!d)
    .sort();

  if (dates.length > 0) {
    lines.push(`| Earliest Evidence | ${dates[0]} |`);
    lines.push(`| Latest Evidence | ${dates[dates.length - 1]} |`);
  } else {
    lines.push('| Earliest Evidence | — |');
    lines.push('| Latest Evidence | — |');
  }

  const now = new Date();
  let expiredCount = 0;
  let expiringCount = 0;
  for (const ev of evidence) {
    if (ev.freshness?.expires) {
      const expiry = new Date(ev.freshness.expires);
      if (now >= expiry) {
        expiredCount++;
      } else {
        const diff = expiry.getTime() - now.getTime();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
          expiringCount++;
        }
      }
    }
  }

  lines.push(`| Expired Evidence | ${expiredCount} |`);
  lines.push(`| Expiring (≤30d) | ${expiringCount} |`);
  lines.push(`| Total Evidence | ${evidence.length} |`);

  lines.push('');
  lines.push(`**Generated:** ${formatDateForContent(now)}`);

  return lines.join('\n');
}
