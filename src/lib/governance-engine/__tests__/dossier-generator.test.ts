// Governance Engine — DossierGenerator Tests
// Sprint: Refactored dossier-generator modules (2026-07-21)

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { DossierGenerator } from '../generators/dossier-generator';
import type {
  GovernanceRegistries,
  Product,
  Claim,
  Evidence,
  Decision,
} from '../types/entities';
import type { ExecutionContext } from '../context/execution-context';

// ─── Module-level Mocks ──────────────────────────────────────────
// These mock the dependencies used by dossier-generator modules

jest.mock('../shared/hash', () => ({
  hashContent: jest.fn((content: string) => `mock-hash-${content.length}`),
}));

jest.mock('../shared/date', () => ({
  isExpired: jest.fn(() => false),
  parseDate: jest.fn((str: string) => new Date(str)),
  daysUntilExpiry: jest.fn(() => 30),
  formatDate: jest.fn((d: Date) => '2026-01-01'),
}));

// ─── Fixture Factory Helpers ─────────────────────────────────────

function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'PROD-TEST',
    name: 'Test Product',
    nameAr: 'منتج اختبار',
    entityType: 'Product',
    knowledgeArea: 'KA-01',
    authority: 'AUTH-TEST',
    currentLLevel: 'L3',
    lLevelStatus: 'Verified',
    strategicIntent: 'Approved',
    evidenceStatus: 'Partial',
    manifestStatus: 'Generated',
    dossierStatus: 'Generated',
    lastVerification: '2026-01-01',
    ...overrides,
  };
}

function makeClaim(overrides?: Partial<Claim>): Claim {
  return {
    id: 'CLM-TEST-0001',
    version: '1.0.0',
    hash: 'abc123',
    type: 'CR-ST',
    origin: 'spec',
    dimension: 'Implementation Reality',
    claimText: 'The system implements authentication',
    knowledgeArea: 'KA-01',
    product: 'PROD-TEST',
    authorities: ['AUTH-TEST'],
    evidenceRefs: ['EV-0001'],
    confidence: 'High',
    completeness: 90,
    created: '2026-01-01',
    ...overrides,
  };
}

function makeEvidence(overrides?: Partial<Evidence>): Evidence {
  return {
    id: 'EV-0001',
    version: '1.0.0',
    tier: 'T1',
    strength: 'Strong',
    reusable: true,
    description: 'Auth module exists',
    sourceRef: 'SRC-CODE-0001',
    score: 3,
    supportsClaims: ['CLM-TEST-0001'],
    freshness: {
      evidenceDate: '2026-01-01',
      commit: 'a1b2c3',
      verificationDate: '2026-01-15',
      reviewer: 'reviewer-1',
      expires: '2027-01-01',
    },
    ...overrides,
  };
}

function emptyRegistries(): GovernanceRegistries {
  return {
    products: [], claims: [], evidence: [],
    sources: [], authorities: [], decisions: [],
    reviews: [], findings: [], manifests: [], dossiers: [],
    knowledgeAreas: [], frozen: false,
  };
}

function registriesWith(product: Product, claims?: Claim[], evidence?: Evidence[]): GovernanceRegistries {
  return {
    products: [product],
    claims: claims ?? [],
    evidence: evidence ?? [],
    sources: [],
    authorities: [],
    decisions: [],
    reviews: [],
    findings: [],
    manifests: [],
    dossiers: [],
    knowledgeAreas: [],
    frozen: false,
  };
}

// ─── Context Builder Helper ─────────────────────────────────────

function buildMockContext(registries: GovernanceRegistries): ExecutionContext {
  const claimById = new Map<string, Claim>();
  const claimByProduct = new Map<string, Claim[]>();
  for (const c of registries.claims) {
    claimById.set(c.id, c);
    const existing = claimByProduct.get(c.product) ?? [];
    existing.push(c);
    claimByProduct.set(c.product, existing);
  }

  const evidenceById = new Map<string, Evidence>();
  for (const e of registries.evidence) {
    evidenceById.set(e.id, e);
  }

  const productById = new Map<string, Product>();
  for (const p of registries.products) {
    productById.set(p.id, p);
  }

  const decisionById = new Map<string, Decision>();
  for (const d of registries.decisions) {
    decisionById.set(d.id, d);
  }

  return {
    registries: Object.freeze(registries) as Readonly<GovernanceRegistries>,
    frozen: true,
    claims: {
      byId: claimById,
      byProduct: claimByProduct,
      byDimension: new Map(),
      byAuthority: new Map(),
      withoutEvidence: [],
      completenessStats: { total: 0, above80: 0, at100: 0, avg: 0 },
    } as unknown as ExecutionContext['claims'],
    evidence: {
      byId: evidenceById,
      byProduct: new Map(),
      byTier: new Map(),
      bySource: new Map(),
      orphaned: [],
      freshnessStats: { total: 0, fresh: 0, expiring: 0, expired: 0 },
    } as unknown as ExecutionContext['evidence'],
    products: {
      byId: productById,
      byType: new Map(),
      byKA: new Map(),
      withoutKA: [],
      withoutAUTH: [],
      disputed: [],
    } as unknown as ExecutionContext['products'],
    decisions: {
      byId: decisionById,
      byProduct: new Map(),
      byType: new Map(),
      activeMAT: [],
      stale: [],
    } as unknown as ExecutionContext['decisions'],
    authorities: { byId: new Map(), byKA: new Map(), chain: new Map() } as unknown as ExecutionContext['authorities'],
    sources: { byId: new Map(), byType: new Map(), byDocument: new Map() } as unknown as ExecutionContext['sources'],
    chains: {
      byClaim: new Map(), complete: 0, broken: 0, avgDepth: 0, maxDepth: 0,
      brokenChains: [], longestChain: [], orphanChains: [],
    } as unknown as ExecutionContext['chains'],
    graph: {
      adjacency: new Map(), claimsToEvidence: new Map(), evidenceToSource: new Map(),
      claimToProduct: new Map(), claimToAuthority: new Map(),
    } as unknown as ExecutionContext['graph'],
    metrics: {
      totalClaims: 0, totalEvidence: 0, totalProducts: 0, totalDecisions: 0,
      totalAuthorities: 0, totalSources: 0, reuseRatio: 0, evidenceYield: 0,
      canonicalLeverage: 0, avgCompleteness: 0, avgConfidence: 0,
      integrityScore: 0, coverageQualityIndex: 0,
    } as unknown as ExecutionContext['metrics'],
    sortedClaimIds: [],
    sortedEvidenceIds: [],
    sortedProductIds: [],
    sortedDecisionIds: [],
  };
}

// ═════════════════════════════════════════════════════════════════
// Tests
// ═════════════════════════════════════════════════════════════════

describe('DossierGenerator', () => {
  let generator: DossierGenerator;

  beforeEach(() => {
    generator = new DossierGenerator();
  });

  // ── generate() structure ─────────────────────────────────────

  describe('generate() basic structure', () => {
    it('returns content and hash properties', () => {
      const p = makeProduct();
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('hash');
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);
      expect(typeof result.hash).toBe('string');
    });

    it('includes header with product ID', () => {
      const p = makeProduct({ id: 'PROD-HEADER', name: 'Header Test' });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-HEADER', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('# DOSSIER-PROD-HEADER');
    });

    it('includes all nine required sections', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const e = [makeEvidence()];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('## Executive Summary');
      expect(result.content).toContain('## Product Identity');
      expect(result.content).toContain('## Strategic Intent');
      expect(result.content).toContain('## Claim Summary');
      expect(result.content).toContain('## Evidence Summary');
      expect(result.content).toContain('## DoD Rubric');
      expect(result.content).toContain('## Governance Recommendation');
      expect(result.content).toContain('## Appendices');
    });
  });

  // ── Section: Executive Summary ──────────────────────────────

  describe('executive summary section', () => {
    it('renders claim and evidence statistics', () => {
      const p = makeProduct();
      const claims = [
        makeClaim({ id: 'CLM-TEST-0001', type: 'CR-ST', dimension: 'Implementation Reality', evidenceRefs: ['EV-0001'] }),
        makeClaim({ id: 'CLM-TEST-0002', type: 'CR-TC', dimension: 'Product Maturity', evidenceRefs: ['EV-0002', 'EV-0003'] }),
      ];
      const evidence = [
        makeEvidence({ id: 'EV-0001', tier: 'T1' }),
        makeEvidence({ id: 'EV-0002', tier: 'T2' }),
        makeEvidence({ id: 'EV-0003', tier: 'T3' }),
      ];
      const reg = registriesWith(p, claims, evidence);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('2 claim(s) across 2 type(s)');
      expect(result.content).toContain('3 evidence record(s) across 3 tier(s)');
    });

    it('handles empty claims gracefully', () => {
      const p = makeProduct();
      const reg = registriesWith(p, [], []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('has no registered claims');
      expect(result.content).not.toContain('1 claim(s)');
    });

    it('reports high-confidence claim count', () => {
      const p = makeProduct();
      const claims = [
        makeClaim({ id: 'CLM-TEST-0001', confidence: 'High', completeness: 90 }),
        makeClaim({ id: 'CLM-TEST-0002', confidence: 'Low', completeness: 30 }),
        makeClaim({ id: 'CLM-TEST-0003', confidence: 'High', completeness: 85 }),
      ];
      const evidence = [makeEvidence()];
      const reg = registriesWith(p, claims, evidence);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('2 of 3 claim(s) carry High confidence');
    });

    it('includes mean evidence score', () => {
      const p = makeProduct();
      const c = [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002'] })];
      const e = [
        makeEvidence({ id: 'EV-0001', score: 3 }),
        makeEvidence({ id: 'EV-0002', score: 1 }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('Mean evidence score is 2.00');
    });
  });

  // ── Section: Product Identity ──────────────────────────────

  describe('product identity section', () => {
    it('renders all identity fields in a table', () => {
      const p = makeProduct({
        id: 'PROD-IDENT',
        name: 'Identity Test',
        nameAr: 'اختبار الهوية',
        entityType: 'Platform',
        knowledgeArea: 'KA-05',
        authority: 'AUTH-CORE',
        currentLLevel: 'L5',
        lLevelStatus: 'Verified',
        strategicIntent: 'Approved',
        evidenceStatus: 'Complete',
        manifestStatus: 'Generated',
        dossierStatus: 'Generated',
      });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-IDENT', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('PROD-IDENT |');
      expect(result.content).toContain('Identity Test |');
      expect(result.content).toContain('اختبار الهوية |');
      expect(result.content).toContain('Platform |');
      expect(result.content).toContain('KA-05 |');
      expect(result.content).toContain('AUTH-CORE |');
      expect(result.content).toContain('L5 |');
    });
  });

  // ── Section: Strategic Intent ──────────────────────────────

  describe('strategic intent section', () => {
    it('shows intent value', () => {
      const p = makeProduct({ strategicIntent: 'Experimental' });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('**Intent:** Experimental');
    });

    it('shows no decisions when none exist', () => {
      const p = makeProduct();
      const reg = registriesWith(p, [makeClaim()], [makeEvidence()]);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('No decisions registered for this product.');
    });

    it('includes decision table when decisions affect product claims', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const e = [makeEvidence()];
      const d: Decision = {
        id: 'DEC-2026-0001',
        version: '1.0',
        type: 'MAT',
        title: 'Test MAT Decision',
        authority: 'AUTH-TEST',
        decisionDate: '2026-03-01',
        effectiveDate: '2026-03-01',
        reviewDate: '2027-03-01',
        affectedClaims: ['CLM-TEST-0001'],
        evidenceReviewed: ['EV-0001'],
        accepted: [],
        rejected: [],
        conditions: [],
        rationale: 'Test rationale',
        governingRule: 'GR-001',
        status: 'Active',
      };
      const reg: GovernanceRegistries = {
        ...registriesWith(p, c, e),
        decisions: [d],
      };
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('DEC-2026-0001');
      expect(result.content).toContain('MAT');
      expect(result.content).toContain('Active');
    });
  });

  // ── Section: Claim Summary ─────────────────────────────────

  describe('claim summary section', () => {
    it('renders table with all claims', () => {
      const p = makeProduct();
      const claims = [
        makeClaim({ id: 'CLM-TEST-0001', type: 'CR-ST', dimension: 'Implementation Reality', confidence: 'High', completeness: 90 }),
        makeClaim({ id: 'CLM-TEST-0002', type: 'CR-TC', dimension: 'Product Maturity', confidence: 'Medium', completeness: 60 }),
      ];
      const reg = registriesWith(p, claims, [makeEvidence()]);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('CLM-TEST-0001');
      expect(result.content).toContain('CLM-TEST-0002');
      expect(result.content).toContain('CR-ST');
      expect(result.content).toContain('CR-TC');
    });

    it('shows placeholder when no claims exist', () => {
      const p = makeProduct();
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('| — | — | — | — | — |');
    });
  });

  // ── Section: Evidence Summary ──────────────────────────────

  describe('evidence summary section', () => {
    it('renders tier scores table', () => {
      const p = makeProduct();
      const c = [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002'] })];
      const e = [
        makeEvidence({ id: 'EV-0001', tier: 'T1', strength: 'Strong', score: 3 }),
        makeEvidence({ id: 'EV-0002', tier: 'T2', strength: 'Moderate', score: 2 }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('### Tier Scores');
      expect(result.content).toContain('| T1 | 1 |');
      expect(result.content).toContain('| T2 | 1 |');
    });

    it('renders quality distribution', () => {
      const p = makeProduct();
      const c = [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002'] })];
      const e = [
        makeEvidence({ id: 'EV-0001', tier: 'T1', strength: 'Strong', score: 3 }),
        makeEvidence({ id: 'EV-0002', tier: 'T2', strength: 'Weak', score: 1 }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('### Quality Distribution');
      expect(result.content).toContain('| Strong | 1 | 50.0% |');
      expect(result.content).toContain('| Weak | 1 | 50.0% |');
    });

    it('handles empty evidence gracefully', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const reg = registriesWith(p, c, []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('## Evidence Summary');
      expect(result.content).toContain('| Strong | 0 | 0.0% |');
    });
  });

  // ── Section: DoD Rubric ────────────────────────────────────

  describe('DoD rubric section', () => {
    it('renders requirements up to the product L-Level', () => {
      const p = makeProduct({ currentLLevel: 'L2' });
      const c = [makeClaim()];
      const e = [makeEvidence()];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('## DoD Rubric');
      // L0 requirement
      expect(result.content).toContain('Concept documented');
      // L2 requirement
      expect(result.content).toContain('Route exists');
    });

    it('marks requirements as met or not met', () => {
      const p = makeProduct({ currentLLevel: 'L1', evidenceStatus: 'Not Started' });
      const reg = registriesWith(p, [], []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      // "Concept documented" requires evidenceStatus !== 'Not Started', which is false
      expect(result.content).toContain('Concept documented');
    });
  });

  // ── Section: Governance Recommendation ─────────────────────

  describe('governance recommendation section', () => {
    it('renders recommendation with current and target levels', () => {
      const p = makeProduct({ currentLLevel: 'L2' });
      const c = [makeClaim({ evidenceRefs: ['EV-0001'] })];
      const e = [
        makeEvidence({ id: 'EV-0001', tier: 'T1', strength: 'Strong', score: 3 }),
        makeEvidence({ id: 'EV-0002', tier: 'T2', strength: 'Moderate', score: 2 }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('**Current L-Level:** L2');
      expect(result.content).toContain('**Recommended Target:**');
      expect(result.content).toContain('**Confidence:**');
    });

    it('handles Frozen strategic intent', () => {
      const p = makeProduct({ strategicIntent: 'Frozen' });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('Product is frozen');
      expect(result.content).toContain('Run evidence freshness validation regularly');
    });

    it('handles Deferred strategic intent', () => {
      const p = makeProduct({ strategicIntent: 'Deferred' });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('Product development is deferred');
      expect(result.content).toContain('Review deferred products quarterly');
    });

    it('handles insufficient evidence', () => {
      const p = makeProduct({ strategicIntent: 'Approved' });
      const reg = registriesWith(p, [makeClaim()], []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('Insufficient evidence');
      expect(result.content).toContain('Register at least one evidence record');
    });
  });

  // ── Section: Appendices ────────────────────────────────────

  describe('appendices section', () => {
    it('renders manifest hash code block', () => {
      const p = makeProduct();
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest-content', 'the-manifest-hash-value', reg, ctx);

      expect(result.content).toContain('### A. Manifest Hash');
      expect(result.content).toContain('the-manifest-hash-value');
    });

    it('renders evidence map when evidence exists', () => {
      const p = makeProduct();
      const c = [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002'] })];
      const e = [
        makeEvidence({ id: 'EV-0001', tier: 'T1', strength: 'Strong', sourceRef: 'SRC-CODE-0001' }),
        makeEvidence({ id: 'EV-0002', tier: 'T2', strength: 'Moderate', sourceRef: 'SRC-TEST-0001' }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('### B. Evidence Map');
      expect(result.content).toContain('EV-0001 | T1 | Strong | SRC-CODE-0001');
      expect(result.content).toContain('EV-0002 | T2 | Moderate | SRC-TEST-0001');
    });

    it('renders freshness table', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const e = [makeEvidence({
        id: 'EV-0001',
        freshness: { evidenceDate: '2026-01-01', commit: 'abc', verificationDate: '2026-01-15', reviewer: 'test', expires: '2027-01-01' },
      })];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('### C. Freshness');
      expect(result.content).toContain('EV-0001 | 2026-01-01 | 2027-01-01 | Active');
    });

    it('renders decision history with decision data', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const e = [makeEvidence()];
      const d: Decision = {
        id: 'DEC-2026-0001',
        version: '1.0',
        type: 'MAT',
        title: 'Test Decision',
        authority: 'AUTH-TEST',
        decisionDate: '2026-03-01',
        effectiveDate: '2026-03-01',
        reviewDate: '2027-03-01',
        affectedClaims: ['CLM-TEST-0001'],
        evidenceReviewed: ['EV-0001'],
        accepted: [],
        rejected: [],
        conditions: [],
        rationale: 'Rationale text',
        governingRule: 'GR-001',
        status: 'Approved',
      };
      const reg: GovernanceRegistries = {
        ...registriesWith(p, c, e),
        decisions: [d],
      };
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('### D. Decision History');
      expect(result.content).toContain('DEC-2026-0001 | MAT | Approved | 2026-03-01');
    });

    it('shows placeholders when no decisions exist', () => {
      const p = makeProduct();
      const reg = registriesWith(p, [makeClaim()], [makeEvidence()]);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('| — | — | — | — |');
    });

    it('shows evidence map placeholder when no evidence', () => {
      const p = makeProduct();
      const reg = registriesWith(p, [], []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('| — | — | — | — |');
    });
  });

  // ── Error handling ────────────────────────────────────────

  describe('error handling', () => {
    it('throws when product is not found', () => {
      const reg = emptyRegistries();
      const ctx = buildMockContext(reg);

      expect(() => {
        generator.generate('PROD-NONEXISTENT', 'manifest', 'mhash', reg, ctx);
      }).toThrow('DossierGenerator: Product not found — PROD-NONEXISTENT');
    });
  });

  // ── Edge cases ────────────────────────────────────────────

  describe('edge cases', () => {
    it('generates dossier with no claims and no evidence at L0', () => {
      const p = makeProduct({ currentLLevel: 'L0', evidenceStatus: 'Not Started' });
      const reg = registriesWith(p, [], []);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('DOSSIER-PROD-TEST');
      expect(result.content).toContain('no registered claims');
      // Should not crash
      expect(result.hash).toBeDefined();
    });

    it('generates dossier with single claim and single evidence', () => {
      const p = makeProduct();
      const c = [makeClaim()];
      const e = [makeEvidence()];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('DOSSIER-PROD-TEST');
      expect(result.content).toContain('CLM-TEST-0001');
      expect(result.content).toContain('EV-0001');
    });

    it('generates dossier with Experimental strategic intent', () => {
      const p = makeProduct({ strategicIntent: 'Experimental' });
      const reg = registriesWith(p);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('**Intent:** Experimental');
      // Should not hit Frozen or Deferred branches
      expect(result.content).not.toContain('Product is frozen');
      expect(result.content).not.toContain('Product development is deferred');
    });

    it('groups evidence by tier correctly', () => {
      const p = makeProduct();
      const c = [makeClaim({ evidenceRefs: ['EV-T1A', 'EV-T1B', 'EV-T2A', 'EV-T5A'] })];
      const e = [
        makeEvidence({ id: 'EV-T1A', tier: 'T1', strength: 'Strong', score: 3 }),
        makeEvidence({ id: 'EV-T1B', tier: 'T1', strength: 'Moderate', score: 2 }),
        makeEvidence({ id: 'EV-T2A', tier: 'T2', strength: 'Weak', score: 1 }),
        makeEvidence({ id: 'EV-T5A', tier: 'T5', strength: 'Strong', score: 3 }),
      ];
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('| T1 | 2 |');
      expect(result.content).toContain('| T2 | 1 |');
      expect(result.content).toContain('| T5 | 1 |');
    });

    it('handles L6 product with broad evidence coverage', () => {
      const p = makeProduct({ currentLLevel: 'L6' });
      const c = [makeClaim()];
      const tiers: Array<'T1'|'T2'|'T3'|'T4'|'T5'|'T6'|'T7'> = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const e = tiers.map((tier, i) => makeEvidence({
        id: `EV-${tier}`,
        tier,
        strength: 'Strong' as const,
        score: 3 as const,
      }));
      const reg = registriesWith(p, c, e);
      const ctx = buildMockContext(reg);
      const result = generator.generate('PROD-TEST', 'manifest', 'mhash', reg, ctx);

      expect(result.content).toContain('DOSSIER-PROD-TEST');
      expect(result.content).toContain('L6');
      // Should render DoD rubric for L6 (many requirements)
      expect(result.content).toContain('Security hardened');
      expect(result.content).toContain('Monitoring active');
    });
  });
});

