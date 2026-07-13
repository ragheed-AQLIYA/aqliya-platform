import type { KernelResult } from "../types";

export type FlagVariant = "on" | "off";

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  variant: FlagVariant;
  owner: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface IFeatureFlagService {
  isEnabled(key: string): Promise<boolean>;
  getVariant(key: string): Promise<FlagVariant>;
  getAll(): Promise<FeatureFlag[]>;
  getFlag(key: string): Promise<FeatureFlag | undefined>;
  toggle(key: string, variant: FlagVariant): Promise<KernelResult<void>>;
}
