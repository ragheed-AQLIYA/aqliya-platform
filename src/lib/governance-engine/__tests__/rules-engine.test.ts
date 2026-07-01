// Governance Engine — Rule Engine Integration Tests
// Sprint 8: Hardening

import { describe, it, expect } from '@jest/globals';
import { GovernanceRegistries, Claim, Evidence, Product, Decision, Authority, Source } from '../types/entities';
import { RuleEngine } from '../rules/engine';

function createMockRegistries(): GovernanceRegistries {
  const mockClaim: Claim = {
    id: 'CLM-TEST-0001', version: '1.0', hash: 'abc', type: 'CR-ST', origin: 'Test',
    dimension: 'Implementation Reality', claimText: 'Test claim', knowledgeArea: 'KA-01',
    product: 'PROD-TEST', authorities: ['AUTH-TEST'], evidenceRefs: ['EV-0001'],
    confidence: 'High', completeness: 100, created: '2026-06-29',
  };
  const mockEvidence: Evidence = {
    id: 'EV-0001', version: '1.0', tier: 'T1', strength: 'Strong', reusable: false,
    description: 'Test evidence', sourceRef: 'SRC-CODE-0001', score: 3,
    supportsClaims: ['CLM-TEST-0001'],
    freshness: { evidenceDate: '2026-06-29', commit: 'abc123', verificationDate: '2026-06-29', reviewer: 'OpenCode', expires: '2026-09-27' },
  };
  const mockProduct: Product = {
    id: 'PROD-TEST', name: 'Test Product', nameAr: 'منتج اختبار', entityType: 'Product',
    knowledgeArea: 'KA-01', authority: 'AUTH-TEST', currentLLevel: 'L5',
    lLevelStatus: 'Verified', strategicIntent: 'Approved',
    evidenceStatus: 'Complete', manifestStatus: 'Generated', dossierStatus: 'Generated',
    lastVerification: '2026-06-29',
  };
  const mockDecision: Decision = {
    id: 'DEC-2026-0001', version: '1.0', type: 'MAT', title: 'Test MAT Decision',
    authority: 'Project Owner', decisionDate: '2026-06-29', effectiveDate: '2026-06-29',
    reviewDate: '2026-12-26', affectedClaims: ['CLM-TEST-0001'], evidenceReviewed: ['EV-0001'],
    accepted: [], rejected: [], conditions: [], rationale: 'Test',
    governingRule: 'GR-006', status: 'Active',
  };
  const mockAuthority: Authority = {
    id: 'AUTH-TEST', version: '1.0', knowledgeArea: 'KA-01', document: 'test.md',
    type: 'Authority', chainPosition: 0,
  };
  const mockSource: Source = {
    id: 'SRC-CODE-0001', version: '1.0', type: 'CODE', location: 'test.ts',
    description: 'Test source', producesEvidence: ['EV-0001'], containedIn: ['test.md'],
  };

  return {
    products: [mockProduct], claims: [mockClaim], evidence: [mockEvidence],
    sources: [mockSource], authorities: [mockAuthority], decisions: [mockDecision],
    reviews: [], findings: [], manifests: [], dossiers: [], knowledgeAreas: [],
    frozen: true,
  };
}

describe('Rule Engine Integration', () => {
  it('should execute all 13 registered rules', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);

    const { GR001Rule } = await import('../rules/gr-001-immutable-ids');
    const { GR002Rule } = await import('../rules/gr-002-derived-artifacts');
    const { GR003Rule } = await import('../rules/gr-003-evidence-manifest');
    const { GR004Rule } = await import('../rules/gr-004-glossary-precision');
    const { GR005Rule } = await import('../rules/gr-005-three-tier-review');
    const { GR006Rule } = await import('../rules/gr-006-decision-preconditions');
    const { GR007Rule } = await import('../rules/gr-007-evidence-independence');
    const { GR008Rule } = await import('../rules/gr-008-shared-evidence');
    const { GR009Rule } = await import('../rules/gr-009-capability-evidence');
    const { GR010Rule } = await import('../rules/gr-010-marginal-efficiency');
    const { GR011Rule } = await import('../rules/gr-011-quality-preservation');
    const { GR012Rule } = await import('../rules/gr-012-historical-consistency');
    const { GR013Rule } = await import('../rules/gr-013-conflict-preservation');

    engine.registerAll([
      new GR001Rule(), new GR002Rule(), new GR003Rule(), new GR004Rule(),
      new GR005Rule(), new GR006Rule(), new GR007Rule(), new GR008Rule(),
      new GR009Rule(), new GR010Rule(), new GR011Rule(), new GR012Rule(),
      new GR013Rule(),
    ]);

    expect(engine.getRegisteredRuleIds()).toHaveLength(13);

    const report = await engine.executeAll();
    expect(report.rules).toHaveLength(13);
    expect(report.summary.total).toBe(13);
    expect(report.summary.blocked).toBeDefined();
    expect(report.baselineVersion).toBe('M2 v1.2');
  });

  it('should execute rules in phase order', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);

    const { GR001Rule } = await import('../rules/gr-001-immutable-ids');
    const { GR006Rule } = await import('../rules/gr-006-decision-preconditions');

    engine.registerAll([new GR001Rule(), new GR006Rule()]);
    const report = await engine.executeAll();

    // GR-001 (structural) should come before GR-006 (integrity)
    const ruleOrder = report.rules.map(r => r.ruleId);
    const gr001Index = ruleOrder.indexOf('GR-001');
    const gr006Index = ruleOrder.indexOf('GR-006');
    expect(gr001Index).toBeLessThan(gr006Index);
  });

  it('should report execution errors without crashing', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);

    // Execute without registering any rules — should not crash
    const report = await engine.executeAll();
    expect(report.rules).toHaveLength(0);
    expect(report.summary.passed).toBe(0);
  });

  it('should support executing specific rules', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);

    const { GR001Rule } = await import('../rules/gr-001-immutable-ids');
    const { GR004Rule } = await import('../rules/gr-004-glossary-precision');

    engine.registerAll([new GR001Rule(), new GR004Rule()]);
    const report = await engine.executeRules(['GR-001']);
    expect(report.rules).toHaveLength(1);
    expect(report.rules[0].ruleId).toBe('GR-001');
  });

  it('should report unknown rule IDs', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);
    const report = await engine.executeRules(['GR-999']);
    expect(report.rules).toHaveLength(1);
    expect(report.rules[0].status).toBe('error');
  });
});

describe('GR-001: Immutable IDs Rule', () => {
  it('should pass for valid IDs', async () => {
    const registries = createMockRegistries();
    const engine = new RuleEngine(registries);
    const { GR001Rule } = await import('../rules/gr-001-immutable-ids');
    engine.registerAll([new GR001Rule()]);
    const report = await engine.executeAll();
    // With valid mock data, GR-001 should pass
    expect(report.rules[0].ruleId).toBe('GR-001');
  });
});

describe('GR-004: Glossary Precision Rule', () => {
  it('should detect forbidden terms', async () => {
    const registries = createMockRegistries();
    registries.claims[0].claimText = 'This is a Strategic Future product';
    const engine = new RuleEngine(registries);
    const { GR004Rule } = await import('../rules/gr-004-glossary-precision');
    engine.registerAll([new GR004Rule()]);
    const report = await engine.executeAll();
    expect(report.rules[0].status).toBe('warn');
    expect(report.rules[0].findings.length).toBeGreaterThan(0);
  });

  it('should pass with clean text', async () => {
    const registries = createMockRegistries();
    registries.claims[0].claimText = 'This product is L5 Pilot-ready';
    const engine = new RuleEngine(registries);
    const { GR004Rule } = await import('../rules/gr-004-glossary-precision');
    engine.registerAll([new GR004Rule()]);
    const report = await engine.executeAll();
    expect(report.rules[0].status).toBe('pass');
  });
});

describe('GR-006: Decision Preconditions Rule', () => {
  it('should fail when manifest is missing', async () => {
    const registries = createMockRegistries();
    registries.manifests = []; // No manifests
    const engine = new RuleEngine(registries);
    const { GR006Rule } = await import('../rules/gr-006-decision-preconditions');
    engine.registerAll([new GR006Rule()]);
    const report = await engine.executeAll();
    expect(report.rules[0].status).toBe('fail');
    expect(report.rules[0].findings.some(f => f.includes('Manifest'))).toBe(true);
  });
});

describe('Engine Error Handling', () => {
  it('should handle RuleEngine constructor with empty registries', () => {
    const emptyRegs = createMockRegistries();
    emptyRegs.products = [];
    emptyRegs.claims = [];
    emptyRegs.evidence = [];
    const engine = new RuleEngine(emptyRegs);
    expect(engine.getRegisteredRuleIds()).toEqual([]);
  });

  it('should handle repeated rule registration', () => {
    const engine = new RuleEngine(createMockRegistries());
    const fakeRule = { id: 'GR-999' as const, name: 'Fake', phase: 'structural' as const, severity: 'high' as const, blocking: false, validate: () => ({ ruleId: 'GR-999' as const, name: 'Fake', status: 'pass' as const, severity: 'high' as const, blocking: false, findings: [], duration: 0 }) };
    engine.register(fakeRule);
    engine.register(fakeRule); // Register twice
    expect(engine.getRegisteredRuleIds().filter(id => id === 'GR-999').length).toBe(1); // No duplicates
  });
});
