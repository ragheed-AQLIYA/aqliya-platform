"use server";

import { auth } from "@/lib/auth-next";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { getAIObservability } from "@/lib/ai/observability";

export type AiExecutionMode = "cloud" | "local" | "hybrid";

export interface AiSettingsSnapshot {
  executionMode: AiExecutionMode;
  cloudProvider: string;
  cloudModel: string;
  localBaseUrl: string;
  localModel: string;
  hybridPolicy: Record<string, "local" | "cloud">;
  providersConfigured: {
    openai: boolean;
    anthropic: boolean;
    cloud: boolean;
    local: boolean;
  };
}

const DEFAULT_HYBRID_POLICY: Record<string, "local" | "cloud"> = {
  tb_classification: "local",
  account_mapping: "local",
  report_writing: "cloud",
  notes_generation: "cloud",
};

export async function getAiSettingsAction(): Promise<AiSettingsSnapshot> {
  const user = await requireUserContext("ADMIN");

  const integration = await prisma.tenantIntegration.findFirst({
    where: {
      organizationId: user.organizationId,
      type: "AI",
      provider: "aqliya-ai-runtime",
    },
  });

  const meta = (integration?.configMetadata ?? {}) as Record<string, unknown>;

  return {
    executionMode: (meta.executionMode as AiExecutionMode) ?? "cloud",
    cloudProvider: (meta.cloudProvider as string) ?? "openai",
    cloudModel: (meta.cloudModel as string) ?? "",
    localBaseUrl:
      (meta.localBaseUrl as string) ?? process.env.AI_LOCAL_BASE_URL ?? "",
    localModel:
      (meta.localModel as string) ?? process.env.AI_LOCAL_MODEL ?? "",
    hybridPolicy:
      (meta.hybridPolicy as Record<string, "local" | "cloud">) ??
      DEFAULT_HYBRID_POLICY,
    providersConfigured: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      cloud: Boolean(process.env.AI_CLOUD_API_KEY && process.env.AI_CLOUD_MODEL),
      local: Boolean(process.env.AI_LOCAL_BASE_URL),
    },
  };
}

export async function saveAiSettingsAction(input: {
  executionMode: AiExecutionMode;
  cloudProvider: string;
  cloudModel: string;
  localBaseUrl?: string;
  localModel?: string;
  hybridPolicy?: Record<string, "local" | "cloud">;
}): Promise<{ ok: boolean }> {
  const user = await requireUserContext("ADMIN");

  const configMetadata = {
    executionMode: input.executionMode,
    cloudProvider: input.cloudProvider,
    cloudModel: input.cloudModel,
    localBaseUrl: input.localBaseUrl ?? "",
    localModel: input.localModel ?? "",
    hybridPolicy: input.hybridPolicy ?? DEFAULT_HYBRID_POLICY,
  };

  await prisma.tenantIntegration.upsert({
    where: {
      id: `ai-${user.organizationId}`,
    },
    create: {
      id: `ai-${user.organizationId}`,
      organizationId: user.organizationId,
      type: "AI",
      provider: "aqliya-ai-runtime",
      displayName: "AQLIYA AI Runtime",
      status: "ACTIVE",
      configMetadata,
      createdById: user.id,
    },
    update: {
      configMetadata,
      status: "ACTIVE",
    },
  });

  await writePlatformAuditLog({
    productKey: "platform",
    action: "ai_settings_updated",
    targetType: "tenant_integration",
    targetId: user.organizationId,
    severity: "info",
    status: "recorded",
    metadata: { executionMode: input.executionMode },
  });

  return { ok: true };
}

export async function getAiObservabilityAction() {
  await requireUserContext("OPERATOR");
  return getAIObservability(30);
}
