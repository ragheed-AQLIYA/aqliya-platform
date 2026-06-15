import "server-only";

import { aiOrchestrator } from "../orchestrator";
import type { AIProviderId, AIResponse } from "../types";
import type { GovernanceContext, GovernanceTaskType } from "@/lib/governance/runtime-types";

export interface InferenceRequest {
  taskType: GovernanceTaskType;
  taskInput: Record<string, unknown>;
  engagementId?: string;
  organizationId?: string;
  userId?: string;
  userRole?: string;
  preferProvider?: AIProviderId;
}

export type AiRuntimeMode = "cloud" | "hybrid" | "air_gapped";

export interface InferenceResult {
  response: AIResponse;
  providerId: AIProviderId;
  governanceContext: GovernanceContext;
  warnings: string[];
  runtimeMode: AiRuntimeMode;
}

function resolveRuntimeMode(): AiRuntimeMode {
  const mode =
    process.env.AI_RUNTIME_MODE?.toLowerCase() ??
    process.env.AI_MODE?.toLowerCase();
  if (mode === "air_gapped" || mode === "local" || mode === "sovereign") {
    return "air_gapped";
  }
  if (mode === "hybrid") return "hybrid";
  return "cloud";
}

/**
 * Sovereign inference entry point — delegates to AIOrchestrator.
 * Phase 9 bridge migration target; runtime policy hooks extend here in Phase 1+.
 */
export async function runInference(
  request: InferenceRequest,
): Promise<InferenceResult> {
  const result = await aiOrchestrator.generate(request);
  return {
    ...result,
    runtimeMode: resolveRuntimeMode(),
  };
}

export async function getRuntimeStatus(_organizationId?: string) {
  return {
    runtimeMode: resolveRuntimeMode(),
    providers: aiOrchestrator.getAllStatus(),
  };
}
