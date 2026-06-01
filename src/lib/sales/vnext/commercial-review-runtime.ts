// ─── SalesOS commercial review runtime — opportunity ↔ review ↔ approval ↔ outputs ↔ audit ───

import type { CurrentUser } from "@/lib/auth";
import { routeIntelligenceRequest } from "@/lib/ai/intelligence-runtime";
import { recordAuditEventSafe } from "@/lib/platform/contracts/audit-trail-runtime";
import { enforceCoreOnMutation } from "@/lib/platform/integration/core-adoption-enforcer";
import { validateProductActionAccess } from "@/lib/platform/access/workspace-access";
import { SALESOS_PRODUCT_KEY } from "../core-adoption";
import type { SalesOpportunity } from "../types";
import {
  createDealReviewPackage,
  submitDealForReview,
  decideDealReview,
} from "./deal-review";
import { buildOpportunityIntelligence } from "./opportunity-intelligence";

export interface CommercialReviewRuntimeResult {
  intelligence: ReturnType<typeof buildOpportunityIntelligence>;
  review: ReturnType<typeof createDealReviewPackage>;
  exportAllowed: boolean;
  intelligenceRoute: ReturnType<typeof routeIntelligenceRequest>;
  auditTrailHint: string;
}

export function buildCommercialReviewRuntime(input: {
  user: CurrentUser;
  opportunity: SalesOpportunity;
  evidenceCount: number;
  interactionCount: number;
  hasApprovedClaims: boolean;
}): CommercialReviewRuntimeResult {
  const access = validateProductActionAccess(input.user, SALESOS_PRODUCT_KEY, "review");
  if (!access.allowed) {
    throw new Error(access.reason ?? "Sales review not permitted");
  }

  enforceCoreOnMutation({
    productSlug: SALESOS_PRODUCT_KEY,
    operation: "review",
  });

  const intelligence = buildOpportunityIntelligence({
    opportunity: input.opportunity,
    evidenceCount: input.evidenceCount,
    interactionCount: input.interactionCount,
    hasApprovedClaims: input.hasApprovedClaims,
  });

  const review = createDealReviewPackage({
    opportunityId: input.opportunity.id,
    organizationId: input.user.organizationId,
    ownerId: input.opportunity.ownerId,
    evidenceComplete: input.evidenceCount > 0,
    approvalStatus: input.opportunity.approvalStatus,
  });

  const intelligenceRoute = routeIntelligenceRequest({
    productId: SALESOS_PRODUCT_KEY,
    useCase: "commercial_claim_review",
    organizationId: input.user.organizationId,
    userId: input.user.id,
    userRole: input.user.role,
    evidenceComplete: input.evidenceCount > 0,
    inputSources: [`opportunity:${input.opportunity.id}`],
    resourceId: input.opportunity.id,
  });

  recordAuditEventSafe({
    category: "workflow_transition",
    productSlug: SALESOS_PRODUCT_KEY,
    action: "sales.commercial_review.runtime_built",
    actorId: input.user.id,
    organizationId: input.user.organizationId,
    targetType: "SalesOpportunity",
    targetId: input.opportunity.id,
    metadata: {
      winProbability: intelligence.winProbability,
      reviewRequired: intelligence.reviewRequired,
    },
  });

  return {
    intelligence,
    review,
    exportAllowed: review.exportAllowed,
    intelligenceRoute,
    auditTrailHint: "Cross-product audit buffer + SalesOS store audit log",
  };
}

export function runCommercialReviewSubmit(
  input: Parameters<typeof buildCommercialReviewRuntime>[0],
  actor: { id: string; role: "owner" | "reviewer" | "approver" },
) {
  const runtime = buildCommercialReviewRuntime(input);
  return submitDealForReview(runtime.review, {
    id: actor.id,
    role: actor.role,
  });
}

export function runCommercialReviewDecision(
  input: Parameters<typeof buildCommercialReviewRuntime>[0],
  actor: { id: string; role: "owner" | "reviewer" | "approver" },
  decision: "approved" | "rejected",
) {
  const runtime = buildCommercialReviewRuntime(input);
  return decideDealReview(runtime.review, { id: actor.id, role: actor.role }, decision);
}
