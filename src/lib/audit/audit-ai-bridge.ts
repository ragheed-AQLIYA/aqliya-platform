import "server-only";

import { prisma } from "@/lib/prisma";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import type { AIAssistanceOutput } from "@/types/audit";

export interface AuditAIContext {
  auditOrganizationId: string;
  platformOrganizationId: string;
  ragQuery: string;
  engagementLabel: string;
}

export interface RunGovernedAuditAIParams {
  engagementId: string;
  taskType: GovernanceTaskType;
  userId?: string;
  userRole?: string;
  taskInput?: Record<string, unknown>;
}

export interface GovernedAuditAIResult {
  outputs: AIAssistanceOutput[];
  providerId: string;
  warnings: string[];
  reviewRequired: true;
}

export function isAuditAICoreEnabled(): boolean {
  return isEnabled("ai.rag") || isEnabled("ai.real-providers");
}

export async function resolveAuditAIContext(
  engagementId: string,
): Promise<AuditAIContext> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: {
      id: true,
      organizationId: true,
      fiscalPeriod: true,
      engagementType: true,
      client: { select: { name: true } },
    },
  });
  if (!engagement) {
    throw new Error(`Audit engagement not found: ${engagementId}`);
  }

  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: engagement.organizationId },
    select: { id: true, platformOrganizationId: true, name: true },
  });
  if (!auditOrg?.platformOrganizationId) {
    throw new Error(
      `Audit organization missing platform link for engagement ${engagementId}`,
    );
  }

  const engagementLabel = `${engagement.client.name} — ${engagement.fiscalPeriod} (${engagement.engagementType})`;
  const ragQuery = [
    "AuditOS governed intelligence",
    engagementLabel,
    auditOrg.name,
    engagement.fiscalPeriod,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    auditOrganizationId: engagement.organizationId,
    platformOrganizationId: auditOrg.platformOrganizationId,
    ragQuery,
    engagementLabel,
  };
}

function extractOutputs(response: {
  metadata?: Record<string, unknown>;
  output?: string;
}): AIAssistanceOutput[] {
  if (Array.isArray(response.metadata?.outputs)) {
    return response.metadata.outputs as AIAssistanceOutput[];
  }
  return [];
}

/**
 * A1-09 — AuditOS assistive AI via Intelligence Core (tenant + RAG + budget).
 * Human review required; deterministic path unchanged when flags off.
 */
export async function runGovernedAuditAI(
  params: RunGovernedAuditAIParams,
): Promise<GovernedAuditAIResult> {
  const ctx = await resolveAuditAIContext(params.engagementId);

  const taskInput: Record<string, unknown> = {
    engagementId: params.engagementId,
    query: ctx.ragQuery,
    text: ctx.ragQuery,
    contextSummary: ctx.engagementLabel,
    ...params.taskInput,
  };

  const result = await aiOrchestrator.generate({
    taskType: params.taskType,
    taskInput,
    engagementId: params.engagementId,
    organizationId: ctx.platformOrganizationId,
    userId: params.userId,
    userRole: params.userRole,
  });

  const outputs = extractOutputs(result.response);

  await writePlatformAuditLog({
    productKey: "auditos",
    action: "auditos_ai_generation",
    platformOrganizationId: ctx.platformOrganizationId,
    actorId: params.userId,
    severity: result.warnings.length > 0 ? "warning" : "info",
    status: "recorded",
    sourceSystem: "audit_ai_bridge",
    metadata: {
      taskType: params.taskType,
      engagementId: params.engagementId,
      providerId: result.providerId,
      outputCount: outputs.length,
      warningCount: result.warnings.length,
      flags: {
        rag: isEnabled("ai.rag"),
        realProviders: isEnabled("ai.real-providers"),
      },
    },
  }).catch(() => {});

  return {
    outputs,
    providerId: result.providerId,
    warnings: result.warnings,
    reviewRequired: true,
  };
}

export async function runGovernedAuditAITask(
  engagementId: string,
  taskType: GovernanceTaskType,
  actor?: { userId?: string; userRole?: string },
): Promise<AIAssistanceOutput[]> {
  const result = await runGovernedAuditAI({
    engagementId,
    taskType,
    userId: actor?.userId,
    userRole: actor?.userRole,
  });
  return result.outputs;
}
