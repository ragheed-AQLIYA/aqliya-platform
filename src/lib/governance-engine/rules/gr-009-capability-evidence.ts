import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Evidence, Claim } from '../types/entities';

export class GR009Rule implements GovernanceRule {
  readonly id = 'GR-009';
  readonly name = 'Capability Evidence Canonicalization';
  readonly phase = 'pattern' as const;
  readonly severity = 'high' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const engineProducts = ctx.products.byType.get('Engine');
    if (engineProducts === undefined || engineProducts.length === 0) {
      return this.pass('No Engine-type products to validate');
    }

    const engineProductIds = new Set(engineProducts.map((p) => p.id));
    const allClaims = Array.from(ctx.claims.byId.values());
    const engineClaims = allClaims.filter((c) => engineProductIds.has(c.product));

    const engineClaimIds = new Set(engineClaims.map((c) => c.id));
    const allEvidence = Array.from(ctx.evidence.byId.values());
    const engineEvidence = allEvidence.filter((ev) =>
      ev.supportsClaims.some((clmId) => engineClaimIds.has(clmId)),
    );

    this.checkCapabilityEvidenceMapping(engineClaims, engineEvidence, findings);
    this.checkMaturityClaimsDerived(engineClaims, allEvidence, findings);

    const status: 'pass' | 'fail' = findings.length === 0 ? 'pass' : 'fail';

    return {
      ruleId: this.id,
      name: this.name,
      status,
      severity: this.severity,
      blocking: this.blocking,
      findings:
        findings.length > 0
          ? findings
          : ['All Engine products have canonical capability evidence mapping'],
      duration: 0,
    };
  }

  private checkCapabilityEvidenceMapping(
    engineClaims: Claim[],
    engineEvidence: Evidence[],
    findings: string[],
  ): void {
    const capabilitiesToClaims = new Map<string, Claim[]>();

    for (const claim of engineClaims) {
      const caps = claim.capabilities;
      if (caps === undefined || caps.length === 0) {
        continue;
      }

      for (const cap of caps) {
        const existing = capabilitiesToClaims.get(cap);
        if (existing !== undefined) {
          existing.push(claim);
        } else {
          capabilitiesToClaims.set(cap, [claim]);
        }
      }
    }

    for (const [cap, claimsForCap] of capabilitiesToClaims) {
      const supportingEvidence = engineEvidence.filter((ev) =>
        ev.supportsClaims.some((clmId) => claimsForCap.some((c) => c.id === clmId)),
      );

      if (supportingEvidence.length === 0) {
        findings.push(
          `Capability ${cap} has no supporting evidence across Engine products. Each capability must map to exactly one canonical EV.`,
        );
        continue;
      }

      if (supportingEvidence.length > 1) {
        const evIds = supportingEvidence.map((ev) => ev.id).join(', ');
        findings.push(
          `Capability ${cap} is supported by multiple evidence items [${evIds}]. Each capability must map to exactly one canonical EV.`,
        );
      }
    }

    for (const ev of engineEvidence) {
      const capTag = this.extractCapTag(ev);
      if (capTag !== null && !ev.reusable) {
        findings.push(
          `Capability evidence ${ev.id} for ${capTag} is not marked as reusable. Capability evidence for Engine products must be reusable.`,
        );
      }
    }
  }

  private checkMaturityClaimsDerived(
    engineClaims: Claim[],
    allEvidence: Evidence[],
    findings: string[],
  ): void {
    const maturityClaims = engineClaims.filter(
      (c) => c.dimension === 'Product Maturity',
    );

    for (const claim of maturityClaims) {
      const ownNonReusableEvidence = allEvidence.filter(
        (ev) =>
          ev.supportsClaims.includes(claim.id) && !ev.reusable,
      );

      if (ownNonReusableEvidence.length > 0) {
        const evIds = ownNonReusableEvidence.map((ev) => ev.id).join(', ');
        findings.push(
          `Claim ${claim.id} (Product Maturity) has dedicated non-reusable evidence [${evIds}]. Product Maturity must be a Derived Claim — it must reference multiple existing evidence items, not own a standalone EV.`,
        );
      }

      if (claim.evidenceRefs.length < 2) {
        const scope =
          ownNonReusableEvidence.length > 0
            ? 'standalone EV'
            : 'shallower than 2 evidence refs';
        findings.push(
          `Claim ${claim.id} (Product Maturity) has ${scope}. Maturity claims must reference multiple (≥2) evidence items to derive maturity from diverse sources.`,
        );
      }
    }

    const productTypeClaims = engineClaims.filter(
      (c) => c.type.startsWith('CR-MT'),
    );
    for (const claim of productTypeClaims) {
      if (claim.evidenceRefs.length <= 1) {
        findings.push(
          `Product-type claim ${claim.id} has only ${claim.evidenceRefs.length} evidence reference(s). Product claims must reference multiple evidence items.`,
        );
      }
    }
  }

  private extractCapTag(ev: Evidence): string | null {
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
