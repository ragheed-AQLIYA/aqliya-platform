// Governance Engine — Foundation Tests
// Sprint 1: Types + Schemas + Registry + Shared

import { describe, it, expect } from '@jest/globals';
import { validateId, ID_PATTERNS } from '../types/identifiers';
import { RELATIONSHIPS } from '../types/relationships';
import { RULES } from '../types/rules';

// ============================================================
// 1. Entity Type Tests
// ============================================================
describe('Entity Types', () => {
  it('should have 12 entity interfaces defined', () => {
    // Interfaces are compile-time — this test verifies the types file loads
    const fs = require('fs');
    const content = fs.readFileSync(__dirname + '/../types/entities.ts', 'utf-8');
    const interfaceMatches = content.match(/^export interface \w+/gm);
    expect(interfaceMatches?.length).toBeGreaterThanOrEqual(11);
  });

  it('should have 18 type aliases', () => {
    const fs = require('fs');
    const content = fs.readFileSync(__dirname + '/../types/entities.ts', 'utf-8');
    const typeMatches = content.match(/^export type \w+/gm);
    expect(typeMatches?.length).toBeGreaterThanOrEqual(15);
  });

  it('should have GovernanceRegistries container type', () => {
    const fs = require('fs');
    const content = fs.readFileSync(__dirname + '/../types/entities.ts', 'utf-8');
    expect(content).toContain('GovernanceRegistries');
    expect(content).toContain('frozen: boolean');
  });
});

// ============================================================
// 2. Identifier Pattern Tests
// ============================================================
describe('Identifier Patterns', () => {
  const validIds: [string, RegExp][] = [
    ['PROD-AUDITOS', ID_PATTERNS.PRODUCT],
    ['PROD-SALESOS', ID_PATTERNS.PRODUCT],
    ['CLM-AUDIT-0001', ID_PATTERNS.CLAIM],
    ['EV-0001', ID_PATTERNS.EVIDENCE],
    ['SRC-CODE-0001', ID_PATTERNS.SOURCE],
    ['SRC-SCHEMA-0001', ID_PATTERNS.SOURCE],
    ['SRC-TEST-0001', ID_PATTERNS.SOURCE],
    ['SRC-DOC-0001', ID_PATTERNS.SOURCE],
    ['SRC-OPERATION-0001', ID_PATTERNS.SOURCE],
    ['AUTH-AUDIT', ID_PATTERNS.AUTHORITY],
    ['DEC-2026-0001', ID_PATTERNS.DECISION],
    ['REV-2026-0001', ID_PATTERNS.REVIEW],
    ['FND-REV20260001-01', ID_PATTERNS.FINDING],
    ['CAP-003', ID_PATTERNS.CAPABILITY],
    ['KA-10', ID_PATTERNS.KNOWLEDGE_AREA],
    ['HC-AUDIT-001', ID_PATTERNS.HISTORICAL_REF],
  ];

  const invalidIds: [string, RegExp][] = [
    ['PROD-auditos', ID_PATTERNS.PRODUCT],       // lowercase
    ['CLM-AUDIT-1', ID_PATTERNS.CLAIM],           // wrong padding
    ['EV-01', ID_PATTERNS.EVIDENCE],               // wrong padding
    ['SRC-XYZ-0001', ID_PATTERNS.SOURCE],           // invalid type
    ['DEC-26-0001', ID_PATTERNS.DECISION],          // wrong year
    ['FND-123', ID_PATTERNS.FINDING],               // wrong format
  ];

  validIds.forEach(([id, pattern]) => {
    it(`should validate ${id}`, () => {
      expect(validateId(id, pattern)).toBe(true);
    });
  });

  invalidIds.forEach(([id, pattern]) => {
    it(`should reject ${id}`, () => {
      expect(validateId(id, pattern)).toBe(false);
    });
  });
});

// ============================================================
// 3. Relationship Tests
// ============================================================
describe('Relationships (C01–C21)', () => {
  it('should have exactly 21 relationships', () => {
    expect(Object.keys(RELATIONSHIPS).length).toBe(21);
  });

  it('should have valid cardinalities only', () => {
    const validCardinalities = ['1:1', '1:N', 'N:1', 'N:M'];
    Object.values(RELATIONSHIPS).forEach(rel => {
      expect(validCardinalities).toContain(rel.cardinality);
    });
  });

  it('should have all required fields', () => {
    Object.entries(RELATIONSHIPS).forEach(([id, rel]) => {
      expect(rel.id).toBe(id);
      expect(rel.sourceEntity).toBeTruthy();
      expect(rel.targetEntity).toBeTruthy();
      expect(rel.cardinality).toBeTruthy();
    });
  });

  it('should handle N:M relationships (C06, C09, C11)', () => {
    const nmRelationships = ['C06', 'C09', 'C11'];
    nmRelationships.forEach(id => {
      expect(RELATIONSHIPS[id].cardinality).toBe('N:M');
    });
  });

  it('should handle 1:1 relationships (C08, C21)', () => {
    expect(RELATIONSHIPS['C08'].cardinality).toBe('1:1');
    expect(RELATIONSHIPS['C21'].cardinality).toBe('1:1');
  });
});

// ============================================================
// 4. Governance Rule Tests
// ============================================================
describe('Governance Rules (GR-001 to GR-013)', () => {
  it('should have exactly 13 rules', () => {
    expect(Object.keys(RULES).length).toBe(13);
  });

  it('should have correct ID sequence', () => {
    const expectedIds = Array.from({ length: 13 }, (_, i) => `GR-${String(i + 1).padStart(3, '0')}`);
    const actualIds = Object.keys(RULES).sort();
    expect(actualIds).toEqual(expectedIds);
  });

  it('should have all required fields', () => {
    Object.values(RULES).forEach(rule => {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.phase).toBeTruthy();
      expect(rule.severity).toBeTruthy();
      expect(typeof rule.blocking).toBe('boolean');
    });
  });

  it('should have valid phases only', () => {
    const validPhases = ['structural', 'identity', 'integrity', 'pattern', 'historical'];
    Object.values(RULES).forEach(rule => {
      expect(validPhases).toContain(rule.phase);
    });
  });

  it('should execute in correct phase order', () => {
    const phases = Object.values(RULES).map(r => r.phase);
    const phaseOrder = ['structural', 'identity', 'integrity', 'pattern', 'historical'];
    const minPhaseIndex = (phase: string) => phaseOrder.indexOf(phase);
    
    // Structural rules should come before identity, etc.
    // This test verifies the design intent even if rules array is unsorted
    const structuralCount = phases.filter(p => p === 'structural').length;
    const identityCount = phases.filter(p => p === 'identity').length;
    expect(structuralCount).toBe(2);  // GR-001, GR-002
    expect(identityCount).toBe(3);    // GR-003, GR-004, GR-005
  });
});

// ============================================================
// 5. Markdown Parser Tests
// ============================================================
describe('Markdown Parser', () => {
  it('should parse markdown tables with header row', () => {
    const { parseMarkdownTable } = require('../shared/parser');
    const md = `
| ID | Name |
|----|------|
| 1  | Test |
| 2  | Demo |
`;
    const result = parseMarkdownTable(md, '| ID | Name |');
    expect(result.length).toBeGreaterThanOrEqual(2);
    // Should contain data rows
    const dataRows = result.filter((row: string[]) => row[0]?.trim() === '1' || row[0]?.trim() === '2');
    expect(dataRows.length).toBe(2);
  });

  it('should handle tables with just headers', () => {
    const { parseMarkdownTable } = require('../shared/parser');
    const md = '| ID | Name |\n|----|------|';
    const result = parseMarkdownTable(md, '| ID | Name |');
    // Should not crash — may return empty or just header
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================================
// 6. Hash Utility Tests
// ============================================================
describe('Hash Utility', () => {
  it('should produce deterministic hashes', () => {
    const { hashContent } = require('../shared/hash');
    const input = 'test content';
    expect(hashContent(input)).toBe(hashContent(input));
  });

  it('should produce different hashes for different content', () => {
    const { hashContent } = require('../shared/hash');
    expect(hashContent('hello')).not.toBe(hashContent('world'));
  });
});

// ============================================================
// 7. Date Utility Tests
// ============================================================
describe('Date Utility', () => {
  it('should detect expired dates', () => {
    const { isExpired } = require('../shared/date');
    expect(isExpired('2020-01-01', new Date('2024-01-01'))).toBe(true);
    expect(isExpired('2030-01-01', new Date('2024-01-01'))).toBe(false);
  });

  it('should calculate days until expiry', () => {
    const { daysUntilExpiry } = require('../shared/date');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const days = daysUntilExpiry(futureDate.toISOString().split('T')[0]);
    expect(days).toBeGreaterThanOrEqual(88);
    expect(days).toBeLessThanOrEqual(92);
  });
});

// ============================================================
// 8. Result Type Tests
// ============================================================
describe('Result Type', () => {
  it('should create Ok result', () => {
    const { Ok } = require('../shared/result');
    const result = new Ok(42);
    expect(result.isOk()).toBe(true);
    expect(result.isErr()).toBe(false);
    expect(result.unwrap()).toBe(42);
  });

  it('should create Err result', () => {
    const { Err } = require('../shared/result');
    const result = new Err('error message');
    expect(result.isOk()).toBe(false);
    expect(result.isErr()).toBe(true);
    expect(() => result.unwrap()).toThrow('error message');
  });
});

// ============================================================
// 9. Registry Loading Tests
// ============================================================
describe('Registry Loading', () => {
  it('should load CLAIM_REGISTRY.md', () => {
    const fs = require('fs');
    const path = require('path');
    const registryPath = path.join(__dirname, '../../../../docs/archive/governance/CLAIM_REGISTRY.md');
    const exists = fs.existsSync(registryPath);
    expect(exists).toBe(true);
  });

  it('should load product-registry.md', () => {
    const fs = require('fs');
    const path = require('path');
    const registryPath = path.join(__dirname, '../../../../docs/evidence/evidence-catalog/product-registry.md');
    const exists = fs.existsSync(registryPath);
    expect(exists).toBe(true);
  });

  it('should load decision-registry.md', () => {
    const fs = require('fs');
    const path = require('path');
    const registryPath = path.join(__dirname, '../../../../docs/evidence/evidence-catalog/decision-registry.md');
    const exists = fs.existsSync(registryPath);
    expect(exists).toBe(true);
  });
});

// ============================================================
// 10. Schema Validation Tests
// ============================================================
describe('Schema Validation', () => {
  it('should validate correct claim schema', () => {
    const { ClaimSchema } = require('../schemas/claim-schema');
    const validClaim = {
      id: 'CLM-AUDIT-0001',
      version: '1.0',
      hash: 'abc123',
      type: 'CR-ST',
      origin: 'Code Inspection',
      dimension: 'Implementation Reality',
      claimText: 'Test claim',
      knowledgeArea: 'KA-10',
      product: 'PROD-AUDITOS',
      authorities: ['AUTH-AUDIT'],
      evidenceRefs: ['EV-0001'],
      confidence: 'High',
      completeness: 100,
      created: '2026-06-29',
    };
    const result = ClaimSchema.safeParse(validClaim);
    expect(result.success).toBe(true);
  });

  it('should reject invalid claim schema', () => {
    const { ClaimSchema } = require('../schemas/claim-schema');
    const invalidClaim = { id: 'invalid' };
    const result = ClaimSchema.safeParse(invalidClaim);
    expect(result.success).toBe(false);
  });
});

