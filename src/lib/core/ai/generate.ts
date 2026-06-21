/**
 * Unified AI generation facade (ADR-001 Agent-IC).
 * All products should prefer these entry points over direct provider calls.
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIProviderId, AIResponse } from "@/lib/ai/types";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";

export interface GenerateOptions {
  taskType: GovernanceTaskType;
  taskInput?: Record<string, unknown>;
  organizationId?: string;
  engagementId?: string;
  userId?: string;
  userRole?: string;
  preferProvider?: AIProviderId;
}

export async function generateCompletion(
  options: GenerateOptions,
): Promise<AIResponse> {
  const result = await aiOrchestrator.generate({
    taskType: options.taskType,
    taskInput: options.taskInput ?? {},
    organizationId: options.organizationId,
    engagementId: options.engagementId,
    userId: options.userId,
    userRole: options.userRole,
    preferProvider: options.preferProvider,
  });
  return result.response;
}

export async function generateClassification(
  options: Omit<GenerateOptions, "taskType"> & {
    accountCode: string;
    accountName: string;
    accountBalance?: number;
    canonicalCandidates?: string[];
    candidateAccounts?: string[];
    chartOfAccountsContext?: string;
  },
): Promise<AIResponse> {
  const candidates =
    options.candidateAccounts ?? options.canonicalCandidates ?? [];
  return generateCompletion({
    ...options,
    taskType: "account_mapping",
    taskInput: {
      ...(options.taskInput ?? {}),
      accountCode: options.accountCode,
      accountName: options.accountName,
      accountBalance: options.accountBalance ?? 0,
      candidateAccounts: candidates,
      canonicalCandidates: candidates,
      chartOfAccountsContext: options.chartOfAccountsContext ?? "",
      mode: "classification",
    },
  });
}

export async function generateAnalysis(
  options: Omit<GenerateOptions, "taskType">,
): Promise<AIResponse> {
  return generateCompletion({
    ...options,
    taskType: "trial_balance_upload",
  });
}

export async function generateReport(
  options: Omit<GenerateOptions, "taskType">,
): Promise<AIResponse> {
  return generateCompletion({
    ...options,
    taskType: "notes_generation",
  });
}


