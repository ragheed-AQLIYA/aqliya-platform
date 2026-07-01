import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';

export class GR007Rule implements GovernanceRule {
  readonly id = 'GR-007';
  readonly name = 'Evidence Independence Check';
  readonly phase = 'integrity' as const;
  readonly severity = 'high' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const evidenceIds = new Set(ctx.evidence.byId.keys());

    const directRefs = this.findDirectEvidenceReferences(ctx, evidenceIds);
    for (const ref of directRefs) {
      findings.push(
        `Evidence "${ref.source}" directly references another evidence "${ref.target}" in its fields. ` +
        `Evidence must not reference other evidence directly.`
      );
    }

    const evidenceToClaims = new Map<string, string[]>();
    const claimToEvidence = new Map<string, string[]>();

    for (const ev of ctx.evidence.byId.values()) {
      evidenceToClaims.set(ev.id, [...ev.supportsClaims]);
    }

    for (const clm of ctx.claims.byId.values()) {
      const evRefs = clm.evidenceRefs.filter(ref => evidenceIds.has(ref));
      if (evRefs.length > 0) {
        claimToEvidence.set(clm.id, evRefs);
      }
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();

    for (const ev of ctx.evidence.byId.values()) {
      if (!visited.has(ev.id)) {
        const cycle = this.detectCycle(
          ev.id,
          ctx,
          evidenceToClaims,
          claimToEvidence,
          visited,
          inStack,
          new Set<string>()
        );

        if (cycle) {
          findings.push(
            `Circular evidence chain detected: ${cycle.join(' → ')}. ` +
            `Evidence must form an acyclic dependency graph.`
          );
        }
      }
    }

    return {
      ruleId: this.id,
      name: this.name,
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: this.severity,
      blocking: this.blocking,
      findings,
      duration: 0,
    };
  }

  private findDirectEvidenceReferences(
    ctx: ExecutionContext,
    evidenceIds: Set<string>
  ): { source: string; target: string }[] {
    const refs: { source: string; target: string }[] = [];

    for (const ev of ctx.evidence.byId.values()) {
      if (evidenceIds.has(ev.sourceRef)) {
        refs.push({ source: ev.id, target: ev.sourceRef });
      }

      for (const claimRef of ev.supportsClaims) {
        if (evidenceIds.has(claimRef)) {
          refs.push({ source: ev.id, target: claimRef });
        }
      }
    }

    return refs;
  }

  private detectCycle(
    currentEvId: string,
    ctx: ExecutionContext,
    evidenceToClaims: Map<string, string[]>,
    claimToEvidence: Map<string, string[]>,
    visited: Set<string>,
    inStack: Set<string>,
    path: Set<string>
  ): string[] | null {
    if (inStack.has(currentEvId)) {
      return [currentEvId];
    }

    if (visited.has(currentEvId)) {
      return null;
    }

    visited.add(currentEvId);
    inStack.add(currentEvId);
    path.add(currentEvId);

    const claimRefs = evidenceToClaims.get(currentEvId) ?? [];

    for (const claimRef of claimRefs) {
      const claim = ctx.claims.byId.get(claimRef);
      if (!claim) continue;

      const downstreamEvidence = claimToEvidence.get(claimRef) ?? [];

      for (const downstreamEvId of downstreamEvidence) {
        if (downstreamEvId === currentEvId) continue;

        if (inStack.has(downstreamEvId)) {
          const cyclePath = Array.from(path);
          cyclePath.push(downstreamEvId);
          inStack.delete(currentEvId);
          path.delete(currentEvId);
          return cyclePath;
        }

        const subCycle = this.detectCycle(
          downstreamEvId,
          ctx,
          evidenceToClaims,
          claimToEvidence,
          visited,
          inStack,
          path
        );

        if (subCycle !== null) {
          inStack.delete(currentEvId);
          path.delete(currentEvId);
          return subCycle;
        }
      }
    }

    inStack.delete(currentEvId);
    path.delete(currentEvId);
    return null;
  }
}
