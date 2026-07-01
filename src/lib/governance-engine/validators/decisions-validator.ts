import { GovernanceRegistries } from '../types/entities';
import { GR006Rule } from '../rules/gr-006-decision-preconditions';
import type { RuleContext } from '../rules/base-rule';
import { ExecutionContextBuilder } from '../context/builder';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

export class DecisionsValidator {
  private readonly registries: GovernanceRegistries;
  private readonly context: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context ?? ExecutionContextBuilder.build(registries);
  }

  validate(): ValidationResponse {
    const startTime = performance.now();
    const results: ValidationResult[] = [];

    results.push(this.checkPreconditions());
    results.push(this.checkStaleDecisions());
    results.push(this.checkDecisionCompleteness());

    return this.buildResponse(results, startTime);
  }

  private checkPreconditions(): ValidationResult {
    const gr006 = new GR006Rule();
    const execCtx = this.context;
    const context: RuleContext = { registries: this.registries, context: execCtx };
    const ruleResult = gr006.validate(context);

    if (ruleResult.status === 'pass') {
      return {
        id: 'decisions-preconditions',
        name: 'MAT Decision Preconditions',
        status: 'pass',
        severity: 'low',
        details: 'All MAT decisions satisfy GR-006 preconditions.',
        findings: [],
      };
    }

    const failedChecks = ruleResult.findings.filter(f =>
      f.includes('Precondition') && f.includes('failed')
    );
    const preconditionNames = new Set<string>();
    for (const f of failedChecks) {
      const match = f.match(/Precondition "([^"]+)"/);
      if (match) {
        preconditionNames.add(match[1]);
      }
    }

    return {
      id: 'decisions-preconditions',
      name: 'MAT Decision Preconditions',
      status: ruleResult.status === 'error' ? 'error' : 'fail',
      severity: 'critical',
      details: `${ruleResult.findings.length} precondition failure(s) found across MAT decisions.`,
      findings: ruleResult.findings,
      suggestedFix: preconditionNames.size > 0
        ? `Resolve failed preconditions: ${Array.from(preconditionNames).join(', ')}. Ensure manifests, dossiers, provenance, integrity, and reviews are complete before MAT decisions.`
        : 'Review all precondition failures and address each before proceeding with MAT decisions.',
    };
  }

  private checkStaleDecisions(): ValidationResult {
    const now = new Date();
    const staleDecisions = this.registries.decisions.filter(d => {
      if (d.status === 'Archived' || d.status === 'Superseded') {
        return false;
      }
      const reviewDate = new Date(d.reviewDate);
      return reviewDate < now;
    });

    if (staleDecisions.length === 0) {
      return {
        id: 'decisions-staleness',
        name: 'Stale Decisions',
        status: 'pass',
        severity: 'low',
        details: 'No stale decisions found. All non-archived decisions have future review dates.',
        findings: [],
      };
    }

    const pastDue = staleDecisions.filter(d => {
      const reviewDate = new Date(d.reviewDate);
      const diff = now.getTime() - reviewDate.getTime();
      return diff > 30 * 24 * 60 * 60 * 1000;
    });

    return {
      id: 'decisions-staleness',
      name: 'Stale Decisions',
      status: pastDue.length > 0 ? 'fail' : 'warn',
      severity: pastDue.length > 0 ? 'high' : 'medium',
      details: `${staleDecisions.length} decision(s) have passed their review date${pastDue.length > 0 ? `, ${pastDue.length} more than 30 days overdue` : ''}.`,
      findings: staleDecisions.map(d => {
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(d.reviewDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `Decision ${d.id} ("${d.title}") review date (${d.reviewDate}) was ${daysOverdue} day(s) ago. Status: ${d.status}.`;
      }),
      suggestedFix: 'Schedule review for each stale decision. Either reaffirm the decision and set a new reviewDate, or supersede it if no longer applicable.',
    };
  }

  private checkDecisionCompleteness(): ValidationResult {
    const incomplete: string[] = [];

    for (const d of this.registries.decisions) {
      if (!d.rationale || d.rationale.trim().length === 0) {
        incomplete.push(`${d.id}: missing rationale`);
      }
      if (!d.governingRule) {
        incomplete.push(`${d.id}: missing governingRule`);
      }
      if (!d.effectiveDate) {
        incomplete.push(`${d.id}: missing effectiveDate`);
      }
      if (!d.authority) {
        incomplete.push(`${d.id}: missing authority reference`);
      }
      if (!d.affectedClaims || d.affectedClaims.length === 0) {
        incomplete.push(`${d.id}: No affected claims`);
      }
      if (!d.evidenceReviewed || d.evidenceReviewed.length === 0) {
        incomplete.push(`${d.id}: no evidence reviewed`);
      }
    }

    if (incomplete.length === 0) {
      return {
        id: 'decisions-completeness',
        name: 'Decision Completeness',
        status: 'pass',
        severity: 'low',
        details: 'All decisions have required fields (rationale, governingRule, effectiveDate, authority, affectedClaims, evidenceReviewed).',
        findings: [],
      };
    }

    return {
      id: 'decisions-completeness',
      name: 'Decision Completeness',
      status: 'fail',
      severity: 'medium',
      details: `${incomplete.length} decision(s) are missing required fields.`,
      findings: incomplete.map(f => `Decision ${f}.`),
      suggestedFix: 'Populate all required fields: rationale, governingRule, effectiveDate, authority, affectedClaims, and evidenceReviewed for every decision.',
    };
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
