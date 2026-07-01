import type { GovernanceRegistries, Claim, Dimension } from '../types/entities';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

const VALID_DIMENSIONS: readonly Dimension[] = [
  'Implementation Reality',
  'Product Maturity',
  'Commercial Claim',
  'Strategic Intent',
];

const COMPLETENESS_THRESHOLD = 80;

export class ClaimsValidator {
  private registries: GovernanceRegistries;
  private context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
  }

  private get claimsList(): Claim[] {
    return this.context ? Array.from(this.context.claims.byId.values()) : this.registries.claims;
  }

  private get claimsCount(): number {
    return this.context ? this.context.claims.completenessStats.total : this.registries.claims.length;
  }

  validate(): ValidationResponse {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    const claims = this.claimsList;
    const total = this.claimsCount;

    results.push(this.validateCompleteness(claims, total));
    results.push(this.validateNoOrphans(claims, total));
    results.push(this.validateDimensionAssignment(claims, total));
    results.push(this.validateAuthorityAssignment(claims, total));

    const passed = results.filter((r) => r.status === 'pass').length;
    const failed = results.filter((r) => r.status === 'fail').length;
    const warnings = results.filter((r) => r.status === 'warn').length;

    return {
      status: failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
      summary: { total: results.length, passed, failed, warnings },
      results,
      metadata: {
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        engineVersion: 'M2 v1.2',
        baselineVersion: 'M2 v1.2',
      },
    };
  }

  private validateCompleteness(claims: Claim[], total: number): ValidationResult {
    const failedClaims: Claim[] = [];
    for (const claim of claims) {
      if (claim.completeness < COMPLETENESS_THRESHOLD) {
        failedClaims.push(claim);
      }
    }

    const findings = failedClaims.map(
      (c) => `Claim ${c.id}: completeness=${c.completeness}% (minimum ${COMPLETENESS_THRESHOLD}%)`,
    );

    return {
      id: 'CLM-COMPLETENESS',
      name: 'Claim Completeness Check',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Evaluated ${total} claims; ${findings.length} below ${COMPLETENESS_THRESHOLD}% threshold`,
      findings,
      suggestedFix:
        findings.length > 0
          ? `Update completeness scores to >= ${COMPLETENESS_THRESHOLD}% for flagged claims`
          : undefined,
    };
  }

  private validateNoOrphans(claims: Claim[], total: number): ValidationResult {
    const orphanClaims: Claim[] = [];
    for (const claim of claims) {
      if (claim.evidenceRefs.length === 0) {
        orphanClaims.push(claim);
      }
    }

    const findings = orphanClaims.map((c) => `Claim ${c.id} has zero evidence references (orphan claim)`);

    return {
      id: 'CLM-NO-ORPHANS',
      name: 'Orphan Claim Detection',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'critical',
      details: `Scanned ${total} claims; ${findings.length} orphans without evidence`,
      findings,
      suggestedFix: findings.length > 0 ? 'Attach at least one evidence reference to each orphan claim' : undefined,
    };
  }

  private validateDimensionAssignment(claims: Claim[], total: number): ValidationResult {
    const invalidClaims: Claim[] = [];
    const dimensionSet = new Set<Dimension>(VALID_DIMENSIONS);

    for (const claim of claims) {
      if (!dimensionSet.has(claim.dimension)) {
        invalidClaims.push(claim);
      }
    }

    const findings = invalidClaims.map((c) => `Claim ${c.id}: unrecognized dimension "${c.dimension}"`);

    return {
      id: 'CLM-DIMENSION',
      name: 'Claim Dimension Assignment',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Inspected ${total} claims; ${findings.length} with invalid dimension`,
      findings,
      suggestedFix:
        findings.length > 0
          ? `Assign a valid dimension: ${VALID_DIMENSIONS.join(', ')}`
          : undefined,
    };
  }

  private validateAuthorityAssignment(claims: Claim[], total: number): ValidationResult {
    const missingAuth: Claim[] = [];
    for (const claim of claims) {
      if (claim.authorities.length === 0) {
        missingAuth.push(claim);
      }
    }

    const findings = missingAuth.map((c) => `Claim ${c.id} has no authorities assigned`);

    return {
      id: 'CLM-AUTHORITY',
      name: 'Claim Authority Assignment',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'critical',
      details: `Checked ${total} claims; ${findings.length} missing authority assignment`,
      findings,
      suggestedFix: findings.length > 0 ? 'Assign at least one authority (AUTH-*) to each claim' : undefined,
    };
  }
}
