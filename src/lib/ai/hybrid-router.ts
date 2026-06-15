/**
 * Hybrid AI routing — task-level local vs cloud (ADR-001 Cycle 2).
 */

import type { AIProviderId } from "./types";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import { prisma } from "@/lib/prisma";

export type AiExecutionMode = "cloud" | "local" | "hybrid";

const DEFAULT_POLICY: Record<string, "local" | "cloud"> = {
  account_mapping: "local",
  tb_classification: "local",
  trial_balance_upload: "local",
  notes_generation: "cloud",
  disclosure_enrichment: "cloud",
  report_writing: "cloud",
  audit_findings: "cloud",
  analytical_review: "local",
};

export function resolveExecutionModeFromEnv(): AiExecutionMode {
  const mode = process.env.AI_MODE?.toLowerCase();
  if (mode === "local" || mode === "hybrid" || mode === "cloud") return mode;
  return "cloud";
}

export async function getOrgAiExecutionMode(
  organizationId?: string,
): Promise<AiExecutionMode> {
  if (!organizationId) return resolveExecutionModeFromEnv();

  const integration = await prisma.tenantIntegration.findFirst({
    where: {
      organizationId,
      type: "AI",
      provider: "aqliya-ai-runtime",
      status: "ACTIVE",
    },
  });

  const meta = (integration?.configMetadata ?? {}) as Record<string, unknown>;
  const mode = meta.executionMode as AiExecutionMode | undefined;
  return mode ?? resolveExecutionModeFromEnv();
}

export async function getHybridPolicy(
  organizationId?: string,
): Promise<Record<string, "local" | "cloud">> {
  if (!organizationId) return DEFAULT_POLICY;

  const integration = await prisma.tenantIntegration.findFirst({
    where: {
      organizationId,
      type: "AI",
      provider: "aqliya-ai-runtime",
    },
  });

  const meta = (integration?.configMetadata ?? {}) as Record<string, unknown>;
  return (meta.hybridPolicy as Record<string, "local" | "cloud">) ?? DEFAULT_POLICY;
}

export async function selectProviderForTask(
  taskType: GovernanceTaskType,
  organizationId?: string,
  preferProvider?: AIProviderId,
): Promise<AIProviderId> {
  if (preferProvider) return preferProvider;

  const mode = await getOrgAiExecutionMode(organizationId);
  if (mode === "cloud") return "openai";
  if (mode === "local") return "local";

  const policy = await getHybridPolicy(organizationId);
  const route = policy[taskType] ?? policy.account_mapping ?? "cloud";
  return route === "local" ? "local" : "openai";
}
