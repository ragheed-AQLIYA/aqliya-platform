import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import type { Prisma } from "@prisma/client";
import type { AIAssistanceOutput } from "@/types/audit";
import { toAiOutput } from "./types";


const logger = createLogger({ product: "auditos", action: "ai-db" });

export async function getAISuggestions(
  engagementId: string,
  suggestionType?: string,
): Promise<AIAssistanceOutput[]> {
  try {
    const where: Record<string, unknown> = { engagementId };
    if (suggestionType) where.suggestionType = suggestionType;
    const suggestions = await prisma.auditAiOutput.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    if (suggestions.length === 0) return [];
    return suggestions.map(toAiOutput);
  } catch (error) {
    logger.warn(
      `[AuditDB] getAISuggestions(${engagementId}) error`,
      { error: error instanceof Error ? error?.message : String(error) },
    );
    return [];
  }
}

export async function acceptAISuggestion(
  suggestionId: string,
  userId: string,
): Promise<void> {
  try {
    await prisma.auditAiOutput.update({
      where: { id: suggestionId },
      data: {
        status: "accepted_by_human",
        acceptedBy: userId,
        acceptedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error(
      `[AuditDB] acceptAISuggestion(${suggestionId}) failed. Mock fallback disabled for mutation path.`,
      error instanceof Error ? error : undefined,
    );
    throw new Error(
      `AuditOS mutation unavailable: acceptAISuggestion(${suggestionId}). Mock fallback disabled.`,
    );
  }
}

export async function createAIOutput(data: {
  engagementId: string;
  suggestionType: string;
  inputContext?: string;
  outputContent: string;
  confidence?: number;
  modelVersion?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<AIAssistanceOutput> {
  const ai = await prisma.auditAiOutput.create({
    data: {
      engagementId: data.engagementId,
      suggestionType: data.suggestionType,
      inputContext: data.inputContext ?? null,
      outputContent: data.outputContent,
      confidence: data.confidence ?? null,
      modelVersion: data.modelVersion ?? null,
      status: "suggested",
      sourceEntityType: data.sourceEntityType ?? null,
      sourceEntityId: data.sourceEntityId ?? null,
      metadata: (data.metadata ?? undefined) as unknown as Prisma.InputJsonValue,
    },
  });
  return toAiOutput(ai);
}

export async function getAIOutputsForEntity(
  engagementId: string,
  sourceEntityType: string,
  sourceEntityId: string,
): Promise<AIAssistanceOutput[]> {
  try {
    const outputs = await prisma.auditAiOutput.findMany({
      where: { engagementId, sourceEntityType, sourceEntityId },
      orderBy: { createdAt: "desc" },
    });
    return outputs.map(toAiOutput);
  } catch (error) {
    logger.warn(
      `[AuditDB] getAIOutputsForEntity(${engagementId}) error`,
      { error: error instanceof Error ? error?.message : String(error) },
    );
    return [];
  }
}

export async function updateAIOutputStatus(
  id: string,
  status: string,
  userId?: string,
): Promise<AIAssistanceOutput | null> {
  try {
    const updateData: Record<string, unknown> = { status };
    if (status === "accepted_by_human" && userId) {
      updateData.acceptedBy = userId;
      updateData.acceptedAt = new Date();
    }
    if (status === "rejected" && userId) {
      updateData.rejectedBy = userId;
      updateData.rejectedAt = new Date();
    }
    const ai = await prisma.auditAiOutput.update({
      where: { id },
      data: updateData as Prisma.AuditAiOutputUpdateInput,
    });
    return toAiOutput(ai);
  } catch (error) {
    logger.warn("[AuditDB] updateAIOutputStatus(${id}) error", { error: error instanceof Error ? error?.message : String(error) });
    return null;
  }
}
