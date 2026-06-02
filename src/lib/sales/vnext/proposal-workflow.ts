// ─── SalesOS proposal workflow on Core workflow engine ───

import { SALESOS_PRODUCT_KEY } from "../core-adoption";

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/workflow/product-templates exists
function getWorkflowTemplateForProduct(productSlug: string): { id: string; gates: { id: string; name: string; required: boolean }[] } | null {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/workflow/product-templates exists");
}

// SALESOS_VNEXT_PLACEHOLDER: inline type — replace when @/lib/platform/contracts/review-approval-contract exists
interface ReviewApprovalActor {
  id: string;
  role: string;
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function createReviewState(input: {
  productSlug: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ownerId: string;
  evidenceComplete: boolean;
}): { id: string; evidenceComplete: boolean; status: string; productSlug: string; resourceType: string; resourceId: string } {
  return { id: `review-${input.resourceId}`, evidenceComplete: input.evidenceComplete, status: "draft", productSlug: input.productSlug, resourceType: input.resourceType, resourceId: input.resourceId };
}

// SALESOS_VNEXT_PLACEHOLDER: inline stub — replace when @/lib/platform/contracts/review-approval-runtime exists
function transitionReviewState(pkg: { evidenceComplete?: boolean; status?: string }, action: string, actor: ReviewApprovalActor): { evidenceComplete?: boolean; status: string } {
  throw new Error("TODO: SalesOS vnext placeholder — implement when @/lib/platform/contracts/review-approval-runtime exists");
}

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
    templateGates: template?.gates.map((g: { id: string }) => g.id) ?? [],
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
