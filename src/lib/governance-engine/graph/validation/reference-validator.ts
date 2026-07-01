// ENG-001B: Reference Validator (C01–C06)
//
// Validates cross-reference integrity between entities:
//   C01: KnowledgeArea → has_many → Product (1:N)
//   C02: KnowledgeArea → has_many → Claim (1:N)
//   C03: KnowledgeArea → has_many → Authority (1:N)
//   C04: Product → has_many → Claim (1:N)
//   C05: Product → belongs_to → KnowledgeArea (N:1)
//   C06: Claim → references → Evidence (N:M)
//
// Error codes: REF-001 (missing reference), REF-002 (unknown entity)
//
// Pure function — no I/O, no mutation, no side effects.
// RV-01: Reads only ExtractedRegistries JSON, never re-parses Markdown.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationIssue } from './types/validation-issues';
import { VALIDATION_CODES } from './types/validation-issues';
import type { RelationshipValidator } from './types/validator-interface';

/**
 * Build a Set of known IDs for a given entity list.
 */
function buildIdSet<T extends { id: string }>(entities: T[]): Set<string> {
  const ids = new Set<string>();
  for (const entity of entities) {
    ids.add(entity.id);
  }
  return ids;
}

/**
 * Reference Validator — C01 to C06.
 * Checks that all cross-references between entities resolve to known IDs.
 */
export const referenceValidator: RelationshipValidator = (
  registries: ExtractedRegistries,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const knownClaims = buildIdSet(registries.claims);
  const knownProducts = buildIdSet(registries.products);
  const knownEvidence = buildIdSet(registries.evidence);
  const knownAuthorities = buildIdSet(registries.authorities);
  const knownDecisions = buildIdSet(registries.decisions);

  // Collect all known KAs from products, claims, and authorities
  const knownKAs = new Set<string>();
  for (const p of registries.products) {
    if (p.ka) knownKAs.add(p.ka);
  }
  for (const c of registries.claims) {
    if (c.ka) knownKAs.add(c.ka);
  }
  for (const a of registries.authorities) {
    if (a.areaId) knownKAs.add(a.areaId);
  }

  // ---------------------------------------------------------------
  // C02 / C04: Claim references
  // ---------------------------------------------------------------

  for (const claim of registries.claims) {
    // C02: Claim → KnowledgeArea
    if (claim.ka && !knownKAs.has(claim.ka)) {
      issues.push({
        code: VALIDATION_CODES.REF_UNKNOWN_ENTITY,
        message: `Claim "${claim.id}" references unknown KnowledgeArea "${claim.ka}"`,
        severity: 'error',
        entityId: claim.id,
        relationshipId: 'C02',
        context: `KnowledgeArea "${claim.ka}" not found in any product, claim, or authority record`,
        targetId: claim.ka,
      });
    }

    // C04: Claim → Product
    if (claim.product && !knownProducts.has(claim.product)) {
      issues.push({
        code: VALIDATION_CODES.REF_MISSING_REFERENCE,
        message: `Claim "${claim.id}" references non-existent Product "${claim.product}"`,
        severity: 'error',
        entityId: claim.id,
        relationshipId: 'C04',
        targetId: claim.product,
      });
    }

    // C06: Claim → Evidence
    for (const evId of claim.evidence) {
      if (!knownEvidence.has(evId)) {
        issues.push({
          code: VALIDATION_CODES.REF_MISSING_REFERENCE,
          message: `Claim "${claim.id}" references non-existent Evidence "${evId}"`,
          severity: 'error',
          entityId: claim.id,
          relationshipId: 'C06',
          targetId: evId,
        });
      }
    }

    // Claim → Authority (via claim.auth)
    if (claim.auth && !knownAuthorities.has(claim.auth)) {
      issues.push({
        code: VALIDATION_CODES.REF_MISSING_REFERENCE,
        message: `Claim "${claim.id}" references non-existent Authority "${claim.auth}"`,
        severity: 'warning',
        entityId: claim.id,
        relationshipId: 'C07',
        targetId: claim.auth,
      });
    }
  }

  // ---------------------------------------------------------------
  // C01 / C05: Product references
  // ---------------------------------------------------------------

  for (const product of registries.products) {
    // C05: Product → KnowledgeArea
    if (product.ka && !knownKAs.has(product.ka)) {
      issues.push({
        code: VALIDATION_CODES.REF_UNKNOWN_ENTITY,
        message: `Product "${product.id}" belongs to unknown KnowledgeArea "${product.ka}"`,
        severity: 'error',
        entityId: product.id,
        relationshipId: 'C05',
        targetId: product.ka,
      });
    }

    // Product → Authority
    if (product.authority && !knownAuthorities.has(product.authority)) {
      issues.push({
        code: VALIDATION_CODES.REF_MISSING_REFERENCE,
        message: `Product "${product.id}" references non-existent Authority "${product.authority}"`,
        severity: 'warning',
        entityId: product.id,
        relationshipId: 'C01',
        targetId: product.authority,
      });
    }

    // Product → Parent (optional hierarchy)
    if (product.parent && !knownProducts.has(product.parent)) {
      issues.push({
        code: VALIDATION_CODES.REF_MISSING_REFERENCE,
        message: `Product "${product.id}" references non-existent parent "${product.parent}"`,
        severity: 'warning',
        entityId: product.id,
        relationshipId: 'C01',
        targetId: product.parent,
      });
    }
  }

  // ---------------------------------------------------------------
  // C03: Authority → KnowledgeArea
  // ---------------------------------------------------------------

  for (const authority of registries.authorities) {
    if (authority.areaId && !knownKAs.has(authority.areaId)) {
      issues.push({
        code: VALIDATION_CODES.REF_UNKNOWN_ENTITY,
        message: `Authority "${authority.id}" references unknown KnowledgeArea "${authority.areaId}"`,
        severity: 'warning',
        entityId: authority.id,
        relationshipId: 'C03',
        targetId: authority.areaId,
      });
    }
  }

  // ---------------------------------------------------------------
  // Decision references
  // ---------------------------------------------------------------

  for (const decision of registries.decisions) {
    // Decision → Authority
    if (decision.authority && !knownAuthorities.has(decision.authority)) {
      issues.push({
        code: VALIDATION_CODES.REF_MISSING_REFERENCE,
        message: `Decision "${decision.id}" references non-existent Authority "${decision.authority}"`,
        severity: 'error',
        entityId: decision.id,
        relationshipId: 'C15',
        targetId: decision.authority,
      });
    }

    // Decision → affected claims
    for (const aff of decision.affected) {
      const cleanAff = aff.trim();
      if (cleanAff && cleanAff !== '—' && !knownClaims.has(cleanAff) && !cleanAff.startsWith('CLM-')) {
        continue; // ignore non-claim entries
      }
      if (cleanAff && cleanAff !== '—' && !knownClaims.has(cleanAff)) {
        issues.push({
          code: VALIDATION_CODES.REF_MISSING_REFERENCE,
          message: `Decision "${decision.id}" references non-existent Claim "${cleanAff}"`,
          severity: 'warning',
          entityId: decision.id,
          relationshipId: 'C08',
          targetId: cleanAff,
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // Evidence ↔ Source cross-reference
  // ---------------------------------------------------------------

  for (const evidence of registries.evidence) {
    // Evidence → supporting claims
    for (const claimId of evidence.supports) {
      if (claimId && !knownClaims.has(claimId)) {
        issues.push({
          code: VALIDATION_CODES.REF_MISSING_REFERENCE,
          message: `Evidence "${evidence.id}" supports non-existent Claim "${claimId}"`,
          severity: 'warning',
          entityId: evidence.id,
          relationshipId: 'C06',
          targetId: claimId,
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // Authority secondary references
  // ---------------------------------------------------------------

  for (const authority of registries.authorities) {
    for (const ref of authority.secondaryRefs) {
      if (ref.startsWith('AUTH-') && !knownAuthorities.has(ref)) {
        issues.push({
          code: VALIDATION_CODES.REF_MISSING_REFERENCE,
          message: `Authority "${authority.id}" references non-existent secondary Authority "${ref}"`,
          severity: 'info',
          entityId: authority.id,
          relationshipId: 'C14',
          targetId: ref,
        });
      }
    }
  }

  return issues;
};
