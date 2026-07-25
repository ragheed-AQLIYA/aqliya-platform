import { type Tier } from '../../types/entities';

export const TIERS: Tier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const TIER_EXPECTED: [Tier, string][] = [
  ['T1', 'Product existence and identity'],
  ['T2', 'Core implementation evidence'],
  ['T3', 'Integration and interface evidence'],
  ['T4', 'Test and validation evidence'],
  ['T5', 'Review and governance evidence'],
  ['T6', 'Operational and deployment evidence'],
  ['T7', 'Pilot and production evidence'],
];

export const TIER_DESCRIPTION_MAP = new Map<Tier, string>(TIER_EXPECTED);

export interface IntegrityScores {
  claimCoverage: number;
  evidenceCoverage: number;
  authorityCoverage: number;
  sourceCoverage: number;
  freshness: number;
  provenance: number;
}
