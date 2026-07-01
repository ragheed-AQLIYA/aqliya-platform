// Governance Engine — Chain Resolver
// Sprint 2: Claim → Evidence → Source → Document chain verification

import { GovernanceRegistries, Claim, Evidence, Source } from '../types/entities';

export interface ChainInfo {
  claimId: string;
  complete: boolean;
  evidenceCount: number;
  sourceCount: number;
  chain: ChainLink[];
  brokenAt?: string;
}

export interface ChainLink {
  step: number;
  entityType: string;
  entityId: string;
  resolved: boolean;
}

export interface ChainValidationResult {
  totalChains: number;
  completeChains: number;
  brokenChains: number;
  chains: ChainInfo[];
}

export class ChainResolver {
  private registries: GovernanceRegistries;

  constructor(registries: GovernanceRegistries) {
    this.registries = registries;
  }

  validateAllChains(): ChainValidationResult {
    const chains: ChainInfo[] = [];

    for (const claim of this.registries.claims) {
      const chain = this.resolveChain(claim);
      chains.push(chain);
    }

    return {
      totalChains: chains.length,
      completeChains: chains.filter(c => c.complete).length,
      brokenChains: chains.filter(c => !c.complete).length,
      chains,
    };
  }

  resolveChain(claim: Claim): ChainInfo {
    const chain: ChainLink[] = [];
    let complete = true;
    let brokenAt: string | undefined;

    // Step 1: Claim itself
    chain.push({ step: 1, entityType: 'Claim', entityId: claim.id, resolved: true });

    // Step 2: Evidence items
    for (const evRef of claim.evidenceRefs) {
      const ev = this.registries.evidence.find(e => e.id === evRef);
      const evResolved = ev !== undefined;
      chain.push({ step: 2, entityType: 'Evidence', entityId: evRef, resolved: evResolved });

      if (!evResolved && complete) {
        complete = false;
        brokenAt = `Evidence ${evRef} not found`;
        return { claimId: claim.id, complete, evidenceCount: claim.evidenceRefs.length, sourceCount: 0, chain, brokenAt };
      }

      if (ev) {
        // Step 3: Source for each evidence
        const source = this.registries.sources.find(s => s.id === ev.sourceRef);
        const srcResolved = source !== undefined;
        chain.push({ step: 3, entityType: 'Source', entityId: ev.sourceRef, resolved: srcResolved });

        if (!srcResolved && complete) {
          complete = false;
          brokenAt = `Source ${ev.sourceRef} not found for evidence ${ev.id}`;
          return { claimId: claim.id, complete, evidenceCount: claim.evidenceRefs.length, sourceCount: 0, chain, brokenAt };
        }
      }
    }

    const uniqueSources = new Set(
      claim.evidenceRefs
        .map(ref => this.registries.evidence.find(e => e.id === ref))
        .filter((e): e is Evidence => e !== undefined)
        .map(e => e.sourceRef)
    );

    return {
      claimId: claim.id,
      complete,
      evidenceCount: claim.evidenceRefs.length,
      sourceCount: uniqueSources.size,
      chain,
      brokenAt,
    };
  }

  getChainDepth(claimId: string): number {
    const claim = this.registries.claims.find(c => c.id === claimId);
    if (!claim) return 0;
    const chain = this.resolveChain(claim);
    return Math.max(...chain.chain.map(l => l.step));
  }

  getAverageChainDepth(): number {
    const depths = this.registries.claims.map(c => this.getChainDepth(c.id));
    return depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;
  }
}
