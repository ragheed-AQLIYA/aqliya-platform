// Governance Engine — Rule Scheduler
// Executes rules in phase order: structural → identity → integrity → pattern → historical

import { GovernanceRegistries } from '../types/entities';
import { RuleResult, RuleEngineReport, RuleId } from '../types/rules';
import { RuleContext, GovernanceRule } from './base-rule';
import { ExecutionContextBuilder } from '../context/builder';
import { ExecutionContext } from '../context/execution-context';

export class RuleEngine {
  private rules: Map<string, GovernanceRule> = new Map();
  private registries: GovernanceRegistries;
  private executionContext: ExecutionContext | null = null;

  constructor(registries: GovernanceRegistries, executionContext?: ExecutionContext) {
    this.registries = registries;
    if (executionContext) {
      this.executionContext = executionContext;
    }
  }

  register(rule: GovernanceRule): void {
    this.rules.set(rule.id, rule);
  }

  registerAll(rules: GovernanceRule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /** Build ExecutionContext once, reuse across all rules — CR-04 */
  private getContext(): ExecutionContext {
    if (!this.executionContext) {
      this.executionContext = ExecutionContextBuilder.build(this.registries);
    }
    return this.executionContext;
  }

  async executeAll(): Promise<RuleEngineReport> {
    const phaseOrder: GovernanceRule['phase'][] = ['structural', 'identity', 'integrity', 'pattern', 'historical'];
    const allResults: RuleResult[] = [];
    const startTime = Date.now();
    const ctx = this.getContext();

    for (const phase of phaseOrder) {
      const phaseRules = Array.from(this.rules.values())
        .filter(r => r.phase === phase)
        .sort((a, b) => a.id.localeCompare(b.id));

      for (const rule of phaseRules) {
        const ruleStart = Date.now();
        try {
          const ruleCtx: RuleContext = { registries: this.registries, extensions: {}, context: ctx };
          const result = await rule.validate(ruleCtx);
          result.duration = Date.now() - ruleStart;
          allResults.push(result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          allResults.push({
            ruleId: rule.id as RuleId,
            name: rule.name,
            status: 'error',
            severity: rule.severity,
            blocking: rule.blocking,
            findings: [`Rule execution error: ${message}`],
            duration: Date.now() - ruleStart,
          });
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    const passed = allResults.filter(r => r.status === 'pass').length;
    const failed = allResults.filter(r => r.status === 'fail').length;
    const warnings = allResults.filter(r => r.status === 'warn').length;
    const blocked = allResults.some(r => r.status === 'fail' && r.blocking);
    const blockReasons = allResults
      .filter(r => r.status === 'fail' && r.blocking)
      .map(r => `${r.ruleId}: ${r.name}`);

    return {
      rules: allResults,
      summary: { total: allResults.length, passed, failed, warnings, blocked, blockReasons },
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      baselineVersion: 'M2 v1.2',
    };
  }

  async executeRules(ruleIds: string[]): Promise<RuleEngineReport> {
    const allResults: RuleResult[] = [];
    const startTime = Date.now();
    const ctx = this.getContext();

    for (const ruleId of ruleIds) {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        allResults.push({
          ruleId: ruleId as RuleId,
          name: `Unknown Rule: ${ruleId}`,
          status: 'error',
          severity: 'high',
          blocking: false,
          findings: [`Rule ${ruleId} not registered`],
          duration: 0,
        });
        continue;
      }

      const ruleStart = Date.now();
      try {
        const ruleCtx: RuleContext = { registries: this.registries, extensions: {}, context: ctx };
        const result = await rule.validate(ruleCtx);
        result.duration = Date.now() - ruleStart;
        allResults.push(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        allResults.push({
          ruleId: rule.id as RuleId,
          name: rule.name,
          status: 'error',
          severity: rule.severity,
          blocking: rule.blocking,
          findings: [`Execution error: ${message}`],
          duration: Date.now() - ruleStart,
        });
      }
    }

    return {
      rules: allResults,
      summary: {
        total: allResults.length,
        passed: allResults.filter(r => r.status === 'pass').length,
        failed: allResults.filter(r => r.status === 'fail').length,
        warnings: allResults.filter(r => r.status === 'warn').length,
        blocked: allResults.some(r => r.status === 'fail' && r.blocking),
        blockReasons: allResults.filter(r => r.status === 'fail' && r.blocking).map(r => `${r.ruleId}: ${r.name}`),
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      baselineVersion: 'M2 v1.2',
    };
  }

  getRegisteredRuleIds(): string[] {
    return Array.from(this.rules.keys()).sort();
  }
}
