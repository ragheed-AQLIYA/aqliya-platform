import { GovernanceRule, RuleContext } from './base-rule';
import { RuleResult } from '../types/rules';
import { Claim, Decision, Authority } from '../types/entities';

export class GR012Rule implements GovernanceRule {
  readonly id = 'GR-012';
  readonly name = 'Historical Consistency Preservation';
  readonly phase = 'historical' as const;
  readonly severity = 'high' as const;
  readonly blocking = true;

  validate(context: RuleContext): RuleResult {
    const findings: string[] = [];
    const ctx = context.context;

    const allClaims = Array.from(ctx.claims.byId.values());
    const allDecisions = Array.from(ctx.decisions.byId.values());
    const allAuthorities = Array.from(ctx.authorities.byId.values());

    this.checkHistoricalContradictionIds(allClaims, findings);
    this.checkSupersededByChain(allClaims, allDecisions, allAuthorities, findings, ctx);
    this.checkTimelineRebuildable(allClaims, allDecisions, allAuthorities, findings, ctx);

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
          : [
              'Historical consistency is intact — all HC-IDs present, SupersededBy chains complete, timeline rebuildable',
            ],
      duration: 0,
    };
  }

  private checkHistoricalContradictionIds(
    claims: Claim[],
    findings: string[],
  ): void {
    const claimsWithHistory = claims.filter(
      (c) => c.historicalRefs !== undefined && c.historicalRefs.length > 0,
    );

    for (const claim of claimsWithHistory) {
      const refs = claim.historicalRefs!;

      const invalidRefs = refs.filter(
        (ref) => !/^HC-[A-Z]+-\d{3}$/.test(ref),
      );

      if (invalidRefs.length > 0) {
        findings.push(
          `Claim ${claim.id} has invalid historicalRefs: [${invalidRefs.join(', ')}]. All HC entries must match pattern HC-{AREA}-{NNN}.`,
        );
      }
    }

    const claimsWithDecision = claims.filter(
      (c) => c.currentDecision !== undefined,
    );

    for (const claim of claimsWithDecision) {
      const refs = claim.historicalRefs ?? [];
      if (refs.length === 0) {
        findings.push(
          `Claim ${claim.id} has a currentDecision (${claim.currentDecision}) but no historical contradiction IDs (HC-IDs). Claims involved in decisions should carry historicalRefs documenting the contradiction chain.`,
        );
      }
    }
  }

  private checkSupersededByChain(
    claims: Claim[],
    decisions: Decision[],
    authorities: Authority[],
    findings: string[],
    ctx: import('../context/execution-context').ExecutionContext,
  ): void {
    const allClaimIds = new Set(ctx.claims.byId.keys());
    const allDecisionIds = new Set(ctx.decisions.byId.keys());
    const allAuthorityIds = new Set(ctx.authorities.byId.keys());

    const allKnownIds = new Set<string>([
      ...allClaimIds,
      ...allDecisionIds,
      ...allAuthorityIds,
    ]);

    for (const decision of decisions) {
      if (decision.supersedes !== undefined) {
        if (!allKnownIds.has(decision.supersedes)) {
          findings.push(
            `Decision ${decision.id} claims to supersede "${decision.supersedes}" but no matching claim, decision, or authority ID exists. SupersededBy chain is broken.`,
          );
        }
      }

      if (decision.supersededBy !== undefined) {
        if (!allKnownIds.has(decision.supersededBy)) {
          findings.push(
            `Decision ${decision.id} claims to be supersededBy "${decision.supersededBy}" but the successor entity does not exist. SupersededBy chain is broken.`,
          );
        }
      }
    }

    for (const authority of authorities) {
      if (authority.supersedes !== undefined) {
        if (
          !allAuthorityIds.has(authority.supersedes) &&
          !allDecisionIds.has(authority.supersedes)
        ) {
          findings.push(
            `Authority ${authority.id} supersedes "${authority.supersedes}" but the target does not exist. Authority chain is inconsistent.`,
          );
        }
      }

      if (authority.supersededBy !== undefined) {
        if (
          !allAuthorityIds.has(authority.supersededBy) &&
          !allDecisionIds.has(authority.supersededBy)
        ) {
          findings.push(
            `Authority ${authority.id} is supersededBy "${authority.supersededBy}" but the successor does not exist. Authority chain is broken.`,
          );
        }
      }
    }

    const supersededClaims = claims.filter(
      (c) =>
        c.historicalRefs !== undefined &&
        c.historicalRefs.length > 0 &&
        c.currentDecision !== undefined,
    );

    for (const claim of supersededClaims) {
      const supersedingDecision = Array.from(ctx.decisions.byId.values()).find(
        (d) =>
          d.affectedClaims !== undefined &&
          d.affectedClaims.includes(claim.id),
      );

      if (supersedingDecision === undefined) {
        findings.push(
          `Claim ${claim.id} has historicalRefs and currentDecision but no decision references it in affectedClaims. SupersededBy chain requires a decision to document the supersession.`,
        );
      }
    }
  }

  private checkTimelineRebuildable(
    claims: Claim[],
    decisions: Decision[],
    authorities: Authority[],
    findings: string[],
    ctx: import('../context/execution-context').ExecutionContext,
  ): void {
    for (const decision of decisions) {
      if (this.isInvalidDate(decision.decisionDate)) {
        findings.push(
          `Decision ${decision.id} has an invalid decisionDate "${decision.decisionDate}". Timeline cannot be rebuilt without valid dates.`,
        );
      }

      for (const affectedClaimId of decision.affectedClaims) {
        const claim = ctx.claims.byId.get(affectedClaimId);
        if (claim !== undefined && this.isInvalidDate(claim.created)) {
          findings.push(
            `Decision ${decision.id} references claim ${affectedClaimId} which has an invalid created date "${claim.created}". Timeline rebuild requires valid dates.`,
          );
        }
      }
    }

    for (const authority of authorities) {
      if (authority.chainPosition < 0 || authority.chainPosition > 5) {
        findings.push(
          `Authority ${authority.id} has chainPosition ${authority.chainPosition} (valid range: 0-5). Authority chain timeline cannot be rebuilt.`,
        );
      }
    }

    const claimsWithHistory = claims.filter(
      (c) => c.historicalRefs !== undefined && c.historicalRefs.length > 0,
    );

    const decisionsWithSupersession = decisions.filter(
      (d) => d.supersedes !== undefined || d.supersededBy !== undefined,
    );

    if (claimsWithHistory.length > 0 && decisionsWithSupersession.length === 0) {
      findings.push(
        'Claims with historicalRefs exist but no decisions carry supersedes/supersededBy links. The historical chain is incomplete.',
      );
    }
  }

  private isInvalidDate(dateStr: string): boolean {
    return isNaN(new Date(dateStr).getTime());
  }
}
