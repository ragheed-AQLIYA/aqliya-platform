import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Evidence, Claim } from '../types/entities';

export class GR008Rule implements GovernanceRule {
  readonly id = 'GR-008';
  readonly name = 'Shared Evidence Canonicalization';
  readonly phase = 'integrity';
  readonly severity = 'high';
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const engineProducts = ctx.products.byType.get('Engine');
    if (engineProducts === undefined || engineProducts.length === 0) {
      return this.pass('No Engine-type products to validate');
    }

    const engineProductIds = new Set(engineProducts.map((p) => p.id));
    const reusableItems = Array.from(ctx.evidence.byId.values()).filter((ev) => ev.reusable);

    const canonicalByCapability = new Map<string, Evidence>();

    for (const ev of reusableItems) {
      const capTag = this.extractCapabilityTag(ev);
      if (capTag === null) {
        continue;
      }

      const servesEngine = ev.supportsClaims.some((clmId) => {
        const claim = ctx.claims.byId.get(clmId);
        return claim !== undefined && engineProductIds.has(claim.product);
      });

      if (!servesEngine) {
        continue;
      }

      const existing = canonicalByCapability.get(capTag);
      if (existing !== undefined) {
        findings.push(
          `Duplicate reusable evidence for capability ${capTag}: ${existing.id} and ${ev.id}. Only one canonical EV is allowed across all Engine products.`,
        );
      } else {
        canonicalByCapability.set(capTag, ev);
      }
    }

    const productCapabilityCoverage = this.buildProductCoverage(
      reusableItems,
      ctx.claims.byId,
      engineProductIds,
    );

    for (const [capTag, coveringProducts] of productCapabilityCoverage) {
      if (coveringProducts.length > 1) {
        const canonicalEv = canonicalByCapability.get(capTag);
        if (canonicalEv !== undefined) {
          findings.push(
            `Capability ${capTag} is covered by reusable evidence in multiple Engine products [${coveringProducts.join(', ')}] but canonical EV is ${canonicalEv.id}. All products must reference the same canonical EV.`,
          );
        }
      }
    }

    const status = findings.length === 0 ? 'pass' : 'fail';

    return {
      ruleId: this.id,
      name: this.name,
      status,
      severity: this.severity,
      blocking: this.blocking,
      findings: findings.length > 0 ? findings : ['All shared evidence is canonical across Engine products'],
      duration: 0,
    };
  }

  private buildProductCoverage(
    reusableItems: Evidence[],
    claimsById: Map<string, Claim>,
    engineProductIds: Set<string>,
  ): Map<string, string[]> {
    const coverage = new Map<string, Set<string>>();

    for (const ev of reusableItems) {
      const capTag = this.extractCapabilityTag(ev);
      if (capTag === null) {
        continue;
      }

      for (const clmId of ev.supportsClaims) {
        const claim = claimsById.get(clmId);
        if (claim !== undefined && engineProductIds.has(claim.product)) {
          const set = coverage.get(capTag);
          if (set !== undefined) {
            set.add(claim.product);
          } else {
            coverage.set(capTag, new Set([claim.product]));
          }
        }
      }
    }

    const result = new Map<string, string[]>();
    for (const [capTag, productSet] of coverage) {
      result.set(capTag, Array.from(productSet).sort());
    }
    return result;
  }

  private extractCapabilityTag(ev: Evidence): string | null {
    const match = ev.description.match(/\bCAP-\d{3}\b/);
    return match !== null ? match[0] : null;
  }

  private pass(detail: string): RuleResult {
    return {
      ruleId: this.id,
      name: this.name,
      status: 'pass',
      severity: this.severity,
      blocking: this.blocking,
      findings: [detail],
      duration: 0,
    };
  }
}
