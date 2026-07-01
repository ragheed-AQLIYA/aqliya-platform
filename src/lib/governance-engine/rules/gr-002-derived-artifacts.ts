import { ExecutionContext } from '../context/execution-context';
import { RuleResult } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';
import { ID_PATTERNS } from '../types/identifiers';

export class GR002Rule implements GovernanceRule {
  readonly id = 'GR-002';
  readonly name = 'Derived Artifacts Rule';
  readonly phase = 'structural' as const;
  readonly severity = 'high' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;
    const { manifests, dossiers } = context.registries;

    const productIds = new Set(ctx.products.byId.keys());
    const claimIds = new Set(ctx.claims.byId.keys());

    for (const manifest of manifests) {
      if (!productIds.has(manifest.productId)) {
        findings.push(
          `Manifest references unknown product "${manifest.productId}". Expected one of: ${Array.from(productIds).join(', ')}`
        );
      }

      for (const claimRef of manifest.claims) {
        if (!claimIds.has(claimRef)) {
          findings.push(
            `Manifest for product "${manifest.productId}" references unknown claim "${claimRef}". Expected valid CLM ID.`
          );
        }
      }

      if (!ID_PATTERNS.EVIDENCE.test(manifest.productId) && manifest.productId.startsWith('PROD-')) {
        for (const evRef of manifest.evidenceRefs) {
          if (!ID_PATTERNS.EVIDENCE.test(evRef)) {
            findings.push(
              `Manifest for product "${manifest.productId}" has invalid evidence reference "${evRef}". Expected EV-NNNN pattern.`
            );
          }
        }
      }
    }

    for (const dossier of dossiers) {
      if (!productIds.has(dossier.productId)) {
        findings.push(
          `Dossier references unknown product "${dossier.productId}". Expected one of: ${Array.from(productIds).join(', ')}`
        );
      }

      const matchingManifest = manifests.find(m => m.productId === dossier.productId);
      if (matchingManifest && matchingManifest.hash !== dossier.manifestHash) {
        findings.push(
          `Dossier for product "${dossier.productId}" has manifestHash "${dossier.manifestHash}" but matching manifest hash is "${matchingManifest.hash}". Artifact may be manually edited.`
        );
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
}
