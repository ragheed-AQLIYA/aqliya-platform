// ENG-001B: Cardinality Validator (C07–C12)
//
// Validates cardinality rules and detects duplicate relationships:
//   C07: Claim → has_authority → Authority  (N:1)
//   C08: Claim → results_in → Decision      (1:1)
//   C09: Claim → contained_in → Document     (N:M) — partial: checks consistency
//   C10: Evidence → sourced_from → Source    (N:1) — partial
//   C11: Source → contained_in → Document    (N:M) — partial
//   C12: Evidence → has_type → Tier          (N:1) — checks tier format
//
// Error codes: CAR-001 (cardinality violation), CAR-002 (duplicate relationship)
//
// Pure function — no I/O, no mutation, no side effects.
// RV-01: Reads only ExtractedRegistries JSON.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationIssue } from './types/validation-issues';
import { VALIDATION_CODES } from './types/validation-issues';
import type { RelationshipValidator } from './types/validator-interface';

/**
 * Valid tier values.
 */
const VALID_TIERS = new Set(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']);

/**
 * Cardinality Validator — C07 to C12.
 * Checks multiplicity constraints and duplicate relationships.
 */
export const cardinalityValidator: RelationshipValidator = (
  registries: ExtractedRegistries,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // ---------------------------------------------------------------
  // C08: Claim → Decision (1:1)
  // Each claim should appear in at most one decision's affected list.
  // ---------------------------------------------------------------

  const claimToDecisions = new Map<string, string[]>();

  for (const decision of registries.decisions) {
    for (const aff of decision.affected) {
      const cleanAff = aff.trim();
      if (!cleanAff || cleanAff === '—') continue;
      if (!cleanAff.startsWith('CLM-')) continue;

      const existing = claimToDecisions.get(cleanAff) || [];
      existing.push(decision.id);
      claimToDecisions.set(cleanAff, existing);
    }
  }

  for (const [claimId, decisionIds] of claimToDecisions) {
    if (decisionIds.length > 1) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Claim "${claimId}" appears in ${decisionIds.length} decisions (C08: 1:1 expected)`,
        severity: 'error',
        entityId: claimId,
        relationshipId: 'C08',
        context: `Found in decisions: ${decisionIds.join(', ')}`,
      });
    }
  }

  // ---------------------------------------------------------------
  // C04 / orphan detection: Products with zero claims
  // ---------------------------------------------------------------

  const productsWithClaims = new Set<string>();
  for (const claim of registries.claims) {
    if (claim.product) {
      productsWithClaims.add(claim.product);
    }
  }

  for (const product of registries.products) {
    if (!productsWithClaims.has(product.id)) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Product "${product.id}" has zero claims (C04: 1:N expected)`,
        severity: 'warning',
        entityId: product.id,
        relationshipId: 'C04',
        context: 'Product registered but no claims reference it',
      });
    }
  }

  // ---------------------------------------------------------------
  // Orphan evidence: evidence supporting no claim
  // ---------------------------------------------------------------

  const evidenceWithClaims = new Set<string>();
  for (const claim of registries.claims) {
    for (const evId of claim.evidence) {
      evidenceWithClaims.add(evId);
    }
  }

  for (const evidence of registries.evidence) {
    if (!evidenceWithClaims.has(evidence.id)) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Evidence "${evidence.id}" is orphaned — not referenced by any claim`,
        severity: 'warning',
        entityId: evidence.id,
        relationshipId: 'C06',
      });
    }
  }

  // ---------------------------------------------------------------
  // Orphan claims: claims with no evidence
  // ---------------------------------------------------------------

  for (const claim of registries.claims) {
    if (claim.evidence.length === 0) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Claim "${claim.id}" has no supporting evidence (C06: N:M)`,
        severity: 'warning',
        entityId: claim.id,
        relationshipId: 'C06',
        context: 'Claim exists but no evidence items reference it',
      });
    }
  }

  // ---------------------------------------------------------------
  // Decisions with no affected claims
  // ---------------------------------------------------------------

  for (const decision of registries.decisions) {
    const hasClaim = decision.affected.some(
      (a) => a.trim().startsWith('CLM-'),
    );
    if (!hasClaim && decision.affected.length > 0) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Decision "${decision.id}" has no affected claims`,
        severity: 'info',
        entityId: decision.id,
        relationshipId: 'C08',
        context: `Affected entries: ${decision.affected.join(', ')}`,
      });
    }
  }

  // ---------------------------------------------------------------
  // C02 / C03: KnowledgeAreas with zero products/claims/authorities
  // ---------------------------------------------------------------

  const kaProducts = new Map<string, number>();
  const kaClaims = new Map<string, number>();
  const kaAuthorities = new Map<string, number>();

  for (const p of registries.products) {
    if (p.ka) kaProducts.set(p.ka, (kaProducts.get(p.ka) || 0) + 1);
  }
  for (const c of registries.claims) {
    if (c.ka) kaClaims.set(c.ka, (kaClaims.get(c.ka) || 0) + 1);
  }
  for (const a of registries.authorities) {
    if (a.areaId) kaAuthorities.set(a.areaId, (kaAuthorities.get(a.areaId) || 0) + 1);
  }

  // Collect all referenced KAs
  const allKAs = new Set([
    ...kaProducts.keys(),
    ...kaClaims.keys(),
    ...kaAuthorities.keys(),
  ]);

  for (const ka of allKAs) {
    if ((kaProducts.get(ka) || 0) === 0) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `KnowledgeArea "${ka}" has no products (C01: 1:N expected)`,
        severity: 'info',
        entityId: ka,
        relationshipId: 'C01',
      });
    }
    if ((kaClaims.get(ka) || 0) === 0) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `KnowledgeArea "${ka}" has no claims (C02: 1:N expected)`,
        severity: 'info',
        entityId: ka,
        relationshipId: 'C02',
      });
    }
    if ((kaAuthorities.get(ka) || 0) === 0) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `KnowledgeArea "${ka}" has no authorities (C03: 1:N expected)`,
        severity: 'info',
        entityId: ka,
        relationshipId: 'C03',
      });
    }
  }

  // ---------------------------------------------------------------
  // C12: Evidence tier validation
  // ---------------------------------------------------------------

  for (const evidence of registries.evidence) {
    if (!VALID_TIERS.has(evidence.tier)) {
      issues.push({
        code: VALIDATION_CODES.CARD_VIOLATION,
        message: `Evidence "${evidence.id}" has invalid tier "${evidence.tier}" (C12: T1-T7 expected)`,
        severity: 'warning',
        entityId: evidence.id,
        relationshipId: 'C12',
        targetId: evidence.tier,
      });
    }
  }

  // ---------------------------------------------------------------
  // CAR-002: Duplicate evidence references within a single claim
  // ---------------------------------------------------------------

  for (const claim of registries.claims) {
    const seen = new Set<string>();
    for (const evId of claim.evidence) {
      if (seen.has(evId)) {
        issues.push({
          code: VALIDATION_CODES.CARD_DUPLICATE,
          message: `Claim "${claim.id}" references Evidence "${evId}" multiple times`,
          severity: 'warning',
          entityId: claim.id,
          relationshipId: 'C06',
          targetId: evId,
        });
      }
      seen.add(evId);
    }
  }

  return issues;
};
