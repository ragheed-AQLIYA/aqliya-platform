import { Claim, Evidence, Source } from '../../types/entities';
import { ChainMap } from '../execution-context';

export function buildChains(claims: Claim[], evidence: Evidence[], sources: Source[]): ChainMap {
  const byClaim = new Map<string, { depth: number; complete: boolean; brokenAt?: string }>();
  let complete = 0, broken = 0, totalDepth = 0;
  let maxDepth = 0;
  const brokenChains: string[] = [];
  const orphanChains: string[] = [];
  const depthBuckets = new Map<number, string[]>(); // depth → claim IDs

  for (const claim of claims) {
    let depth = 1;
    let isComplete = true;
    let brokenAt: string | undefined;

    // No evidence refs = orphaned claim
    if (claim.evidenceRefs.length === 0) {
      orphanChains.push(claim.id);
      byClaim.set(claim.id, { depth: 0, complete: true, brokenAt: undefined });
      totalDepth += 0;
      complete++;
      continue;
    }

    for (const evRef of claim.evidenceRefs) {
      depth = 2;
      const ev = evidence.find(e => e.id === evRef);
      if (!ev) { isComplete = false; brokenAt = `Missing: ${evRef}`; break; }

      depth = 3;
      const src = sources.find(s => s.id === ev.sourceRef);
      if (!src) { isComplete = false; brokenAt = `Missing source for: ${evRef}`; break; }
    }

    byClaim.set(claim.id, { depth, complete: isComplete, brokenAt });
    if (isComplete) complete++; else { broken++; brokenChains.push(claim.id); }

    totalDepth += depth;
    if (depth > maxDepth) maxDepth = depth;

    const bucket = depthBuckets.get(depth) || [];
    bucket.push(claim.id);
    depthBuckets.set(depth, bucket);
  }

  // Determine longest chains (all claims at maxDepth)
  const longestChain = depthBuckets.get(maxDepth) || [];

  return {
    byClaim,
    complete,
    broken,
    avgDepth: claims.length > 0 ? Math.round((totalDepth / claims.length) * 100) / 100 : 0,
    maxDepth,
    brokenChains,
    longestChain,
    orphanChains,
  };
}
