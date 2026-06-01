// ─── SalesOS proposal workflow on Core workflow engine ───

import { getWorkflowTemplateForProduct } from "@/lib/platform/workflow/product-templates";
import {
  createReviewState,
  transitionReviewState,
} from "@/lib/platform/contracts/review-approval-runtime";
import type { ReviewApprovalActor } from "@/lib/platform/contracts/review-approval-contract";
import { SALESOS_PRODUCT_KEY } from "../core-adoption";

export type ProposalWorkflowStage =
  | "draft"
  | "internal_review"
  | "commercial_review"
  | "approved_for_send";

export interface ProposalWorkflowState {
  opportunityId: string;
  stage: ProposalWorkflowStage;
  templateGates: readonly string[];
  blockers: string[];
}

export function initProposalWorkflow(opportunityId: string, organizationId: string, ownerId: string) {
  const template = getWorkflowTemplateForProduct(SALESOS_PRODUCT_KEY);
  const reviewPackage = createReviewState({
    productSlug: SALESOS_PRODUCT_KEY,
    resourceType: "SalesProposal",
    resourceId: opportunityId,
    organizationId,
    ownerId,
    evidenceComplete: false,
  });

  return {
    reviewPackage,
    templateGates: template?.gates.map((g) => g.id) ?? [],
  };
}

export function advanceProposalWorkflow(input: {
  opportunityId: string;
  organizationId: string;
  ownerId: string;
  stage: ProposalWorkflowStage;
  actor: ReviewApprovalActor;
  evidenceComplete: boolean;
}): ProposalWorkflowState {
  const { reviewPackage, templateGates } = initProposalWorkflow(
    input.opportunityId,
    input.organizationId,
    input.ownerId,
  );
  reviewPackage.evidenceComplete = input.evidenceComplete;

  const blockers: string[] = [];
  if (input.stage === "commercial_review" && !input.evidenceComplete) {
    blockers.push("Commercial evidence required before review");
  }

  if (blockers.length === 0 && input.stage !== "draft") {
    const action =
      input.stage === "approved_for_send" ? ("approve" as const) : ("submit_for_review" as const);
    transitionReviewState(reviewPackage, action, input.actor);
  }

  return {
    opportunityId: input.opportunityId,
    stage: input.stage,
    templateGates,
    blockers,
  };
}
