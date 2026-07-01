import { GovernanceRegistries } from '../types/entities';
import { ChainResolver } from '../resolver/chain-resolver';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

export class IntegrityValidator {
  private readonly chainResolver: ChainResolver;
  private readonly registries: GovernanceRegistries;
  private readonly context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
    this.chainResolver = new ChainResolver(registries);
  }

  validate(): ValidationResponse {
    const startTime = performance.now();
    const results: ValidationResult[] = [];
    const ctx = this.context;

    if (ctx) {
      // ── Evidence Chain Completeness (from context chains) ──
      const brokenChains = ctx.chains.broken;
      const totalChains = ctx.chains.complete + ctx.chains.broken;

      if (brokenChains === 0) {
        results.push(this.makeResult(
          'integrity-evidence-chain',
          'Evidence Chain Completeness',
          'pass',
          'low',
          `All ${totalChains} claim evidence chains are complete.`,
          [],
        ));
      } else {
        const brokenEntries: string[] = [];
        for (const [claimId, info] of ctx.chains.byClaim) {
          if (!info.complete) {
            brokenEntries.push(`Claim ${claimId}: chain broken at ${info.brokenAt ?? 'unknown step'}`);
          }
        }

        const severity: ValidationResult['severity'] = brokenEntries.length <= 2 ? 'medium' : 'high';
        results.push(this.makeResult(
          'integrity-evidence-chain',
          'Evidence Chain Completeness',
          'fail',
          severity,
          `${brokenChains} of ${totalChains} claim evidence chains are broken.`,
          brokenEntries,
          'Review the brokenAt field for each chain and ensure all Evidence, Source, and Document references resolve.',
        ));
      }

      // ── Chain Depth (from context metrics) ──
      const averageDepth = ctx.chains.avgDepth;

      results.push(this.makeResult(
        'integrity-chain-depth',
        'Average Chain Depth',
        averageDepth >= 2 ? 'pass' : 'warn',
        'low',
        `Average evidence chain depth is ${averageDepth.toFixed(2)}.`,
        averageDepth < 2
          ? [`Average chain depth (${averageDepth.toFixed(2)}) is below minimum expected depth of 2. Claims may lack sufficient evidence depth.`]
          : [],
        averageDepth < 2 ? 'Add additional evidence layers to shallow claims to increase chain depth to at least 2.' : undefined,
      ));

      // ── Dangling Evidence (evidence referencing missing sources) ──
      const danglingEvidence: string[] = [];
      for (const ev of ctx.evidence.byId.values()) {
        if (!ctx.sources.byId.has(ev.sourceRef)) {
          danglingEvidence.push(ev.id);
        }
      }

      if (danglingEvidence.length > 0) {
        results.push(this.makeResult(
          'integrity-dangling-evidence',
          'Dangling Evidence References',
          'fail',
          'high',
          `${danglingEvidence.length} evidence records reference missing sources.`,
          danglingEvidence.map(id => `Evidence ${id} references source which does not exist.`),
          'Create the missing Source records or update the sourceRef field on each dangling evidence item.',
        ));
      }

      // ── Unreferenced Claims (from context index) ──
      const unreferencedClaims = ctx.claims.withoutEvidence;

      if (unreferencedClaims.length > 0) {
        results.push(this.makeResult(
          'integrity-unreferenced-claims',
          'Claims Without Evidence',
          'warn',
          'medium',
          `${unreferencedClaims.length} claims have zero evidence references.`,
          unreferencedClaims.map(c => `Claim ${c.id} ("${c.claimText.slice(0, 60)}") has no evidence.`),
          'Attach at least one evidence reference to each claim, or mark the claim as stale/superseded if no longer applicable.',
        ));
      }
    } else {
      // ── Fallback: use ChainResolver and raw registries ──
      const chainResult = this.chainResolver.validateAllChains();

      const brokenClaims = chainResult.chains.filter(c => !c.complete);

      if (brokenClaims.length === 0) {
        results.push(this.makeResult(
          'integrity-evidence-chain',
          'Evidence Chain Completeness',
          'pass',
          'low',
          `All ${chainResult.totalChains} claim evidence chains are complete.`,
          [],
        ));
      } else {
        const findings = brokenClaims.map(c =>
          `Claim ${c.claimId}: chain broken at ${c.brokenAt ?? 'unknown step'}`
        );

        const severity: ValidationResult['severity'] = findings.length <= 2 ? 'medium' : 'high';
        results.push(this.makeResult(
          'integrity-evidence-chain',
          'Evidence Chain Completeness',
          'fail',
          severity,
          `${brokenClaims.length} of ${chainResult.totalChains} claim evidence chains are broken.`,
          findings,
          'Review the brokenAt field for each chain and ensure all Evidence, Source, and Document references resolve.',
        ));
      }

      const averageDepth = this.chainResolver.getAverageChainDepth();

      results.push(this.makeResult(
        'integrity-chain-depth',
        'Average Chain Depth',
        averageDepth >= 2 ? 'pass' : 'warn',
        'low',
        `Average evidence chain depth is ${averageDepth.toFixed(2)}.`,
        averageDepth < 2
          ? [`Average chain depth (${averageDepth.toFixed(2)}) is below minimum expected depth of 2. Claims may lack sufficient evidence depth.`]
          : [],
        averageDepth < 2 ? 'Add additional evidence layers to shallow claims to increase chain depth to at least 2.' : undefined,
      ));

      const danglingEvidence = this.registries.evidence.filter(
        ev => !this.registries.sources.some(s => s.id === ev.sourceRef)
      );

      if (danglingEvidence.length > 0) {
        results.push(this.makeResult(
          'integrity-dangling-evidence',
          'Dangling Evidence References',
          'fail',
          'high',
          `${danglingEvidence.length} evidence records reference missing sources.`,
          danglingEvidence.map(ev => `Evidence ${ev.id} references source "${ev.sourceRef}" which does not exist.`),
          'Create the missing Source records or update the sourceRef field on each dangling evidence item.',
        ));
      }

      const unreferencedClaims = this.registries.claims.filter(
        clm => clm.evidenceRefs.length === 0
      );

      if (unreferencedClaims.length > 0) {
        results.push(this.makeResult(
          'integrity-unreferenced-claims',
          'Claims Without Evidence',
          'warn',
          'medium',
          `${unreferencedClaims.length} claims have zero evidence references.`,
          unreferencedClaims.map(c => `Claim ${c.id} ("${c.claimText.slice(0, 60)}") has no evidence.`),
          'Attach at least one evidence reference to each claim, or mark the claim as stale/superseded if no longer applicable.',
        ));
      }
    }

    return this.buildResponse(results, startTime);
  }

  private makeResult(
    id: string,
    name: string,
    status: ValidationResult['status'],
    severity: ValidationResult['severity'],
    details: string,
    findings: string[],
    suggestedFix?: string,
  ): ValidationResult {
    return { id, name, status, severity, details, findings, suggestedFix };
  }

  private buildResponse(results: ValidationResult[], startTime: number): ValidationResponse {
    const total = results.length;
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warn').length;

    return {
      status: failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
      summary: { total, passed, failed, warnings },
      results,
      metadata: {
        duration: performance.now() - startTime,
        timestamp: new Date().toISOString(),
        engineVersion: '1.0.0',
        baselineVersion: 'M2 v1.2',
      },
    };
  }
}
