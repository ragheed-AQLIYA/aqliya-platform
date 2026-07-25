import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import type { Product, Claim, Evidence, GovernanceRegistries, Source, Authority, KnowledgeArea } from '../types/entities'

// ─── Mocks for dependencies ──────────────────────────────

jest.mock('../shared/hash', () => ({
  hashContent: jest.fn((content: string) => 'mock-sha256-' + String(content.length)),
}))

jest.mock('../shared/date', () => ({
  isExpired: jest.fn(() => false),
  parseDate: jest.fn((str: string) => new Date(str)),
  daysUntilExpiry: jest.fn(() => 30),
  formatDate: jest.fn((d: Date) => '2026-07-21'),
}))

// ─── Fixtures ────────────────────────────────────────────

function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'PROD-AUDITOS',
    name: 'AuditOS',
    nameAr: '\u0623\u0648\u062F\u064A\u062A \u0623\u0648 \u0625\u0633',
    entityType: 'Product',
    knowledgeArea: 'KA-01',
    authority: 'AUTH-AUDIT',
    currentLLevel: 'L4',
    lLevelStatus: 'Verified',
    strategicIntent: 'Approved',
    parentSystem: 'PROD-CORE',
    evidenceStatus: 'Partial',
    manifestStatus: 'Generated',
    dossierStatus: 'Generated',
    lastVerification: '2026-06-01',
    ...overrides,
  }
}

function makeClaim(overrides?: Partial<Claim>): Claim {
  return {
    id: 'CLM-AUDIT-0001',
    version: '1.0.0',
    hash: 'abc123',
    type: 'CR-ST',
    origin: 'spec',
    dimension: 'Implementation Reality',
    claimText: 'The system implements audit trails',
    knowledgeArea: 'KA-01',
    product: 'PROD-AUDITOS',
    authorities: ['AUTH-AUDIT'],
    evidenceRefs: ['EV-0001'],
    confidence: 'High',
    completeness: 90,
    created: '2026-01-15',
    ...overrides,
  }
}

function makeEvidence(overrides?: Partial<Evidence>): Evidence {
  return {
    id: 'EV-0001',
    version: '1.0.0',
    tier: 'T1',
    strength: 'Strong',
    reusable: true,
    description: 'Audit trail module implemented',
    sourceRef: 'SRC-CODE-0001',
    score: 3,
    supportsClaims: ['CLM-AUDIT-0001'],
    freshness: {
      evidenceDate: '2026-01-15',
      commit: 'a1b2c3d4',
      verificationDate: '2026-06-01',
      reviewer: 'reviewer-1',
      expires: '2027-01-15',
    },
    ...overrides,
  }
}

function makeSource(overrides?: Partial<Source>): Source {
  return {
    id: 'SRC-CODE-0001',
    version: '1.0.0',
    type: 'CODE',
    location: 'src/app/audit/',
    description: 'Audit trail implementation',
    producesEvidence: ['EV-0001'],
    containedIn: ['src/app/audit/'],
    ...overrides,
  }
}

function makeAuthority(overrides?: Partial<Authority>): Authority {
  return {
    id: 'AUTH-AUDIT',
    version: '1.0.0',
    knowledgeArea: 'KA-01',
    document: 'AQ-ARCH-001',
    type: 'Authority',
    chainPosition: 1,
    ...overrides,
  }
}

function makeKnowledgeArea(overrides?: Partial<KnowledgeArea>): KnowledgeArea {
  return {
    id: 'KA-01',
    name: 'Audit & Compliance',
    ...overrides,
  }
}

function emptyRegistries(): GovernanceRegistries {
  return {
    products: [], claims: [], evidence: [],
    sources: [], authorities: [], decisions: [],
    reviews: [], findings: [], manifests: [], dossiers: [],
    knowledgeAreas: [], frozen: false,
  }
}

// ─── The SUT ─────────────────────────────────────────────

import { ManifestGenerator } from '../generators/manifest-generator'

// ============================================================
// Manifest Generator Tests
// ============================================================
describe('ManifestGenerator', () => {
  let generator: ManifestGenerator

  beforeEach(() => {
    generator = new ManifestGenerator()
  })

  // ─── 1. Basic Generation ──────────────────────────────

  it('generates a complete manifest with hash', () => {
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim()],
      evidence: [makeEvidence()],
      sources: [makeSource()],
      authorities: [makeAuthority()],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toBeTruthy()
    expect(result.hash).toBeTruthy()
    expect(result.hash).toMatch(/^mock-sha256-\d+$/)
  })

  // ─── 2. Product Identity Section ──────────────────────

  it('includes Product Identity section with correct fields', () => {
    const product = makeProduct({ id: 'PROD-LCOS', name: 'LocalContentOS', currentLLevel: 'L5', lLevelStatus: 'Verified' })
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [product],
      claims: [],
      evidence: [],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-LCOS', registries)

    expect(result.content).toContain('# MANIFEST-PROD-LCOS')
    expect(result.content).toContain('## Product Identity')
    expect(result.content).toContain('| PROD-ID | PROD-LCOS |')
    expect(result.content).toContain('| Name | LocalContentOS |')
    expect(result.content).toContain('| L-Level | L5 (Verified) |')
    expect(result.content).toContain('| Intent | Approved |')
  })

  // ─── 3. Claims Table Section ──────────────────────────

  it('builds claims table with evidence references', () => {
    const claims: Claim[] = [
      makeClaim({ id: 'CLM-AUDIT-0001', type: 'CR-ST', evidenceRefs: ['EV-0001'], confidence: 'High' }),
      makeClaim({ id: 'CLM-AUDIT-0002', type: 'CR-TC', dimension: 'Product Maturity', evidenceRefs: ['EV-0002'], confidence: 'Medium' }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims,
      evidence: [
        makeEvidence({ id: 'EV-0001' }),
        makeEvidence({ id: 'EV-0002' }),
      ],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Aggregated Claims')
    expect(result.content).toContain('| CLM-AUDIT-0001 | CR-ST | Implementation Reality | High | EV-0001 |')
    expect(result.content).toContain('| CLM-AUDIT-0002 | CR-TC | Product Maturity | Medium | EV-0002 |')
  })

  it('builds empty claims table when no claims exist', () => {
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [],
      evidence: [],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Aggregated Claims')
    expect(result.content).toContain('| \u2014 | \u2014 | \u2014 | \u2014 | \u2014 |')
  })

  // ─── 4. Evidence Coverage Section ─────────────────────

  it('shows evidence coverage across tiers', () => {
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', tier: 'T1', score: 3 }),
      makeEvidence({ id: 'EV-0002', tier: 'T2', score: 2 }),
      makeEvidence({ id: 'EV-0003', tier: 'T5', score: 1 }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002', 'EV-0003'] })],
      evidence,
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Evidence Coverage')
    expect(result.content).toContain('| T1 | Product existence and identity | EV-0001 | 3.00 |')
    expect(result.content).toContain('| T2 | Core implementation evidence | EV-0002 | 2.00 |')
    expect(result.content).toContain('| T3 | Integration and interface evidence | \u2014 | 0.00 |')
    expect(result.content).toContain('| T7 | Pilot and production evidence | \u2014 | 0.00 |')
  })

  // ─── 5. Integrity Scores ──────────────────────────────

  it('computes integrity scores across all dimensions', () => {
    const claims: Claim[] = [
      makeClaim({ id: 'CLM-001', evidenceRefs: ['EV-0001'] }),
      makeClaim({ id: 'CLM-002', evidenceRefs: ['EV-0002'] }),
    ]
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', tier: 'T1', score: 3, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0002', tier: 'T2', score: 2, sourceRef: 'SRC-CODE-0002', freshness: { evidenceDate: '2026-02-01', commit: 'b2', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-02-01' } }),
    ]
    const sources: Source[] = [
      makeSource({ id: 'SRC-CODE-0001', containedIn: ['src/'] }),
      makeSource({ id: 'SRC-CODE-0002', containedIn: ['src/'] }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims,
      evidence,
      sources,
      authorities: [makeAuthority()],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Integrity Score')
    expect(result.content).toContain('| Claim Coverage |')
    expect(result.content).toContain('| Evidence Coverage |')
    expect(result.content).toContain('| Authority Coverage |')
    expect(result.content).toContain('| Source Coverage |')
    expect(result.content).toContain('| Freshness |')
    expect(result.content).toContain('| Provenance |')
    expect(result.content).toContain('| Claim Coverage | 1.00 |')
  })

  it('classifies quality as Weak when average is below 0.5', () => {
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim({ evidenceRefs: [] })],
      evidence: [],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('**Quality Classification:** Weak')
  })

  it('classifies quality as Strong when average is 0.8 or above', () => {
    const claims: Claim[] = [
      makeClaim({ id: 'CLM-001', evidenceRefs: ['EV-0001'], authorities: ['AUTH-AUDIT'] }),
    ]
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', tier: 'T1', score: 3, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0002', tier: 'T2', score: 2, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0003', tier: 'T3', score: 2, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0004', tier: 'T4', score: 1, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0005', tier: 'T5', score: 1, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0006', tier: 'T6', score: 1, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
      makeEvidence({ id: 'EV-0007', tier: 'T7', score: 1, sourceRef: 'SRC-CODE-0001', freshness: { evidenceDate: '2026-01-15', commit: 'a1', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-15' } }),
    ]
    const sources: Source[] = [
      makeSource({ id: 'SRC-CODE-0001', containedIn: ['src/'] }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims,
      evidence,
      sources,
      authorities: [makeAuthority()],
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('**Quality Classification:** Strong')
  })

  // ─── 6. Freshness Section ─────────────────────────────

  it('shows freshness metrics with earliest/latest evidence dates', () => {
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', freshness: { evidenceDate: '2026-01-01', commit: 'a', verificationDate: '2026-06-01', reviewer: 'r1', expires: '2027-01-01' } }),
      makeEvidence({ id: 'EV-0002', freshness: { evidenceDate: '2026-06-15', commit: 'b', verificationDate: '2026-06-15', reviewer: 'r2', expires: '2027-06-15' } }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim({ evidenceRefs: ['EV-0001', 'EV-0002'] })],
      evidence,
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Freshness')
    expect(result.content).toContain('| Earliest Evidence | 2026-01-01 |')
    expect(result.content).toContain('| Latest Evidence | 2026-06-15 |')
    expect(result.content).toContain('| Total Evidence | 2 |')
  })

  it('shows dashes when no evidence dates exist', () => {
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', freshness: { evidenceDate: '', commit: '', verificationDate: '', reviewer: '', expires: '2027-01-01' } }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim({ evidenceRefs: ['EV-0001'] })],
      evidence,
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('| Earliest Evidence | \u2014 |')
    expect(result.content).toContain('| Latest Evidence | \u2014 |')
  })

  it('counts expired evidence correctly', () => {
    const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const evidence: Evidence[] = [
      makeEvidence({ id: 'EV-0001', freshness: { evidenceDate: '2026-01-01', commit: 'a', verificationDate: '2026-01-15', reviewer: 'r1', expires: pastDate } }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products: [makeProduct()],
      claims: [makeClaim({ evidenceRefs: ['EV-0001'] })],
      evidence,
      knowledgeAreas: [makeKnowledgeArea()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('| Expired Evidence | 1 |')
  })

  // ─── 7. Dependency Graph ──────────────────────────────

  it('includes dependency graph with parent, siblings, children', () => {
    const products: Product[] = [
      makeProduct({ id: 'PROD-AUDITOS', name: 'AuditOS', parentSystem: 'PROD-CORE' }),
      makeProduct({ id: 'PROD-CORE', name: 'AQLIYA Core', entityType: 'Platform' }),
      makeProduct({ id: 'PROD-LCOS', name: 'LocalContentOS', parentSystem: 'PROD-CORE' }),
    ]
    const registries: GovernanceRegistries = {
      ...emptyRegistries(),
      products,
      claims: [makeClaim()],
      evidence: [makeEvidence()],
      knowledgeAreas: [makeKnowledgeArea()],
      authorities: [makeAuthority()],
      sources: [makeSource()],
    }

    const result = generator.generate('PROD-AUDITOS', registries)

    expect(result.content).toContain('## Dependency Graph')
    expect(result.content).toContain('PROD-AUDITOS')
    expect(result.content).toContain('Parent: PROD-CORE')
    expect(result.content).toContain('Sibling: PROD-LCOS')
    expect(result.content).toContain('KA: KA-01')
  })

  // ─── 8. Error Handling ────────────────────────────────

  it('throws when product is not found in registries', () => {
    const registries = emptyRegistries()

    expect(() => generator.generate('PROD-NONEXISTENT', registries)).toThrow(
      'ManifestGenerator: Product not found \u2014 PROD-NONEXISTENT',
    )
  })
})
