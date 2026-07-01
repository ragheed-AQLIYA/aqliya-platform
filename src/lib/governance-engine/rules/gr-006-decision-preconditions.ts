import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';

interface PreconditionCheck {
  name: string;
  check: (ctx: ExecutionContext, productId: string, decisionId: string) => string | null;
}

const PRECONDITIONS: PreconditionCheck[] = [
  {
    name: 'Manifest exists',
    check: (ctx, productId) => {
      const found = ctx.registries.manifests.some(m => m.productId === productId);
      return found ? null : `No manifest found for product "${productId}"`;
    },
  },
  {
    name: 'Dossier exists',
    check: (ctx, productId) => {
      const found = ctx.registries.dossiers.some(d => d.productId === productId);
      return found ? null : `No dossier found for product "${productId}"`;
    },
  },
  {
    name: 'Provenance PASS',
    check: (ctx, _productId) => {
      const broken: string[] = [];
      for (const ev of ctx.evidence.byId.values()) {
        const source = ctx.sources.byId.get(ev.sourceRef);
        if (!source) {
          broken.push(`Evidence "${ev.id}" references missing source "${ev.sourceRef}"`);
          continue;
        }
        if (!source.producesEvidence.includes(ev.id)) {
          broken.push(
            `Source "${source.id}" does not list evidence "${ev.id}" in its producesEvidence. ` +
            `Provenance chain is incomplete.`
          );
        }
      }
      return broken.length > 0 ? broken.join('; ') : null;
    },
  },
  {
    name: 'Integrity 100%',
    check: (ctx, productId) => {
      const manifest = ctx.registries.manifests.find(m => m.productId === productId);
      if (!manifest) return `No manifest found to verify integrity for product "${productId}"`;
      if (manifest.integrityScore < 100) {
        return `Manifest for product "${productId}" has integrityScore of ${manifest.integrityScore}, expected 100`;
      }
      return null;
    },
  },
  {
    name: 'Independent Review complete',
    check: (ctx, productId) => {
      const productFindings = ctx.registries.findings.filter(f => f.product === productId);
      const unresolvedReviews = productFindings.filter(f => f.status === 'Open' || f.status === 'Rejected');
      if (unresolvedReviews.length > 0) {
        const ids = unresolvedReviews.map(f => f.id).join(', ');
        return `Product "${productId}" has ${unresolvedReviews.length} unresolved finding(s): ${ids}`;
      }
      return null;
    },
  },
  {
    name: 'No high findings',
    check: (ctx, productId) => {
      const highOpen = ctx.registries.findings.filter(
        f => f.product === productId && f.severity === 'High' && f.status === 'Open'
      );
      if (highOpen.length > 0) {
        const ids = highOpen.map(f => `${f.id} (${f.description})`).join('; ');
        return `Product "${productId}" has ${highOpen.length} open high-severity finding(s): ${ids}`;
      }
      return null;
    },
  },
];

export class GR006Rule implements GovernanceRule {
  readonly id = 'GR-006';
  readonly name = 'Decision Preconditions Rule';
  readonly phase = 'integrity' as const;
  readonly severity = 'critical' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const matDecisions = ctx.decisions.activeMAT;

    for (const decision of matDecisions) {
      const affectedProductIds = new Set<string>();

      for (const claimRef of decision.affectedClaims) {
        const clm = ctx.claims.byId.get(claimRef);
        if (clm) {
          affectedProductIds.add(clm.product);
        } else {
          findings.push(
            `[Precondition check for ${decision.id}] Unknown claim reference "${claimRef}"`
          );
        }
      }

      if (affectedProductIds.size === 0) {
        findings.push(
          `[${decision.id}] No resolvable products from affected claims. Cannot verify preconditions.`
        );
        continue;
      }

      for (const productId of affectedProductIds) {
        for (const precondition of PRECONDITIONS) {
          const failure = precondition.check(ctx, productId, decision.id);
          if (failure !== null) {
            findings.push(
              `[${decision.id}] Precondition "${precondition.name}" failed for product "${productId}": ${failure}`
            );
          }
        }
      }
    }

    if (matDecisions.length === 0) {
      return {
        ruleId: this.id,
        name: this.name,
        status: 'pass',
        severity: this.severity,
        blocking: this.blocking,
        findings: ['No MAT decisions to validate. All preconditions trivially satisfied.'],
        duration: 0,
      };
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
}
