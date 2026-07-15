import "server-only";

import type { KernelResult } from "../types";
import type { PromptRegistryService, PromptMetadata } from "../contracts/prompt-registry";
import {
  getPromptBuilder,
  getPromptVersion,
  getPromptMetadata,
  listPromptVersions,
} from "@/lib/core/ai/prompt-registry";

function toResult<T>(data: T): KernelResult<T> {
  return { success: true, data };
}

function toError(message: string): KernelResult<never> {
  return { success: false, error: message, code: "PROMPT_REGISTRY_ERROR" };
}

class PromptRegistryWrapper implements PromptRegistryService {
  readonly name = "prompt-registry" as const;
  readonly version = "1.0.0";

  async getBuilder(taskType: string) {
    try {
      const builder = getPromptBuilder(taskType as Parameters<typeof getPromptBuilder>[0]);
      return toResult(builder);
    } catch (error) {
      return toError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getVersion(taskType: string) {
    try {
      const version = getPromptVersion(taskType as Parameters<typeof getPromptVersion>[0]);
      return toResult(version);
    } catch (error) {
      return toError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  async getMetadata(taskType: string) {
    try {
      const meta = getPromptMetadata(taskType as Parameters<typeof getPromptMetadata>[0]);
      return toResult(meta as PromptMetadata | null);
    } catch (error) {
      return toError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  async listVersions() {
    try {
      const versions = listPromptVersions();
      return toResult(versions);
    } catch (error) {
      return toError(error instanceof Error ? error.message : "Unknown error");
    }
  }
}

let _instance: PromptRegistryWrapper | null = null;

export function getPromptRegistryWrapper(): PromptRegistryWrapper {
  if (!_instance) {
    _instance = new PromptRegistryWrapper();
  }
  return _instance;
}
