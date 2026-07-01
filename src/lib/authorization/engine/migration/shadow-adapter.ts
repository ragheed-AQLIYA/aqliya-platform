/**
 * RB-02B Migration Shadow Adapter
 *
 * Enables parallel execution of legacy guards and the new Authorization Engine.
 * Used during W4A (Shadow Mode) and W4B (Dual Decision) migration phases.
 *
 * Design:
 * - Legacy guard executes FIRST (production behavior unchanged)
 * - New engine executes SECOND (shadow mode — result recorded, not used)
 * - Results are compared and logged
 * - No production code depends on the new engine
 *
 * Migration phases:
 *   W4A: Shadow — legacy decides, engine shadows, log differences
 *   W4B: Dual   — both decide, compare, alert on mismatch
 *   W4C: Cutover — engine decides, legacy fallback
 *
 * @see MIGRATION_PARITY_PLAN.md
 */

import { AuthorizationEngine } from '../engine';
import { createHandlersFromRegistry, createDefaultRegistry } from '../policies';
import { Decision } from '../types';
import type { AuthorizationRequest, AuthorizationDecision } from '../types';

/**
 * Result of a single shadow comparison.
 */
export interface ShadowComparison {
  /** The action being authorized */
  action: string;
  /** The legacy guard's decision (true = allowed, false = denied) */
  legacyDecision: boolean;
  /** The new engine's decision */
  engineDecision: Decision;
  /** Whether the decisions match */
  isMatch: boolean;
  /** The engine's trace for analysis */
  engineTrace?: string;
  /** Timestamp of the comparison */
  timestamp: string;
}

/**
 * Parity statistics for a batch of comparisons.
 */
export interface ParityStats {
  totalComparisons: number;
  matches: number;
  mismatches: number;
  parityPercentage: number;
  mismatches_: ShadowComparison[];
  engineErrors: number;
}

/**
 * Shadow Mode Adapter
 *
 * Runs legacy guard and new engine side-by-side.
 * Legacy guard's decision is authoritative — engine result is shadowed.
 */
export class ShadowAdapter {
  private engine: AuthorizationEngine;
  private comparisons: ShadowComparison[] = [];
  private engineErrorCount = 0;
  private featureFlag = false;

  private constructor(engine: AuthorizationEngine) {
    this.engine = engine;
  }

  /**
   * Create a ShadowAdapter with a default engine and policies.
   */
  static async create(): Promise<ShadowAdapter> {
    const registry = createDefaultRegistry();
    const handlers = createHandlersFromRegistry(registry);
    const engine = new AuthorizationEngine();
    engine.registerStages(handlers);
    engine.initialize();
    return new ShadowAdapter(engine);
  }

  /**
   * Enable/disable the new engine evaluation (feature flag).
   * When disabled, only the legacy guard runs.
   */
  setEnabled(enabled: boolean): void {
    this.featureFlag = enabled;
  }

  /**
   * Run a shadow comparison.
   *
   * @param legacyFn The legacy guard function to call
   * @param request The authorization request for the new engine
   * @returns The legacy guard's result (production behavior unchanged)
   */
  async shadow<T>(
    legacyFn: () => Promise<T>,
    request: AuthorizationRequest,
  ): Promise<T> {
    // 1. Execute legacy guard (production path)
    const legacyResult = await legacyFn();

    // 2. Execute new engine (shadow mode — only if feature flag enabled)
    if (this.featureFlag) {
      try {
        const engineResult = await this.engine.authorize(request);
        const comparison: ShadowComparison = {
          action: request.action,
          legacyDecision: legacyResult !== null && legacyResult !== undefined,
          engineDecision: engineResult.decision,
          isMatch: this.compareDecisions(legacyResult, engineResult),
          engineTrace: JSON.stringify(engineResult.trace),
          timestamp: new Date().toISOString(),
        };

        this.comparisons.push(comparison);
      } catch {
        this.engineErrorCount++;
      }
    }

    // 3. Always return legacy result
    return legacyResult;
  }

  /**
   * Get parity statistics for all comparisons so far.
   */
  getParityStats(): ParityStats {
    const mismatches = this.comparisons.filter((c) => !c.isMatch);
    const total = this.comparisons.length;

    return {
      totalComparisons: total,
      matches: total - mismatches.length,
      mismatches: mismatches.length,
      parityPercentage: total > 0
        ? Math.round(((total - mismatches.length) / total) * 10000) / 100
        : 0,
      mismatches_: mismatches,
      engineErrors: this.engineErrorCount,
    };
  }

  /**
   * Check if parity has reached the target threshold.
   */
  hasReachedParity(targetPercent: number = 99): boolean {
    const stats = this.getParityStats();
    return stats.parityPercentage >= targetPercent;
  }

  /**
   * Clear all comparison history.
   */
  reset(): void {
    this.comparisons = [];
    this.engineErrorCount = 0;
  }

  /**
   * Compare legacy and engine decisions.
   * Returns true if they agree on the action outcome.
   */
  private compareDecisions(
    legacyResult: unknown,
    engineResult: AuthorizationDecision,
  ): boolean {
    const legacyAllowed = legacyResult !== null
      && legacyResult !== undefined
      && legacyResult !== false;

    const engineAllowed = engineResult.decision === Decision.ALLOW
      || engineResult.decision === Decision.READ_ONLY;

    return legacyAllowed === engineAllowed;
  }
}
