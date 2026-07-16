import "server-only";

import { isEnabled } from "@/lib/kernel";

export type AITaskType = "analysis" | "generation" | "review" | "extraction" | "classification" | "embedding";

export interface AIAuthorizationRequest {
  taskType: AITaskType;
  organizationId: string;
  actorId: string;
  actorRoles: string[];
  model?: string;
  containsSensitiveData?: boolean;
}

export interface AIAuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  restrictions?: string[];
}

const TASK_SENSITIVITY: Record<AITaskType, string> = {
  analysis: "medium",
  generation: "low",
  review: "medium",
  extraction: "high",
  classification: "medium",
  embedding: "low",
};

const ROLE_AI_RESTRICTIONS: Record<string, AITaskType[]> = {
  viewer: ["generation", "extraction"],
  read_only: ["generation", "extraction"],
  external_auditor: ["generation", "extraction", "classification"],
};

export function authorizeAIAction(
  request: AIAuthorizationRequest,
): AIAuthorizationResult {
  if (!isEnabled("platform.ai-authorization")) {
    return { allowed: true };
  }

  const restrictions = ROLE_AI_RESTRICTIONS[request.actorRoles[0]];
  if (restrictions?.includes(request.taskType)) {
    return {
      allowed: false,
      reason: `Role "${request.actorRoles[0]}" is not authorized for AI task type "${request.taskType}"`,
    };
  }

  if (request.containsSensitiveData && !isEnabled("ai.rag")) {
    return {
      allowed: false,
      reason: "AI processing of sensitive data requires RAG pipeline to be enabled",
    };
  }

  const sensitivity = TASK_SENSITIVITY[request.taskType];
  if (sensitivity === "high" && request.actorRoles.includes("viewer")) {
    return {
      allowed: false,
      reason: "High-sensitivity AI tasks require operator role or higher",
    };
  }

  return { allowed: true };
}

export function getAITaskSensitivity(taskType: AITaskType): string {
  return TASK_SENSITIVITY[taskType];
}
