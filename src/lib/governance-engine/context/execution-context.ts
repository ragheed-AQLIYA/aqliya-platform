// Governance Engine — Execution Context
// CR-01: Centralized, immutable, indexed snapshot for Rules, Validators, Generators
// CR-03: Registry is frozen — no mutation after load
// CR-08: Shared indexes computed once, reused everywhere

import { GovernanceRegistries, Claim, Evidence, Product, Decision, Authority, Source } from '../types/entities';

// ─── Index Types ─────────────────────────────────────────────

export interface EntityIndex {
  byId: Map<string, Claim>;
  byProduct: Map<string, Claim[]>;
  byDimension: Map<string, Claim[]>;
  byAuthority: Map<string, Claim[]>;
  withoutEvidence: Claim[];
  completenessStats: { total: number; above80: number; at100: number; avg: number };
}

export interface EvidenceIndex {
  byId: Map<string, Evidence>;
  byProduct: Map<string, Evidence[]>;
  byTier: Map<string, Evidence[]>;
  bySource: Map<string, Evidence[]>;
  orphaned: Evidence[];
  freshnessStats: { total: number; fresh: number; expiring: number; expired: number };
}

export interface ProductIndex {
  byId: Map<string, Product>;
  byType: Map<string, Product[]>;
  byKA: Map<string, Product[]>;
  withoutKA: Product[];
  withoutAUTH: Product[];
  disputed: Product[];
}

export interface DecisionIndex {
  byId: Map<string, Decision>;
  byProduct: Map<string, Decision[]>;
  byType: Map<string, Decision[]>;
  activeMAT: Decision[];
  stale: Decision[];
}

export interface AuthorityIndex {
  byId: Map<string, Authority>;
  byKA: Map<string, Authority[]>;
  chain: Map<string, Authority>; // id → superseding authority
}

export interface SourceIndex {
  byId: Map<string, Source>;
  byType: Map<string, Source[]>;
  byDocument: Map<string, Source[]>;
}

// ─── Chain / Graph ───────────────────────────────────────────

export interface ChainMap {
  byClaim: Map<string, { depth: number; complete: boolean; brokenAt?: string }>;
  complete: number;
  broken: number;
  avgDepth: number;
  maxDepth: number;
  brokenChains: string[];
  longestChain: string[];
  orphanChains: string[];
}

export interface RelationshipGraph {
  adjacency: Map<string, string[]>;  // entityId → [relatedIds]
  claimsToEvidence: Map<string, string[]>;
  evidenceToSource: Map<string, string>;
  claimToProduct: Map<string, string>;
  claimToAuthority: Map<string, string[]>;
}

// ─── Metrics ─────────────────────────────────────────────────

export interface GovernanceMetrics {
  totalClaims: number;
  totalEvidence: number;
  totalProducts: number;
  totalDecisions: number;
  totalAuthorities: number;
  totalSources: number;
  reuseRatio: number;        // shared_ev / total_ev
  evidenceYield: number;     // claims / evidence
  canonicalLeverage: number; // reused_canonical / total_canonical
  avgCompleteness: number;
  avgConfidence: number;     // % High
  integrityScore: number;
  coverageQualityIndex: number;
}

// ─── Execution Context ───────────────────────────────────────

export interface ExecutionContext {
  readonly registries: Readonly<GovernanceRegistries>;
  readonly frozen: true;

  // Indexes (built once, read-only)
  readonly claims: Readonly<EntityIndex>;
  readonly evidence: Readonly<EvidenceIndex>;
  readonly products: Readonly<ProductIndex>;
  readonly decisions: Readonly<DecisionIndex>;
  readonly authorities: Readonly<AuthorityIndex>;
  readonly sources: Readonly<SourceIndex>;

  // Graph / Chains (built once)
  readonly chains: Readonly<ChainMap>;
  readonly graph: Readonly<RelationshipGraph>;

  // Metrics (computed once)
  readonly metrics: Readonly<GovernanceMetrics>;

  // Canonical ordering (sorted once)
  readonly sortedClaimIds: readonly string[];
  readonly sortedEvidenceIds: readonly string[];
  readonly sortedProductIds: readonly string[];
  readonly sortedDecisionIds: readonly string[];
}
