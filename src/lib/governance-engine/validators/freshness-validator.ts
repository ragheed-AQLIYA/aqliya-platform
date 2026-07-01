import { GovernanceRegistries } from '../types/entities';
import { isExpired, daysUntilExpiry } from '../shared/date';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

export interface FreshnessThresholds {
  expiringDays: number;
}

export const DEFAULT_THRESHOLDS: FreshnessThresholds = {
  expiringDays: 30,
};

export class FreshnessValidator {
  private readonly registries: GovernanceRegistries;
  private readonly thresholds: FreshnessThresholds;
  private readonly context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext, thresholds?: Partial<FreshnessThresholds>) {
    this.registries = registries;
    this.context = context;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  private get evidenceList(): import('../types/entities').Evidence[] {
    return this.context ? Array.from(this.context.evidence.byId.values()) : this.registries.evidence;
  }

  validate(): ValidationResponse {
    const startTime = performance.now();
    const results: ValidationResult[] = [];

    const fresh: string[] = [];
    const expiring: string[] = [];
    const expired: string[] = [];
    const missingExpiry: string[] = [];

    for (const ev of this.evidenceList) {
      if (!ev.freshness.expires) {
        missingExpiry.push(ev.id);
        continue;
      }

      const expires = ev.freshness.expires;
      const daysLeft = daysUntilExpiry(expires);
      const alreadyExpired = isExpired(expires);

      if (alreadyExpired) {
        expired.push(ev.id);
      } else if (daysLeft <= this.thresholds.expiringDays) {
        expiring.push(ev.id);
      } else {
        fresh.push(ev.id);
      }
    }

    if (expired.length > 0) {
      results.push({
        id: 'freshness-expired-evidence',
        name: 'Expired Evidence',
        status: 'fail',
        severity: 'high',
        details: `${expired.length} evidence records have passed their expiry date.`,
        findings: expired.map(id => `Evidence ${id} expired on ${this.getExpiryDate(id)}.`),
        suggestedFix: 'Review each expired evidence item. Either refresh the evidence with a new expiry date or mark it as superseded if no longer relevant.',
      });
    }

    if (expiring.length > 0) {
      results.push({
        id: 'freshness-expiring-evidence',
        name: 'Expiring Evidence',
        status: 'warn',
        severity: 'medium',
        details: `${expiring.length} evidence records will expire within ${this.thresholds.expiringDays} days.`,
        findings: expiring.map(id => {
          const days = daysUntilExpiry(this.getExpiryDate(id));
          return `Evidence ${id} expires in ${days} day(s) on ${this.getExpiryDate(id)}.`;
        }),
        suggestedFix: `Schedule review and refresh for each expiring evidence item before the ${this.thresholds.expiringDays}-day window closes.`,
      });
    }

    if (fresh.length > 0) {
      results.push({
        id: 'freshness-fresh-evidence',
        name: 'Fresh Evidence',
        status: 'pass',
        severity: 'low',
        details: `${fresh.length} evidence records are fresh (expiry > ${this.thresholds.expiringDays} days).`,
        findings: [],
      });
    }

    if (missingExpiry.length > 0) {
      results.push({
        id: 'freshness-missing-expiry',
        name: 'Evidence Without Expiry',
        status: 'warn',
        severity: 'medium',
        details: `${missingExpiry.length} evidence records are missing an expiry date.`,
        findings: missingExpiry.map(id => `Evidence ${id} has no expiry date set in freshness.expires.`),
        suggestedFix: 'Set a valid ISO date string for the freshness.expires field on each evidence record.',
      });
    }

    return this.buildResponse(results, startTime);
  }

  private getExpiryDate(evidenceId: string): string {
    if (this.context) {
      const ev = this.context.evidence.byId.get(evidenceId);
      return ev?.freshness.expires ?? 'unknown';
    }
    const ev = this.registries.evidence.find(e => e.id === evidenceId);
    return ev?.freshness.expires ?? 'unknown';
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
