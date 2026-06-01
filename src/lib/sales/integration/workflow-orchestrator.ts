import type { SalesOpportunity } from "../types";
import { buildAccountIntelligence } from "../vnext/account-intelligence";
import { initProposalWorkflow, advanceProposalWorkflow } from "../vnext/proposal-workflow";
import type { ReviewApprovalActor } from "@/lib/platform/contracts/review-approval-contract";

export type SalesOperatingStage =
  | "account"
  | "opportunity"
  | "meeting"
  | "proposal"
  | "review"
  | "approval"
  | "output";

const STAGE_ORDER: SalesOperatingStage[] = [
  "account",
  "opportunity",
  "meeting",
  "proposal",
  "review",
  "approval",
  "output",
];

export function resolveSalesOperatingStage(
  opportunity: SalesOpportunity,
  interactionCount: number,
): SalesOperatingStage {
  if (opportunity.stage === "Draft" && interactionCount === 0) return "opportunity";
  if (interactionCount === 0) return "meeting";
  if (opportunity.reviewStatus === "InReview") return "review";
  if (opportunity.approvalStatus === "Approved" || opportunity.stage === "Approved") {
    return "output";
  }
  if (opportunity.stage === "InReview") return "review";
  return "proposal";
}

export function buildSalesWorkflowLinks(input: {
  accountId: string;
  opportunityId?: string;
  stage: SalesOperatingStage;
}) {
  const base = input.opportunityId
    ? `/sales/opportunities/${input.opportunityId}`
    : `/sales/accounts/${input.accountId}`;
  const idx = STAGE_ORDER.indexOf(input.stage);
  const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
  const nextHref =
    next === "account"
      ? `/sales/accounts/${input.accountId}`
      : next === "opportunity"
        ? `/sales/accounts/${input.accountId}?createOpportunity=1`
        : input.opportunityId
          ? `${base}?nextStep=${next}`
          : base;
  return {
    nextStep: {
      stage: next,
      labelAr: `الخطوة التالية: ${next}`,
      href: nextHref,
    },
  };
}

export function buildAccountOpportunitySummary(input: {
  account: { id: string; name: string };
  opportunities: SalesOpportunity[];
  interactionCount: number;
}) {
  const intelligence = buildAccountIntelligence({
    account: input.account as Parameters<typeof buildAccountIntelligence>[0]["account"],
    opportunities: input.opportunities,
    interactionCount: input.interactionCount,
  });
  return {
    intelligence,
    createOpportunityHref: `/sales/accounts/${input.account.id}?createOpportunity=1`,
  };
}

export function runProposalReviewTransition(input: {
  opportunityId: string;
  organizationId: string;
  ownerId: string;
  actor: ReviewApprovalActor;
  evidenceComplete: boolean;
}) {
  const { reviewPackage } = initProposalWorkflow(
    input.opportunityId,
    input.organizationId,
    input.ownerId,
  );
  reviewPackage.evidenceComplete = input.evidenceComplete;
  return advanceProposalWorkflow({
    opportunityId: input.opportunityId,
    organizationId: input.organizationId,
    ownerId: input.ownerId,
    stage: "commercial_review",
    actor: input.actor,
    evidenceComplete: input.evidenceComplete,
  });
}
