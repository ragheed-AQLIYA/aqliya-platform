// ENG-001B: Chain Validator (C13–C16)
//
// Validates chain continuity and detects circular dependencies:
//   C13: Authority → governs → KnowledgeArea    (1:N)
//   C14: Authority → supersedes → Authority      (N:1)
//   C15: Decision → approved_by → Reviewer       (N:1) — partial
//   C16: Decision → based_on → Evidence           (1:M) — partial
//
// Error codes: CHN-001 (broken chain), CHN-002 (circular chain)
//
// Pure function — no I/O, no mutation, no side effects.
// RV-01: Reads only ExtractedRegistries JSON.

import type { ExtractedRegistries } from '../types/extracted-registries';
import type { ValidationIssue, ValidationCode } from './types/validation-issues';
import { VALIDATION_CODES } from './types/validation-issues';
import type { RelationshipValidator } from './types/validator-interface';

/**
 * Chain Validator — C13 to C16.
 * Checks authority supersession chains for continuity and cycles.
 */
export const chainValidator: RelationshipValidator = (
  registries: ExtractedRegistries,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // Build authority ID map for quick lookup
  const authorityMap = new Map<string, typeof registries.authorities[0]>();
  for (const a of registries.authorities) {
    authorityMap.set(a.id, a);
  }

  // ---------------------------------------------------------------
  // C14: Authority supersession chain
  // Detect chains via secondaryRefs that reference other AUTH- IDs.
  // Check for:
  //   - Broken chains (A→B where B doesn't reference A or B is unknown)
  //   - Circular chains (A→B→C→A)
  // ---------------------------------------------------------------

  // Build adjacency: AUTH-ID → [AUTH-IDs it references in secondaryRefs]
  const authorityGraph = new Map<string, string[]>();

  for (const authority of registries.authorities) {
    const refs = authority.secondaryRefs.filter((r) => r.startsWith('AUTH-'));
    if (refs.length > 0) {
      authorityGraph.set(authority.id, refs);
    }
  }

  // Detect circular chains in the authority graph
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const circularPaths = new Map<string, string[]>(); // node → path

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      // Found a cycle — record the circular path
      const cycleStart = path.indexOf(node);
      const cycle = [...path.slice(cycleStart), node];
      circularPaths.set(node, cycle);
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = authorityGraph.get(node) || [];
    for (const neighbor of neighbors) {
      if (authorityMap.has(neighbor)) {
        dfs(neighbor, path);
      }
    }

    path.pop();
    recursionStack.delete(node);
  }

  for (const node of authorityGraph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }

  for (const [, cycle] of circularPaths) {
    // Pick the first authority in the cycle as the reported entity
    issues.push({
      code: VALIDATION_CODES.CHAIN_CIRCULAR,
      message: `Circular authority supersession chain detected: ${cycle.join(' → ')}`,
      severity: 'error',
      entityId: cycle[0],
      relationshipId: 'C14',
      context: `Full path: ${cycle.join(' → ')}`,
    });
  }

  // Detect broken chains: authority A references B, but B doesn't reference A
  // (indicating a potential missing reverse link)
  for (const [authId, refs] of authorityGraph) {
    for (const ref of refs) {
      if (!authorityMap.has(ref)) continue; // handled by reference validator
      const refAuthority = authorityMap.get(ref)!;
      const refBackRefs = refAuthority.secondaryRefs.filter((r) => r.startsWith('AUTH-'));
      if (!refBackRefs.includes(authId)) {
        issues.push({
          code: VALIDATION_CODES.CHAIN_BROKEN,
          message: `Authority "${authId}" references "${ref}" but "${ref}" does not reference back`,
          severity: 'info',
          entityId: authId,
          relationshipId: 'C14',
          targetId: ref,
          context: 'Supersession chain may be missing a reverse link',
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // C13: Authority → KnowledgeArea chain
  // Verify each authority's areaId is a known KA (already checked in reference validator).
  // Here we check that the authority-type documents map to KAs with products.
  // ---------------------------------------------------------------

  const kaProductCount = new Map<string, number>();
  for (const p of registries.products) {
    if (p.ka) kaProductCount.set(p.ka, (kaProductCount.get(p.ka) || 0) + 1);
  }

  for (const authority of registries.authorities) {
    if (authority.type === 'Authority' && authority.areaId) {
      const prodCount = kaProductCount.get(authority.areaId) || 0;
      if (prodCount === 0) {
        issues.push({
          code: VALIDATION_CODES.CHAIN_BROKEN,
          message: `Authority "${authority.id}" governs KnowledgeArea "${authority.areaId}" but no products are assigned to that area`,
          severity: 'warning',
          entityId: authority.id,
          relationshipId: 'C13',
          targetId: authority.areaId,
        });
      }
    }
  }

  // ---------------------------------------------------------------
  // C15: Decision → Reviewer chain (partial)
  // We don't have reviewer entities, but we can check decisions share
  // authority references consistently.
  // ---------------------------------------------------------------

  const decisionAuthorities = new Set<string>();
  for (const d of registries.decisions) {
    if (d.authority) decisionAuthorities.add(d.authority);
  }

  for (const authId of decisionAuthorities) {
    if (!authorityMap.has(authId)) {
      issues.push({
        code: VALIDATION_CODES.CHAIN_BROKEN,
        message: `Decision chain references non-existent Authority "${authId}"`,
        severity: 'error',
        entityId: authId,
        relationshipId: 'C15',
      });
    }
  }

  // ---------------------------------------------------------------
  // C16: Decision → Evidence chain (partial)
  // Check that decisions reference claims that have evidence.
  // ---------------------------------------------------------------

  const claimEvidenceMap = new Map<string, string[]>();
  for (const c of registries.claims) {
    claimEvidenceMap.set(c.id, c.evidence);
  }

  for (const decision of registries.decisions) {
    for (const aff of decision.affected) {
      const cleanAff = aff.trim();
      if (!cleanAff.startsWith('CLM-')) continue;
      const evIds = claimEvidenceMap.get(cleanAff);
      if (evIds && evIds.length === 0) {
        issues.push({
          code: VALIDATION_CODES.CHAIN_BROKEN,
          message: `Decision "${decision.id}" references Claim "${cleanAff}" which has no evidence (C16: chain break)`,
          severity: 'warning',
          entityId: decision.id,
          relationshipId: 'C16',
          targetId: cleanAff,
        });
      }
    }
  }

  return issues;
};
