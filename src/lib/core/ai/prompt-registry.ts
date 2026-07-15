// Phase 3A: Prompt Registry Scaffold
// Maps GovernanceTaskType to prompt builders from the existing governance framework.
// File-based registry — no DB schema change.
// Uses type-safe imports from lib/governance/prompt-framework.ts.

import type { GovernanceTaskType, PromptAssemblyResult } from "@/lib/governance/runtime-types"
import {
  buildStatementDraftingPrompt,
  buildMappingRecommendationPrompt,
  buildAccountClassificationPrompt,
  buildEvidenceReviewPrompt,
  buildAuditFindingPrompt,
  buildCommercialClaimReviewPrompt,
} from "@/lib/governance/prompt-framework"
import type { AIRequest } from "@/lib/core/ai/types"

export type PromptBuilder = (input: Record<string, unknown>) => PromptAssemblyResult

export interface PromptRegistryEntry {
  builder: PromptBuilder
  requiresEvidence: boolean
  requiresHumanApproval: boolean
  outputBoundary: string
  version: string
  updatedAt: string
}

// Registry mapping GovernanceTaskType → prompt assembly + metadata
// Only task types that have a corresponding builder in prompt-framework.ts are included.
// Task types without builders should be handled by deterministic/rule-based logic.

export const PROMPT_REGISTRY: Partial<Record<GovernanceTaskType, PromptRegistryEntry>> = {
  statement_drafting: {
    builder: (input) => buildStatementDraftingPrompt({
      accountsMapped: (input.accountsMapped as boolean) ?? false,
      trialBalanceValidated: (input.trialBalanceValidated as boolean) ?? false,
      evidenceCompleteness: (input.evidenceCompleteness as "complete" | "partial" | "missing") ?? 'partial',
      hasPriorPeriodData: (input.hasPriorPeriodData as boolean) ?? false,
      financialPeriod: (input.financialPeriod as string) ?? '',
      accountingStandard: (input.accountingStandard as string) ?? 'ifrs_for_smes',
    }),
    requiresEvidence: true,
    requiresHumanApproval: true,
    outputBoundary: 'draft_only',
    version: '1.0.0',
    updatedAt: '2026-07-14',
  },

  account_mapping: {
    builder: (input) => {
      if (input.mode === "classification") {
        return buildAccountClassificationPrompt({
          accountCode: String(input.accountCode ?? ""),
          accountName: String(input.accountName ?? ""),
          accountBalance: Number(input.accountBalance ?? 0),
          candidateAccounts: Array.isArray(input.candidateAccounts)
            ? (input.candidateAccounts as string[])
            : Array.isArray(input.canonicalCandidates)
              ? (input.canonicalCandidates as string[])
              : [],
          chartOfAccountsContext: String(input.chartOfAccountsContext ?? ""),
        });
      }
      return buildMappingRecommendationPrompt({
        accountCount: (input.accountCount as number) ?? 0,
        mappedCount: (input.mappedCount as number) ?? 0,
        lowConfidenceCount: (input.lowConfidenceCount as number) ?? 0,
        unmappedCount: (input.unmappedCount as number) ?? 0,
      });
    },
    requiresEvidence: false,
    requiresHumanApproval: true,
    outputBoundary: 'draft_only',
    version: '1.0.0',
    updatedAt: '2026-07-14',
  },

  evidence_review: {
    builder: (input) => buildEvidenceReviewPrompt({
      evidenceItemsTotal: (input.evidenceItemsTotal as number) ?? 0,
      evidenceItemsReviewed: (input.evidenceItemsReviewed as number) ?? 0,
      evidenceItemsVerified: (input.evidenceItemsVerified as number) ?? 0,
      materialityThreshold: (input.materialityThreshold as number) ?? 50000,
    }),
    requiresEvidence: true,
    requiresHumanApproval: true,
    outputBoundary: 'draft_only',
    version: '1.0.0',
    updatedAt: '2026-07-14',
  },

  audit_findings: {
    builder: (input) => buildAuditFindingPrompt({
      findingType: (input.findingType as string) ?? 'observation',
      severity: (input.severity as string) ?? 'medium',
      evidenceLinked: (input.evidenceLinked as boolean) ?? false,
      evidenceSufficient: (input.evidenceSufficient as boolean) ?? false,
    }),
    requiresEvidence: true,
    requiresHumanApproval: true,
    outputBoundary: 'draft_only',
    version: '1.0.0',
    updatedAt: '2026-07-14',
  },

  commercial_claim_review: {
    builder: (input) => buildCommercialClaimReviewPrompt({
      claimType: (input.claimType as string) ?? '',
      targetAudience: (input.targetAudience as string) ?? '',
      isPilotResult: (input.isPilotResult as boolean) ?? true,
      hasEvidenceSupport: (input.hasEvidenceSupport as boolean) ?? false,
    }),
    requiresEvidence: true,
    requiresHumanApproval: true,
    outputBoundary: 'review_required',
    version: '1.0.0',
    updatedAt: '2026-07-14',
  },

  // trial_balance_upload, notes_generation, pilot_decision, approval_review
  // — no prompt builder exists yet. These task types should fall back to
  // deterministic/rule-based generation in services.ts.
}

export function getPromptBuilder(taskType: GovernanceTaskType): PromptBuilder | null {
  return PROMPT_REGISTRY[taskType]?.builder ?? null
}

export function getPromptVersion(taskType: GovernanceTaskType): string | null {
  return PROMPT_REGISTRY[taskType] ? "1.0.0" : null
}

export function getPromptMetadata(taskType: GovernanceTaskType): { version: string; updatedAt: string; outputBoundary: string } | null {
  const entry = PROMPT_REGISTRY[taskType]
  if (!entry) return null
  return { version: entry.version, updatedAt: entry.updatedAt, outputBoundary: entry.outputBoundary }
}

export function listPromptVersions(): Array<{ taskType: string; version: string; updatedAt: string }> {
  return Object.entries(PROMPT_REGISTRY).map(([taskType, entry]) => ({ taskType, version: entry.version, updatedAt: entry.updatedAt }))
}

export function assemblePrompt(request: AIRequest): AIRequest {
  const entry = PROMPT_REGISTRY[request.taskType]
  if (!entry) {
    return {
      ...request,
      assembledPrompt: {
        layers: [],
        fullPrompt: '',
      },
    }
  }

  const result = entry.builder(request.taskInput)
  return {
    ...request,
    assembledPrompt: {
      layers: result.layers,
      fullPrompt: result.fullPrompt,
    },
  }
}

