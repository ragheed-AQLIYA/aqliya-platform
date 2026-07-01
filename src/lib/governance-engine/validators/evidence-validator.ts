import type { GovernanceRegistries, Evidence, Tier, EvidenceQuality } from '../types/entities';
import { isExpired } from '../shared/date';
import type { ValidationResponse, ValidationResult } from './types';
import type { ExecutionContext } from '../context/execution-context';

const VALID_TIERS: readonly Tier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const VALID_STRENGTHS: readonly EvidenceQuality[] = ['Strong', 'Moderate', 'Weak'];

export class EvidenceValidator {
  private registries: GovernanceRegistries;
  private context?: ExecutionContext;

  constructor(registries: GovernanceRegistries, context?: ExecutionContext) {
    this.registries = registries;
    this.context = context;
  }

  private get evidenceList(): Evidence[] {
    return this.context ? Array.from(this.context.evidence.byId.values()) : this.registries.evidence;
  }

  private get evidenceCount(): number {
    return this.context ? this.context.evidence.freshnessStats.total : this.registries.evidence.length;
  }

  validate(): ValidationResponse {
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    const evList = this.evidenceList;
    const evTotal = this.evidenceCount;

    results.push(this.validateTierAssignment(evList, evTotal));
    results.push(this.validateQuality(evList, evTotal));
    results.push(this.validateFreshness(evList, evTotal));
    results.push(this.validateNoOrphans(evTotal));

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

  private validateTierAssignment(evList: Evidence[], total: number): ValidationResult {
    const tierSet = new Set<Tier>(VALID_TIERS);
    const invalid: Evidence[] = [];

    for (const ev of evList) {
      if (!tierSet.has(ev.tier)) {
        invalid.push(ev);
      }
    }

    const findings = invalid.map((e) => `Evidence ${e.id}: invalid tier "${e.tier}"`);

    return {
      id: 'EV-TIER',
      name: 'Evidence Tier Assignment',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Checked ${total} evidence items; ${findings.length} with invalid tier`,
      findings,
      suggestedFix:
        findings.length > 0
          ? `Assign a valid tier: ${VALID_TIERS.join(', ')}`
          : undefined,
    };
  }

  private validateQuality(evList: Evidence[], total: number): ValidationResult {
    const strengthSet = new Set<EvidenceQuality>(VALID_STRENGTHS);
    const invalid: Evidence[] = [];

    for (const ev of evList) {
      if (!strengthSet.has(ev.strength)) {
        invalid.push(ev);
      }
    }

    const findings = invalid.map((e) => `Evidence ${e.id}: invalid strength "${e.strength}"`);

    return {
      id: 'EV-QUALITY',
      name: 'Evidence Quality (Strength) Check',
      status: findings.length === 0 ? 'pass' : 'fail',
      severity: 'high',
      details: `Evaluated ${total} evidence items; ${findings.length} with invalid strength`,
      findings,
      suggestedFix:
        findings.length > 0
          ? `Set a valid strength: ${VALID_STRENGTHS.join(', ')}`
          : undefined,
    };
  }

  private validateFreshness(evList: Evidence[], total: number): ValidationResult {
    const now = new Date();
    const expired: Evidence[] = [];
    const expiringSoon: Evidence[] = [];

    for (const ev of evList) {
      try {
        if (isExpired(ev.freshness.expires, now)) {
          expired.push(ev);
        }
      } catch {
        expiringSoon.push(ev);
        continue;
      }

      const daysUntilExpiry = this.daysUntil(ev.freshness.expires, now);
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        expiringSoon.push(ev);
      }
    }

    const findings: string[] = [];
    for (const e of expired) {
      findings.push(`Evidence ${e.id}: expired on ${e.freshness.expires}`);
    }
    for (const e of expiringSoon) {
      if (!expired.includes(e)) {
        const days = this.daysUntil(e.freshness.expires, now);
        findings.push(`Evidence ${e.id}: expires in ${days} day(s) on ${e.freshness.expires}`);
      }
    }

    const status = expired.length > 0 ? 'fail' : expiringSoon.length > 0 ? 'warn' : 'pass';

    return {
      id: 'EV-FRESHNESS',
      name: 'Evidence Freshness Check',
      status,
      severity: 'medium',
      details: `Checked ${total} evidence items; ${expired.length} expired, ${expiringSoon.length} expiring within 30 days`,
      findings,
      suggestedFix:
        expired.length > 0 || expiringSoon.length > 0
          ? 'Renew evidence freshness dates or archive stale evidence'
          : undefined,
    };
  }

  private validateNoOrphans(total: number): ValidationResult {
    const orphanEvidence: Evidence[] = [];
    const ctx = this.context;

    if (ctx) {
      for (const ev of ctx.evidence.orphaned) {
        if (ev.supportsClaims.length === 0) {
          orphanEvidence.push(ev);
        }
      }
    } else {
      const claimEvidenceRefs = new Set<string>();
      for (const claim of this.registries.claims) {
        for (const ref of claim.evidenceRefs) {
          claimEvidenceRefs.add(ref);
        }
      }
      for (const ev of this.registries.evidence) {
        if (!claimEvidenceRefs.has(ev.id) && ev.supportsClaims.length === 0) {
          orphanEvidence.push(ev);
        }
      }
    }

    const findings = orphanEvidence.map((e) => `Evidence ${e.id}: not referenced by any claim (orphan)`);

    return {
      id: 'EV-NO-ORPHANS',
      name: 'Orphan Evidence Detection',
      status: findings.length === 0 ? 'pass' : 'warn',
      severity: 'low',
      details: `Scanned ${total} evidence items; ${findings.length} orphaned`,
      findings,
      suggestedFix:
        findings.length > 0
          ? 'Link orphan evidence to a claim or archive if no longer relevant'
          : undefined,
    };
  }

  private daysUntil(expires: string, now: Date): number {
    const expiry = new Date(expires);
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
