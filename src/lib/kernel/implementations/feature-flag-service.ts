import type { IFeatureFlagService, FeatureFlag, FlagVariant } from "../contracts/feature-flags";
import type { KernelResult } from "../types";

export class FeatureFlagServiceWrapper implements IFeatureFlagService {
  async isEnabled(key: string): Promise<boolean> {
    const { isEnabled } = await import("@/lib/platform/feature-flags/registry");
    return isEnabled(key);
  }

  async getVariant(key: string): Promise<FlagVariant> {
    const { getFlag } = await import("@/lib/platform/feature-flags/registry");
    const flag = getFlag(key);
    return flag?.variant ?? "off";
  }

  async getAll(): Promise<FeatureFlag[]> {
    const { getFlag } = await import("@/lib/platform/feature-flags/registry");
    const flagKeys = ["ai.real-providers", "ai.cost-tracking", "ai.streaming", "ai.budget-quotas", "ai.rag", "ai.budget-alerts", "audit.mock-ai", "audit.intelligence"];
    const flags: FeatureFlag[] = [];
    for (const key of flagKeys) {
      const f = getFlag(key);
      if (f) flags.push(f as FeatureFlag);
    }
    return flags;
  }

  async getFlag(key: string): Promise<FeatureFlag | undefined> {
    const { getFlag } = await import("@/lib/platform/feature-flags/registry");
    return getFlag(key);
  }

  async toggle(key: string, variant: FlagVariant): Promise<KernelResult<void>> {
    return { success: true };
  }
}
