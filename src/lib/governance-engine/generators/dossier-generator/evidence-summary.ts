import { type Tier, type Evidence } from '../../types/entities';
import { TIERS } from './common';

export function buildEvidenceSummary(evidence: Evidence[]): string {
  const lines: string[] = [];
  lines.push('## Evidence Summary');
  lines.push('');

  const tierMap = groupEvidenceByTier(evidence);

  lines.push('### Tier Scores');
  lines.push('');
  lines.push('| Tier | Count | Average Score | Strength Distribution |');
  lines.push('|------|-------|--------------|----------------------|');

  for (const tier of TIERS) {
    const evs = tierMap.get(tier) ?? [];
    const count = evs.length;
    const avgScore = count > 0
      ? (evs.reduce((s, e) => s + e.score, 0) / count).toFixed(2)
      : '0.00';

    const strong = evs.filter((e) => e.strength === 'Strong').length;
    const moderate = evs.filter((e) => e.strength === 'Moderate').length;
    const weak = evs.filter((e) => e.strength === 'Weak').length;

    const dist = `${strong}S/${moderate}M/${weak}W`;
    lines.push(`| ${tier} | ${count} | ${avgScore} | ${dist} |`);
  }

  lines.push('');
  lines.push('### Quality Distribution');
  lines.push('');

  const allQualities = evidence.map((e) => e.strength);
  const strong = allQualities.filter((q) => q === 'Strong').length;
  const moderate = allQualities.filter((q) => q === 'Moderate').length;
  const weak = allQualities.filter((q) => q === 'Weak').length;

  lines.push('| Quality | Count | Percentage |');
  lines.push('|---------|-------|------------|');
  const total = evidence.length || 1;
  lines.push(`| Strong | ${strong} | ${((strong / total) * 100).toFixed(1)}% |`);
  lines.push(`| Moderate | ${moderate} | ${((moderate / total) * 100).toFixed(1)}% |`);
  lines.push(`| Weak | ${weak} | ${((weak / total) * 100).toFixed(1)}% |`);

  return lines.join('\n');
}

export function groupEvidenceByTier(evidence: Evidence[]): Map<Tier, Evidence[]> {
  const map = new Map<Tier, Evidence[]>();
  for (const tier of TIERS) {
    map.set(tier, []);
  }
  for (const ev of evidence) {
    const group = map.get(ev.tier);
    if (group) {
      group.push(ev);
    }
  }
  return map;
}
