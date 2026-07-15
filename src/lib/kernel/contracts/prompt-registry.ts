import type { KernelResult } from "../types";

export interface PromptMetadata {
  taskType: string;
  version: string;
  updatedAt: string;
  outputBoundary: string;
  requiresEvidence: boolean;
  requiresHumanApproval: boolean;
}

export interface PromptRegistryService {
  name: string;
  version: string;
  getBuilder(taskType: string): Promise<KernelResult<((input: Record<string, unknown>) => unknown) | null>>;
  getVersion(taskType: string): Promise<KernelResult<string | null>>;
  getMetadata(taskType: string): Promise<KernelResult<PromptMetadata | null>>;
  listVersions(): Promise<KernelResult<Array<{ taskType: string; version: string; updatedAt: string }>>>;
}
