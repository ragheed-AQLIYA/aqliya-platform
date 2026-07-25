import { type Evidence, type Tier } from '../../types/entities';
import { TIERS, TIER_DESCRIPTION_MAP } from './common';

function groupEvidenceByTier(evidence: Evidence[]): Map<Tier, Evidence[]> {
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

export function buildEvidenceCoverageTable(evidence: Evidence[]): string {
  const lines: string[] = [];
  lines.push('## Evidence Coverage');
  lines.push('');
  lines.push('| Tier | Description | Evidence IDs | Score |');
  lines.push('|------|-------------|-------------|-------|');

  const tierMap = groupEvidenceByTier(evidence);

  for (const tier of TIERS) {
    const evs = tierMap.get(tier) ?? [];
    const ids = evs.map((e) => e.id).sort();
    const avgScore = evs.length > 0
      ? evs.reduce((sum, e) => sum + e.score, 0) / evs.length
      : 0;
    const formattedScore = avgScore.toFixed(2);
    const idStr = ids.length > 0 ? ids.join(', ') : '—';
    lines.push(`| ${tier} | ${TIER_DESCRIPTION_MAP.get(tier) ?? ''} | ${idStr} | ${formattedScore} |`);
  }

  return lines.join('\n');
}
