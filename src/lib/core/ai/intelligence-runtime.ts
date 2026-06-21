import "server-only";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import { getGovernanceContext, listSupportedGovernanceTasks } from "@/lib/governance/retrieval-router";

export interface IntelligenceRoutingInput {
  productId: string;
  useCase: string;
  organizationId: string;
  userId: string;
  userRole: string;
  evidenceComplete: boolean;
  inputSources: string[];
  resourceId: string;
}

export interface IntelligenceRoutingResult {
  route: string;
  governanceContext?: {
    taskType: GovernanceTaskType;
    humanApprovalRequired: boolean;
    evidenceRequirements: string[];
    escalationTriggers: string[];
    outputBoundary: string;
  };
  metadata?: {
    provider: string;
    model: string;
    confidence: number;
    limitationNotes?: string[];
  };
}

const USECASE_TASK_MAP: Record<string, GovernanceTaskType> = {
  commercial_claim_review: "commercial_claim_review",
  statement_drafting: "statement_drafting",
  account_mapping: "account_mapping",
  evidence_review: "evidence_review",
  audit_findings: "audit_findings",
  notes_generation: "notes_generation",
  disclosure_enrichment: "disclosure_enrichment",
  approval_review: "approval_review",
  pilot_decision: "pilot_decision",
  trial_balance_upload: "trial_balance_upload",
};

function resolveTaskType(useCase: string): GovernanceTaskType | null {
  return USECASE_TASK_MAP[useCase] ?? null;
}

export function routeIntelligenceRequest(
  input: IntelligenceRoutingInput,
): IntelligenceRoutingResult {
  const taskType = resolveTaskType(input.useCase);

  if (!taskType) {
    return { route: "generic" };
  }

  if (!listSupportedGovernanceTasks().includes(taskType)) {
    return { route: "generic" };
  }

  const governanceContext = getGovernanceContext(taskType);

  const metadata: IntelligenceRoutingResult["metadata"] = {
    provider: "deterministic",
    model: "rule-based",
    confidence: input.evidenceComplete ? 0.85 : 0.6,
    limitationNotes: [],
  };

  if (!input.evidenceComplete) {
    metadata.limitationNotes?.push("Evidence incomplete — results are draft");
  }

  return {
    route: `/intelligence/${taskType}`,
    governanceContext: {
      taskType,
      humanApprovalRequired: governanceContext.humanApprovalRequired,
      evidenceRequirements: governanceContext.evidenceRequirements.map((e) => e.description),
      escalationTriggers: governanceContext.escalationTriggers,
      outputBoundary: governanceContext.outputBoundary,
    },
    metadata,
  };
}
