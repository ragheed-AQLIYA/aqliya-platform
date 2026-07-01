/**
 * RB-02B Policy Registry
 *
 * The central registry for all authorization policies.
 * The Engine loads policies from this registry — it does NOT import them directly.
 *
 * Each policy is registered independently. The registry provides:
 * - Lookup by ID
 * - Lookup by Pipeline Stage
 * - Filter by status
 *
 * @see RB-02A v1.0 §8.3 — Policy Catalog
 */

import type { AuthorizationPolicy } from './types';
import { PipelineStage } from '../types';

export class PolicyRegistry {
  private readonly policies: Map<string, AuthorizationPolicy> = new Map();

  /**
   * Register a policy.
   * Throws if a policy with the same ID already exists.
   */
  register(policy: AuthorizationPolicy): void {
    if (this.policies.has(policy.id)) {
      throw new Error(
        `PolicyRegistry: duplicate policy ID "${policy.id}". ` +
        `Existing: "${this.policies.get(policy.id)!.name}". New: "${policy.name}".`,
      );
    }
    this.policies.set(policy.id, policy);
  }

  /**
   * Register multiple policies at once.
   */
  registerAll(policies: AuthorizationPolicy[]): void {
    for (const policy of policies) {
      this.register(policy);
    }
  }

  /**
   * Get a policy by ID.
   */
  get(id: string): AuthorizationPolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * Get all policies for a given pipeline stage, ordered by priority.
   */
  forStage(stage: PipelineStage): AuthorizationPolicy[] {
    return Array.from(this.policies.values())
      .filter((p) => p.stage === stage && p.status === 'active')
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all active policies.
   */
  allActive(): AuthorizationPolicy[] {
    return Array.from(this.policies.values())
      .filter((p) => p.status === 'active')
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all policies (including future/deprecated).
   */
  all(): AuthorizationPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get the count of registered policies.
   */
  get count(): number {
    return this.policies.size;
  }
}
