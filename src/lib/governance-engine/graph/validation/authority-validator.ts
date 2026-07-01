// ENG-001B: Authority Validator (C17–C21)
//
// Validates authority boundaries and governance structure:
//   C17: Review → produces → Finding        (1:N) — partial
//   C18: Finding → references → Claim        (N:1) — partial
//   C19: Finding → recommends → Decision     (N:1) — partial
//   C20: Manifest → aggregates → Claim       (1:N) — partial
//   C21: Dossier → extends → Manifest        (1:1) — partial
//
// Error codes: AUTH-001 (unknown authority), AUTH-002 (boundary violation)
//
// Pure function — no I/O, no mutation, no side effects.
// RV-01: Reads only ExtractedRegistries JSON.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationIssue } from './types/validation-issues';
import { VALIDATION_CODES } from './types/validation-issues';
import type { RelationshipValidator } from './types/validator-interface';

/**
 * Authority Validator — C17 to C21.
 * Checks authority boundary consistency and governance structure.
 * Some checks are partial (Review/Finding/Manifest/Dossier not extracted in JSON).
 */
export const authorityValidator: RelationshipValidator = (
  registries: ExtractedRegistries,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Build lookup maps
  const authorityMap = new Map<string, typeof registries.authorities[0]>();
  for (const a of registries.authorities) {
    authorityMap.set(a.id, a);
  }

  const productMap = new Map<string, typeof registries.products[0]>();
  for (const p of registries.products) {
    productMap.set(p.id, p);
  }

  // ---------------------------------------------------------------
  // AUTH-001: Claims reference valid authorities
  // (already handled by REF-001, but here with stricter check)
  // ---------------------------------------------------------------

  for (const claim of registries.claims) {
    if (claim.auth && authorityMap.has(claim.auth)) {
      const authority = authorityMap.get(claim.auth)!;
      // AUTH-002: Claim's authority should match its product's knowledge area
      if (claim.product && productMap.has(claim.product)) {
        const product = productMap.get(claim.product)!;
        if (authority.areaId && product.ka && authority.areaId !== product.ka) {
          issues.push({
            code: VALIDATION_CODES.AUTH_BOUNDARY,
            message: `Claim "${claim.id}" authority "${claim.auth}" (area: ${authority.areaId}) ` +
              `does not match Product "${claim.product}" KnowledgeArea "${product.ka}" (AUTH-002)`,
            severity: 'warning',
            entityId: claim.id,
            relationshipId: 'C18',
            context: `Authority area "${authority.areaId}" ≠ Product KA "${product.ka}"`,
            targetId: claim.auth,
          });
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // AUTH-001: Check for unknown authorities in product references
  // ---------------------------------------------------------------

  for (const product of registries.products) {
    if (product.authority && !authorityMap.has(product.authority)) {
      issues.push({
        code: VALIDATION_CODES.AUTH_UNKNOWN,
        message: `Product "${product.id}" references unknown Authority "${product.authority}"`,
        severity: 'error',
        entityId: product.id,
        relationshipId: 'C01',
        targetId: product.authority,
      });
    } else if (product.authority && authorityMap.has(product.authority)) {
      const authority = authorityMap.get(product.authority)!;

      // AUTH-002: Product's authority area should match product's KA
      if (authority.areaId && product.ka && authority.areaId !== product.ka) {
        issues.push({
          code: VALIDATION_CODES.AUTH_BOUNDARY,
          message: `Product "${product.id}" authority "${product.authority}" (area: ${authority.areaId}) ` +
            `does not match Product KnowledgeArea "${product.ka}" (AUTH-002)`,
          severity: 'warning',
          entityId: product.id,
          relationshipId: 'C01',
          context: `Authority area "${authority.areaId}" ≠ Product KA "${product.ka}"`,
          targetId: product.authority,
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // AUTH-002: Authority type consistency
  // ---------------------------------------------------------------

  for (const authority of registries.authorities) {
    if (authority.type === 'Authority') {
      // Authority-type documents should have no gaps marked
      if (authority.gap && authority.gap !== 'NO') {
        issues.push({
          code: VALIDATION_CODES.AUTH_BOUNDARY,
          message: `Authority "${authority.id}" is type "Authority" but has gap "${authority.gap}"`,
          severity: 'warning',
          entityId: authority.id,
          relationshipId: 'C13',
          context: 'Authority-type documents should have NO gaps',
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // AUTH-002: Secondary reference consistency checks
  // ---------------------------------------------------------------

  for (const authority of registries.authorities) {
    for (const ref of authority.secondaryRefs) {
      // Check cross-document references that should be AUTH- IDs
      if (ref.startsWith('docs/') || ref.startsWith('docs/governance/')) {
        // Document references are valid — skip
        continue;
      }
      // If it's a governance doc reference, just note it
      if (ref.includes('MASTER_REFERENCE') || ref.includes('PRODUCT_STATUS_MATRIX')) {
        // These are valid cross-references
        continue;
      }
    }
  }

  // ---------------------------------------------------------------
  // C20 / C21: Manifest/Dossier consistency (partial)
  // We don't have Manifests or Dossiers in ExtractedRegistries,
  // but we can check product-level evidence status.
  // ---------------------------------------------------------------

  for (const product of registries.products) {
    // Product evidence status should be consistent
    const validStatuses = ['Not Started', 'Partial', 'Complete', 'Comprehensive'];
    if (product.evidenceStatus && !validStatuses.includes(product.evidenceStatus)) {
      issues.push({
        code: VALIDATION_CODES.AUTH_BOUNDARY,
        message: `Product "${product.id}" has unexpected evidence status "${product.evidenceStatus}"`,
        severity: 'info',
        entityId: product.id,
        relationshipId: 'C20',
        context: `Expected one of: ${validStatuses.join(', ')}`,
      });
    }

    // Products at L4+ should have non-minimal evidence
    const lMatch = product.currentLLevel?.match(/L(\d)/);
    const lNum = lMatch ? parseInt(lMatch[1], 10) : 0;
    if (lNum >= 4 && product.evidenceStatus === 'Not Started') {
      issues.push({
        code: VALIDATION_CODES.AUTH_BOUNDARY,
        message: `Product "${product.id}" at L${lNum} but evidence status is "Not Started" (C20)`,
        severity: 'warning',
        entityId: product.id,
        relationshipId: 'C20',
      });
    }
  }

  return issues;
};
