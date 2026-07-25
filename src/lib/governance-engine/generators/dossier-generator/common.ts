import { type Tier, type LLevel, type Evidence } from '../../types/entities';

export const TIERS: Tier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const LLEVEL_ORDER: LLevel[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

export const DOD_REQS_MAP = new Map<LLevel, string[]>([
  ['L0', ['Concept documented']],
  ['L1', ['Marketing page exists', 'Public copy written']],
  ['L2', ['Route exists', 'Workspace scaffolded']],
  ['L3', ['UI with mock data', 'Limited persistence']],
  ['L4', ['Real workflow', 'Persistence layer', 'Basic governance', 'QA validation']],
  ['L5', ['Evidence collection', 'Review workflow', 'Approval gates', 'Exports implemented', 'Audit trail active', 'Realistic seed data']],
  ['L6', ['Security hardened', 'Monitoring active', 'Backups configured', 'Deployment automated', 'Full operational readiness']],
]);

export function levelAtIndex(index: number): LLevel {
  const slice = LLEVEL_ORDER.slice(index, index + 1);
  if (slice.length === 1) return slice[0];
  return 'L0';
}

export function countTiers(evidence: Evidence[]): number {
  const tiers = new Set(evidence.map((e) => e.tier));
  return tiers.size;
}
