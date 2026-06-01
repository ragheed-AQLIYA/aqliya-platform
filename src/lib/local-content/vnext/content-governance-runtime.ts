// ─── LocalContentOS unified content governance lifecycle ───
// Sources + evidence + AI + reviews + outputs in one helper.

import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import { routeIntelligenceRequest } from "@/lib/ai/intelligence-runtime";
import { enforceCoreOnMutation } from "@/lib/platform/integration/core-adoption-enforcer";
import { LOCALCONTENT_PRODUCT_KEY } from "../core-adoption";
import { buildEditorialLifecycleState } from "./editorial-runtime";
import {
  createLCReviewPackage,
  advanceLCReviewStage,
  type LCReviewStage,
} from "./review-stages";
import { validateLCSourceEvidence, type LCSourceRecord } from "./source-governance";
import { buildPublishingGate } from "./publishing-governance";

export interface ContentGovernanceLifecycleInput {
  projectId: string;
  organizationId: string;
  ownerId: string;
  projectStatus: string;
  sourceCount: number;
  evidenceCompletePct: number;
  sources?: LCSourceRecord[];
  aiUseCase?: GovernanceTaskType;
}

export interface ContentGovernanceLifecycleResult {
  editorial: ReturnType<typeof buildEditorialLifecycleState>;
  reviewPackage: ReturnType<typeof createLCReviewPackage>;
  sourceValidation: Array<{ sourceId: string; valid: boolean; reason?: string }>;
  publishingAllowed: boolean;
  intelligenceRoute?: ReturnType<typeof routeIntelligenceRequest>;
}

export function buildContentGovernanceLifecycle(
  input: ContentGovernanceLifecycleInput,
): ContentGovernanceLifecycleResult {
  enforceCoreOnMutation({
    productSlug: LOCALCONTENT_PRODUCT_KEY,
    operation: "read",
  });

  const editorial = buildEditorialLifecycleState({
    projectId: input.projectId,
    projectStatus: input.projectStatus,
    sourceCount: input.sourceCount,
    evidenceCompletePct: input.evidenceCompletePct,
  });

  const reviewPackage = createLCReviewPackage({
    projectId: input.projectId,
    organizationId: input.organizationId,
    ownerId: input.ownerId,
    evidenceCompletePct: input.evidenceCompletePct,
  });

  const sourceValidation = (input.sources ?? []).map((s) => {
    const v = validateLCSourceEvidence(s);
    return { sourceId: s.id, valid: v.valid, reason: v.reason };
  });

  const publishGate = buildPublishingGate({
    approvalStatus: input.projectStatus === "Approved" ? "Approved" : "Draft",
    evidenceCompletePct: input.evidenceCompletePct,
    reviewComplete: input.projectStatus === "InReview" || input.projectStatus === "Approved",
  });

  const intelligenceRoute = input.aiUseCase
    ? routeIntelligenceRequest({
        productId: LOCALCONTENT_PRODUCT_KEY,
        useCase: input.aiUseCase,
        organizationId: input.organizationId,
        userId: input.ownerId,
        evidenceComplete: input.evidenceCompletePct >= 70,
        inputSources: [`project:${input.projectId}`],
        resourceId: input.projectId,
      })
    : undefined;

  return {
    editorial,
    reviewPackage,
    sourceValidation,
    publishingAllowed: publishGate.allowed,
    intelligenceRoute,
  };
}

/** Lightweight summary for command-center dashboards. */
export function buildContentGovernanceRuntime(input: {
  projectId: string;
  status: string;
  findingCount: number;
  evidenceCoveragePct: number;
}) {
  const gate = buildPublishingGate({
    approvalStatus: input.status === "Approved" ? "Approved" : "Draft",
    evidenceCompletePct: input.evidenceCoveragePct,
    reviewComplete:
      input.status === "InReview" || input.status === "Approved",
  });
  return {
    projectId: input.projectId,
    status: input.status,
    findingCount: input.findingCount,
    evidenceCoveragePct: input.evidenceCoveragePct,
    publishAllowed: gate.allowed,
    blockers: gate.blockers,
  };
}

export function advanceContentReview(
  input: ContentGovernanceLifecycleInput,
  stage: LCReviewStage,
  actor: { id: string; role: "owner" | "reviewer" | "approver" },
) {
  enforceCoreOnMutation({
    productSlug: LOCALCONTENT_PRODUCT_KEY,
    operation: "review",
  });
  const lifecycle = buildContentGovernanceLifecycle(input);
  return advanceLCReviewStage(
    lifecycle.reviewPackage,
    stage,
    { id: actor.id, role: actor.role },
    input.evidenceCompletePct,
  );
}
