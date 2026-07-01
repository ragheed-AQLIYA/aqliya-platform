import { GovernanceRegistries } from '../types/entities';
import { RuleEngine } from '../rules/engine';
import {
  GR001Rule,
  GR002Rule,
  GR003Rule,
  GR004Rule,
  GR005Rule,
  GR006Rule,
  GR007Rule,
  GR008Rule,
  GR009Rule,
  GR010Rule,
  GR011Rule,
  GR012Rule,
  GR013Rule,
} from '../rules';
import { IntegrityValidator } from './integrity-validator';
import { FreshnessValidator } from './freshness-validator';
import { FreezeValidator } from './freeze-validator';
import { DecisionsValidator } from './decisions-validator';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';
import { ExecutionContextBuilder } from '../context/builder';

export class GovernanceValidator {
  private readonly registries: GovernanceRegistries;
  private readonly context: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context ?? ExecutionContextBuilder.build(registries);
  }

  async validate(): Promise<ValidationResponse> {
    const startTime = performance.now();
    const allResults: ValidationResult[] = [];

    const ruleResults = await this.executeRules();
    allResults.push(...ruleResults);

    const validatorResults = this.executeValidators();
    allResults.push(...validatorResults);

    const total = allResults.length;
    const passed = allResults.filter(r => r.status === 'pass').length;
    const failed = allResults.filter(r => r.status === 'fail').length;
    const warnings = allResults.filter(r => r.status === 'warn').length;

    return {
      status: failed > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
      summary: { total, passed, failed, warnings },
      results: allResults,
      metadata: {
        duration: performance.now() - startTime,
        timestamp: new Date().toISOString(),
        engineVersion: '1.0.0',
        baselineVersion: 'M2 v1.2',
      },
    };
  }

  private async executeRules(): Promise<ValidationResult[]> {
    const engine = new RuleEngine(this.registries, this.context);

    engine.registerAll([
      new GR001Rule(),
      new GR002Rule(),
      new GR003Rule(),
      new GR004Rule(),
      new GR005Rule(),
      new GR006Rule(),
      new GR007Rule(),
      new GR008Rule(),
      new GR009Rule(),
      new GR010Rule(),
      new GR011Rule(),
      new GR012Rule(),
      new GR013Rule(),
    ]);

    const ruleReport = await engine.executeAll();

    return ruleReport.rules.map(r => ({
      id: `rule-${r.ruleId}`,
      name: r.name,
      status: r.status as ValidationResult['status'],
      severity: r.severity as ValidationResult['severity'],
      details: r.details ?? `${r.name}: ${r.status} (blocking: ${r.blocking})`,
      findings: r.findings,
      suggestedFix: r.status === 'fail' ? `Rule ${r.ruleId} requires resolution before proceeding.` : undefined,
      // v2 fields
      ruleId: r.ruleId,
      documentationLink: r.ruleId ? `#governance-rules-${r.ruleId.toLowerCase()}` : undefined,
      validatorVersion: '1.0.0',
    }));
  }

  private executeValidators(): ValidationResult[] {
    const allResults: ValidationResult[] = [];
    const ctx = this.context;

    const integrityValidator = new IntegrityValidator(this.registries, ctx);
    const integrityResult = integrityValidator.validate();
    allResults.push(...integrityResult.results.map(r => ({
      ...r,
      validatorVersion: '1.0.0',
      documentationLink: '#validators-integrity',
    })));

    const freshnessValidator = new FreshnessValidator(this.registries, ctx);
    const freshnessResult = freshnessValidator.validate();
    allResults.push(...freshnessResult.results.map(r => ({
      ...r,
      validatorVersion: '1.0.0',
      documentationLink: '#validators-freshness',
    })));

    const freezeValidator = new FreezeValidator(this.registries, ctx);
    const freezeResult = freezeValidator.validate();
    allResults.push(...freezeResult.results.map(r => ({
      ...r,
      validatorVersion: '1.0.0',
      documentationLink: '#validators-freeze',
    })));

    const decisionsValidator = new DecisionsValidator(this.registries, ctx);
    const decisionsResult = decisionsValidator.validate();
    allResults.push(...decisionsResult.results.map(r => ({
      ...r,
      validatorVersion: '1.0.0',
      documentationLink: '#validators-decisions',
    })));

    return allResults;
  }
}
