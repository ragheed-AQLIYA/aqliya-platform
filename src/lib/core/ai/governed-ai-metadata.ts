import type { AIResponse, AIRequest } from "@/lib/ai/types";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";

export interface GovernedAIMetadata {
  actionType: string;
  modelProvider?: string;
  modelName?: string;
  inputTokens?: number;
  outputTokens?: number;
  confidence?: number;
  limitationNotes?: string[];
  humanReviewStatus: "pending" | "reviewed" | "approved" | "rejected";
  reviewedById?: string;
  reviewedAt?: string;
}

export interface GovernedAIMetadataInput {
  response: AIResponse;
  request: AIRequest;
  taskType: GovernanceTaskType;
}

export function buildGovernedAIMetadata(
  input: GovernedAIMetadataInput,
): GovernedAIMetadata {
  const { response, request, taskType } = input;

  const limitationNotes: string[] = [];

  if (response.confidence < 0.7) {
    limitationNotes.push(`Low confidence (${Math.round(response.confidence * 100)}%)`);
  }

  if (request.governanceContext.humanApprovalRequired) {
    limitationNotes.push("Human approval required per governance policy");
  }

  const missingEvidence = request.governanceContext.evidenceRequirements.filter(
    (e) => e.status === "missing" || e.status === "partial",
  );
  if (missingEvidence.length > 0) {
    limitationNotes.push(
      `Incomplete evidence: ${missingEvidence.map((e) => e.description).join("; ")}`,
    );
  }

  if (request.governanceContext.escalationTriggers.length > 0) {
    limitationNotes.push(
      `Active escalation triggers: ${request.governanceContext.escalationTriggers.join(", ")}`,
    );
  }

  return {
    actionType: taskType,
    modelProvider: response.providerId,
    modelName: response.modelVersion,
    inputTokens: response.tokenUsage?.input,
    outputTokens: response.tokenUsage?.output,
    confidence: response.confidence,
    limitationNotes: limitationNotes.length > 0 ? limitationNotes : undefined,
    humanReviewStatus: request.governanceContext.humanApprovalRequired
      ? "pending"
      : "reviewed",
  };
}

