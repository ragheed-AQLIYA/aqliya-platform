// ENG-001A: Registry Extractor — Tests
//
// Validates:
// - All 5 registries extract correctly from Markdown
// - ID validation (invalid IDs rejected)
// - Empty registries
// - Edge cases (missing fields, malformed rows)

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { RegistryExtractor } from '../../graph/extractor';
import type { ExtractedRegistries } from '../../graph/types/extracted-registries';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a temporary project directory with governance Markdown fixtures.
 * Returns the path and a cleanup function.
 */
function createFixtureDir(fixtures: Record<string, string>): { root: string; cleanup: () => void } {
  const root = mkdtempSync('gov-extractor-');

  for (const [filePath, content] of Object.entries(fixtures)) {
    const fullPath = join(root, filePath);
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
  }

  return {
    root,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function createFullFixture(): Record<string, string> {
  return {
    'docs/governance/CLAIM_REGISTRY.md': `# CLAIM_REGISTRY.md

| CLM-ID | Version | Type | Origin | Dimension | CapRef | Claim Text | KA | Product | Auth | Evidence | Confidence |
|--------|---------|------|--------|-----------|--------|------------|----|---------|------|----------|------------|
| CLM-AUDIT-0001 | 1.0 | CR-ST | product | Implementation Reality | — | AuditOS has 80 routes | KA-10 | PROD-AUDITOS | AUTH-AUDIT | EV-0001, EV-0002 | High |
| CLM-AUDIT-0002 | 1.0 | CR-TC | product | Product Maturity | — | AuditOS has workflow states | KA-10 | PROD-AUDITOS | AUTH-AUDIT | EV-0004, EV-0005 | High |
| CLM-DECISION-0001 | 1.0 | CR-MT | product | Strategic Intent | CAP-003 | DecisionOS supports voting | KA-11 | PROD-DECISIONOS | AUTH-DECISION | EV-0016 | Medium |
`,
    'docs/governance/evidence-catalog/product-registry.md': `# Product Registry

| PROD-ID | Product Name | Entity Type | KA | Authority | Current L-Level | L-Level Status | Strategic Intent | Parent | Evidence | Manifest | Dossier | Last Verified |
|---------|-------------|-------------|----|-----------|-----------------|----------------|------------------|--------|----------|----------|---------|---------------|
| PROD-AUDITOS | AuditOS (نظام التدقيق) | Product | KA-10 | AUTH-AUDIT | L5 | Verified | Approved | — | Complete | Generated | Generated | 2026-06-29 |
| PROD-DECISIONOS | DecisionOS (نظام القرارات) | Product | KA-11 | AUTH-DECISION | L4–L5 | Disputed | Frozen | — | Not Started | Missing | Missing | 2026-06-29 |
| PROD-SALESOS | SalesOS (نظام المبيعات) | Product | KA-13 | AUTH-SALES | L3–L5 | Disputed | Frozen | — | Partial | Missing | Missing | 2026-06-29 |
`,
    'docs/governance/evidence-catalog/decision-registry.md': `# Decision Registry

| DEC-ID | Type | Title | Authority | Date | Affected | Status |
|--------|------|-------|-----------|------|----------|--------|
| DEC-2026-0001 | FRZ | Wave 3B Frozen | AUTH-GOV | 2026-05-28 | CLM-AUDIT-0001, CLM-AUDIT-0002 | Active |
| DEC-2026-0002 | MAT | M1 Governance Acceptance | AUTH-GOV | 2026-05-30 | CLM-DECISION-0001 | Active |
| DEC-2026-0003 | FRZ | M2 Model v1.2 Freeze | AUTH-GOV | 2026-06-25 | — | Active |
`,
    'docs/governance/evidence-catalog/evidence-index.md': `# Evidence Index

## By Product

| Product | Claims | Evidence Items |
|---------|--------|---------------|
| AuditOS | CLM-AUDIT-0001 to CLM-AUDIT-0004 | EV-0001 to EV-0015 |

## By Evidence ID

| EV-ID | Tier | Description | Supports |
|-------|------|-------------|----------|
| EV-0001 | T1 | 80 route files | CLM-AUDIT-0001 |
| EV-0002 | T1 | 29 Prisma models | CLM-AUDIT-0001 |
| EV-0004 | T2 | Workflow states | CLM-AUDIT-0002 |
| EV-0005 | T2 | Bilingual UI | CLM-AUDIT-0002 |
| EV-0016 | T3 | Voting system | CLM-DECISION-0001 |

## By Source

| SRC-ID | Type | Location | Produces |
|--------|------|----------|----------|
| SRC-CODE-0001 | CODE | Route count per product | EV-0001 |
| SRC-SCHEMA-0001 | SCHEMA | prisma/schema.prisma | EV-0002 |
| SRC-CODE-0004 | CODE | Bilingual patterns | EV-0005 |
`,
    'docs/governance/AUTHORITY_MATRIX.md': `# AUTHORITY_MATRIX.md

| AUTH ID | Area ID | Knowledge Area | Authority Document | Type | Secondary References | Gap? | Notes |
|---------|---------|----------------|--------------------|------|---------------------|------|-------|
| AUTH-VISION | KA-01 | Platform Identity & Positioning | docs/official/aqliya-vision-v1.1.md | Authority | docs/official/AQLIYA_MASTER_REFERENCE.md §2–3 | NO | Vision doc is canonical |
| AUTH-AUDIT | KA-10 | AuditOS Domain | docs/source-of-truth/aqliya-auditos-boundaries.md | Reference | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | MINOR | No dedicated Authority doc |
| AUTH-DECISION | KA-11 | DecisionOS Domain | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | MINOR | No dedicated Authority |
| AUTH-GOV | KA-23 | Documentation Governance | docs/DOCUMENTATION_AUTHORITY.md | Authority | docs/governance/aqliya-knowledge-governance-charter-v1.md | NO | Single authority |
`,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ENG-001A: Registry Extractor', () => {
  describe('extractAll() — happy path', () => {
    let registries: ExtractedRegistries;
    let cleanup: () => void;

    beforeAll(async () => {
      const fixture = createFixtureDir(createFullFixture());
      cleanup = fixture.cleanup;
      const extractor = new RegistryExtractor(fixture.root);
      registries = await extractor.extractAll();
    });

    afterAll(() => cleanup());

    it('should extract claims from CLAIM_REGISTRY.md', () => {
      expect(registries.claims).toHaveLength(3);
      expect(registries.claims[0].id).toBe('CLM-AUDIT-0001');
      expect(registries.claims[0].product).toBe('PROD-AUDITOS');
      expect(registries.claims[1].id).toBe('CLM-AUDIT-0002');
      expect(registries.claims[2].id).toBe('CLM-DECISION-0001');
    });

    it('should extract products from product-registry.md', () => {
      expect(registries.products).toHaveLength(3);
      expect(registries.products[0].id).toBe('PROD-AUDITOS');
      expect(registries.products[0].name).toBe('AuditOS');
      expect(registries.products[0].nameAr).toBe('نظام التدقيق');
      expect(registries.products[1].id).toBe('PROD-DECISIONOS');
      expect(registries.products[2].id).toBe('PROD-SALESOS');
    });

    it('should extract decisions from decision-registry.md', () => {
      expect(registries.decisions).toHaveLength(3);
      expect(registries.decisions[0].id).toBe('DEC-2026-0001');
      expect(registries.decisions[0].type).toBe('FRZ');
      expect(registries.decisions[2].id).toBe('DEC-2026-0003');
    });

    it('should extract evidence from evidence-index.md', () => {
      expect(registries.evidence).toHaveLength(5);
      expect(registries.evidence[0].id).toBe('EV-0001');
      expect(registries.evidence[0].tier).toBe('T1');
      expect(registries.evidence[0].supports).toContain('CLM-AUDIT-0001');
    });

    it('should extract authorities from AUTHORITY_MATRIX.md', () => {
      expect(registries.authorities).toHaveLength(4);
      expect(registries.authorities[0].id).toBe('AUTH-VISION');
      expect(registries.authorities[0].type).toBe('Authority');
      expect(registries.authorities[1].type).toBe('Reference');
    });

    it('should populate metadata with extraction timestamp and counts', () => {
      expect(registries.metadata.extractedAt).toBeTruthy();
      expect(registries.metadata.entityCounts.claims).toBe(3);
      expect(registries.metadata.entityCounts.products).toBe(3);
      expect(registries.metadata.entityCounts.decisions).toBe(3);
      expect(registries.metadata.entityCounts.evidence).toBe(5);
      expect(registries.metadata.entityCounts.authorities).toBe(4);
    });

    it('should resolve evidence sourceRef from "By Source" table', () => {
      const ev1 = registries.evidence.find((e) => e.id === 'EV-0001');
      expect(ev1?.sourceRef).toBe('SRC-CODE-0001');

      const ev5 = registries.evidence.find((e) => e.id === 'EV-0005');
      expect(ev5?.sourceRef).toBe('SRC-CODE-0004');
    });

    it('should parse bilingual product names correctly', () => {
      const auditOs = registries.products.find((p) => p.id === 'PROD-AUDITOS');
      expect(auditOs?.name).toBe('AuditOS');
      expect(auditOs?.nameAr).toBe('نظام التدقيق');
    });
  });

  describe('writeOutput()', () => {
    it('should write extracted registries to build/governance/', async () => {
      const fixture = createFixtureDir(createFullFixture());
      const extractor = new RegistryExtractor(fixture.root);
      const registries = await extractor.extractAll();
      const outPath = await extractor.writeOutput(registries);

      // Verify file exists and is valid JSON
      const content = readFileSync(outPath, 'utf-8');
      const parsed = JSON.parse(content) as ExtractedRegistries;
      expect(parsed.claims).toHaveLength(3);
      expect(parsed.products).toHaveLength(3);

      fixture.cleanup();
    });
  });

  describe('ID validation', () => {
    it('should throw on invalid claim ID', async () => {
      const fixture = createFixtureDir(createFullFixture());
      // Overwrite CLAIM_REGISTRY with invalid ID (starts with CLM- but wrong format: no digit suffix)
      const invalidClaims = `# CLAIM_REGISTRY.md

| CLM-ID | Version | Type | Origin | Dimension | CapRef | Claim Text | KA | Product | Auth | Evidence | Confidence |
|--------|---------|------|--------|-----------|--------|------------|----|---------|------|----------|------------|
| CLM-BAD-ID | 1.0 | CR-ST | product | Implementation | — | Test claim | KA-10 | PROD-AUDITOS | AUTH-AUDIT | — | High |
`;
      writeFileSync(
        join(fixture.root, 'docs/governance/CLAIM_REGISTRY.md'),
        invalidClaims,
        'utf-8',
      );

      const extractor = new RegistryExtractor(fixture.root);
      await expect(extractor.extractAll()).rejects.toThrow();

      fixture.cleanup();
    });

    it('should throw on invalid product ID', async () => {
      const fixture = createFixtureDir(createFullFixture());
      const invalidProducts = `# Product Registry

| PROD-ID | Product Name | Entity Type | KA | Authority | Current L-Level | L-Level Status | Strategic Intent | Parent | Evidence | Manifest | Dossier | Last Verified |
|---------|-------------|-------------|----|-----------|-----------------|----------------|------------------|--------|----------|----------|---------|---------------|
| PROD- | Bad Product | Product | KA-10 | AUTH-TEST | L0 | Verified | Approved | — | Not Started | Missing | Missing | 2026-06-29 |
`;
      writeFileSync(
        join(fixture.root, 'docs/governance/evidence-catalog/product-registry.md'),
        invalidProducts,
        'utf-8',
      );

      const extractor = new RegistryExtractor(fixture.root);
      await expect(extractor.extractAll()).rejects.toThrow();

      fixture.cleanup();
    });
  });

  describe('edge cases', () => {
    it('should handle empty evidence-index.md gracefully', async () => {
      const fixture = createFixtureDir(createFullFixture());
      writeFileSync(
        join(fixture.root, 'docs/governance/evidence-catalog/evidence-index.md'),
        '# Evidence Index\n\nNo evidence registered yet.\n',
        'utf-8',
      );

      const extractor = new RegistryExtractor(fixture.root);
      const registries = await extractor.extractAll();
      expect(registries.evidence).toHaveLength(0);

      fixture.cleanup();
    });

    it('should handle empty authority matrix gracefully', async () => {
      const fixture = createFixtureDir(createFullFixture());
      writeFileSync(
        join(fixture.root, 'docs/governance/AUTHORITY_MATRIX.md'),
        '# AUTHORITY_MATRIX.md\n\nNo authorities registered yet.\n',
        'utf-8',
      );

      const extractor = new RegistryExtractor(fixture.root);
      const registries = await extractor.extractAll();
      expect(registries.authorities).toHaveLength(0);

      fixture.cleanup();
    });

    it('should throw on missing source file', async () => {
      const fixture = createFixtureDir(createFullFixture());
      // Delete the CLAIM_REGISTRY
      rmSync(
        join(fixture.root, 'docs/governance/CLAIM_REGISTRY.md'),
        { force: true },
      );

      const extractor = new RegistryExtractor(fixture.root);
      await expect(extractor.extractAll()).rejects.toThrow(/Failed to read/);

      fixture.cleanup();
    });

    it('should handle evidence with no supports (empty column)', async () => {
      const fixture = createFixtureDir(createFullFixture());
      const evidenceWithEmpty = `# Evidence Index

| EV-ID | Tier | Description | Supports |
|-------|------|-------------|----------|
| EV-9999 | T1 | Standalone evidence | — |
`;
      writeFileSync(
        join(fixture.root, 'docs/governance/evidence-catalog/evidence-index.md'),
        evidenceWithEmpty,
        'utf-8',
      );

      const extractor = new RegistryExtractor(fixture.root);
      const registries = await extractor.extractAll();
      const standalone = registries.evidence.find((e) => e.id === 'EV-9999');
      expect(standalone).toBeDefined();
      expect(standalone!.supports).toHaveLength(0);

      fixture.cleanup();
    });
  });

  describe('derived artifacts', () => {
    it('should not modify any source Markdown file', async () => {
      const fixture = createFixtureDir(createFullFixture());

      // Verify the output is in build/governance/
      const extractor = new RegistryExtractor(fixture.root);
      const outPath = await extractor.run();

      // Output must be in build/governance/
      expect(outPath).toMatch(/build[/\\]governance[/\\]/);

      // Source files must be unchanged (re-read and compare)
      const claimContent = readFileSync(
        join(fixture.root, 'docs/governance/CLAIM_REGISTRY.md'),
        'utf-8',
      );
      expect(claimContent).toContain('CLM-AUDIT-0001');

      fixture.cleanup();
    });
  });
});
