import type { GovernanceRegistries } from '../types/entities';
import { RelationshipResolver } from '../resolver/relationship-resolver';
import type { RelationshipValidationResult } from '../types/relationships';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

type ResultSeverity = ValidationResult['severity'];

function mapSeverity(violationCount: number): ResultSeverity {
  if (violationCount >= 5) {
    return 'critical';
  }
  if (violationCount >= 1) {
    return 'high';
  }
  return 'low';
}

export class RelationshipsValidator {
  private registries: GovernanceRegistries;
  private context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
  }

  validate(): ValidationResponse {
    const startTime = Date.now();

    const resolver = new RelationshipResolver(this.registries);
    const resolverResults = resolver.validateAll();

    const results: ValidationResult[] = resolverResults.map((rr) =>
      this.toValidationResult(rr),
    );

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

  private toValidationResult(rr: RelationshipValidationResult): ValidationResult {
    const hasViolations = rr.violations.length > 0;
    const isStructural = ['C01', 'C04', 'C05', 'C06', 'C07', 'C10'].includes(rr.relationshipId);

    return {
      id: `REL-${rr.relationshipId}`,
      name: `Relationship ${rr.relationshipId} — ${rr.expected} Cardinality Check`,
      status: hasViolations ? 'fail' : 'pass',
      severity: mapSeverity(rr.violations.length),
      details: `${rr.relationshipId}: expected ${rr.expected} (source=${rr.sourceCount}, target=${rr.targetCount}) — ${hasViolations ? rr.violations.length + ' violation(s)' : 'valid'}`,
      findings: hasViolations ? rr.violations : [`Relationship ${rr.relationshipId} passes all constraints`],
      suggestedFix:
        hasViolations && isStructural
          ? `Resolve ${rr.relationshipId} violations: ${rr.violations[0]}`
          : undefined,
    };
  }
}
