import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import type { SalesActor, SalesOrgScope } from "./services";

/** PR-21a — deterministic commercial claim gate (no LLM). */

export const CLAIM_MARKER_PATTERNS = [
  /\[\[claim\]\]/i,
  /\[COMMERCIAL_CLAIM\]/i,
] as const;

export const RISKY_PHRASE_RULES = [
  { id: "l6_maturity", pattern: /\bL6\b/i, label: "L6" },
  { id: "production_ready", pattern: /production[-\s]?ready/i, label: "production-ready" },
  {
    id: "pilot_ready",
    pattern: /pilot[-\s]?ready(?!\s+with\s+conditions)/i,
    label: "pilot-ready",
  },
  {
    id: "guaranteed_roi",
    pattern: /guaranteed\s+(roi|return|outcomes?)/i,
    label: "guarantee",
  },
  {
    id: "externally_certified",
    pattern: /externally\s+certified|certified\s+for\s+production/i,
    label: "certified",
  },
  {
    id: "salesos_capability",
    pattern: /\b(SalesOS|AuditOS|DecisionOS)\b.*\b(ready|certified|production)\b/i,
    label: "SalesOS capability",
  },
  {
    id: "fully_implemented",
    pattern: /fully\s+implemented|complete\s+product/i,
    label: "fully implemented",
  },
] as const;

export type CommercialClaimSourceType = "outreach_draft" | "account_brief";

export type CommercialClaimReviewStatus = "flagged" | "reviewed";

export interface CommercialClaimReview {
  id: string;
  sourceType: CommercialClaimSourceType;
  sourceId: string;
  flaggedPhrases: string[];
  status: CommercialClaimReviewStatus;
  flaggedAt: string;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
}

export interface ClaimTextValidation {
  hasClaimMarkers: boolean;
  flaggedPhrases: string[];
  requiresReview: boolean;
}

export interface OutreachDraftClaimState {
  pendingClaimReview: boolean;
  claimId: string | null;
  labelAr: string;
  validation: ClaimTextValidation;
  review: CommercialClaimReview | null;
}

function parseMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function parseCommercialClaimReview(raw: unknown): CommercialClaimReview | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (row.sourceType !== "outreach_draft" && row.sourceType !== "account_brief") {
    return null;
  }
  if (typeof row.sourceId !== "string" || !row.sourceId.trim()) return null;
  if (row.status !== "flagged" && row.status !== "reviewed") return null;
  if (typeof row.flaggedAt !== "string" || !row.flaggedAt.trim()) return null;

  const flaggedPhrases = Array.isArray(row.flaggedPhrases)
    ? row.flaggedPhrases.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : [];

  return {
    id: row.id.trim(),
    sourceType: row.sourceType,
    sourceId: row.sourceId.trim(),
    flaggedPhrases,
    status: row.status,
    flaggedAt: row.flaggedAt.trim(),
    reviewedAt: typeof row.reviewedAt === "string" ? row.reviewedAt : null,
    reviewedById: typeof row.reviewedById === "string" ? row.reviewedById : null,
    reviewedByName:
      typeof row.reviewedByName === "string" ? row.reviewedByName : null,
  };
}

export function readCommercialClaimReviews(
  metadata: unknown,
): CommercialClaimReview[] {
  const raw = parseMetadata(metadata).commercialClaimReviews;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseCommercialClaimReview)
    .filter((row): row is CommercialClaimReview => row !== null);
}

export function validateClaimText(text: string): ClaimTextValidation {
  const normalized = text ?? "";
  const explicitMarkers = CLAIM_MARKER_PATTERNS.some((pattern) =>
    pattern.test(normalized),
  );

  const flaggedPhrases: string[] = [];
  for (const rule of RISKY_PHRASE_RULES) {
    if (rule.pattern.test(normalized)) {
      flaggedPhrases.push(rule.label);
    }
  }

  const hasClaimMarkers = explicitMarkers || flaggedPhrases.length > 0;
  const requiresReview = hasClaimMarkers;
  return { hasClaimMarkers, flaggedPhrases, requiresReview };
}

export function outreachDraftClaimText(subject: string, body: string): string {
  return `${subject}\n${body}`;
}

function findClaimReview(
  reviews: CommercialClaimReview[],
  sourceType: CommercialClaimSourceType,
  sourceId: string,
): CommercialClaimReview | undefined {
  return reviews.find(
    (r) => r.sourceType === sourceType && r.sourceId === sourceId,
  );
}

function mergeReviewsIntoMetadata(
  existing: Record<string, unknown>,
  reviews: CommercialClaimReview[],
): Record<string, unknown> {
  return { ...existing, commercialClaimReviews: reviews };
}

export async function flagCommercialClaimIfNeeded(input: {
  scope: SalesOrgScope;
  actor: SalesActor;
  targetType: "SalesDeal" | "SalesAccount";
  targetId: string;
  existingMetadata: unknown;
  sourceType: CommercialClaimSourceType;
  sourceId: string;
  text: string;
}): Promise<{ metadata: Record<string, unknown>; review: CommercialClaimReview | null }> {
  const existingMeta = parseMetadata(input.existingMetadata);
  const reviews = readCommercialClaimReviews(input.existingMetadata);
  const validation = validateClaimText(input.text);
  const index = reviews.findIndex(
    (r) => r.sourceType === input.sourceType && r.sourceId === input.sourceId,
  );

  if (!validation.requiresReview) {
    if (index < 0) {
      return { metadata: existingMeta, review: null };
    }
    const nextReviews = reviews.filter((_, i) => i !== index);
    return {
      metadata: mergeReviewsIntoMetadata(existingMeta, nextReviews),
      review: null,
    };
  }

  const now = new Date().toISOString();
  const prior = index >= 0 ? reviews[index] : null;
  const review: CommercialClaimReview = {
    id: prior?.id ?? randomUUID(),
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    flaggedPhrases: validation.flaggedPhrases,
    status: "flagged",
    flaggedAt: now,
    reviewedAt: null,
    reviewedById: null,
    reviewedByName: null,
  };

  const nextReviews = [...reviews];
  if (index >= 0) {
    nextReviews[index] = review;
  } else {
    nextReviews.push(review);
  }

  const metadata = mergeReviewsIntoMetadata(existingMeta, nextReviews);

  if (!prior || prior.status !== "flagged") {
    await recordSalesAuditEvent({
      organizationId: input.scope.organizationId,
      platformOrganizationId: input.scope.platformOrganizationId,
      actorId: input.actor.id,
      actorName: input.actor.name ?? undefined,
      action: SalesAuditActions.CLAIM_FLAGGED,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: {
        claimId: review.id,
        sourceType: review.sourceType,
        sourceId: review.sourceId,
        flaggedPhrases: review.flaggedPhrases,
      },
    });
  }

  return { metadata, review };
}

export function assertCommercialClaimReviewed(input: {
  metadata: unknown;
  text: string;
  sourceType: CommercialClaimSourceType;
  sourceId: string;
}): void {
  const validation = validateClaimText(input.text);
  if (!validation.requiresReview) return;

  const review = findClaimReview(
    readCommercialClaimReviews(input.metadata),
    input.sourceType,
    input.sourceId,
  );

  if (!review || review.status !== "reviewed") {
    throw new Error(
      "SalesOS governance: commercial claim review before submit is required",
    );
  }
}

export function assertAccountBriefClaimGate(input: {
  metadata: unknown;
  briefText: string;
}): void {
  assertCommercialClaimReviewed({
    metadata: input.metadata,
    text: input.briefText,
    sourceType: "account_brief",
    sourceId: "accountResearch",
  });
}

export async function markCommercialClaimReviewed(input: {
  scope: SalesOrgScope;
  actor: SalesActor;
  targetType: "SalesDeal" | "SalesAccount";
  targetId: string;
  existingMetadata: unknown;
  claimId: string;
}): Promise<{ metadata: Record<string, unknown>; review: CommercialClaimReview }> {
  const existingMeta = parseMetadata(input.existingMetadata);
  const reviews = readCommercialClaimReviews(input.existingMetadata);
  const index = reviews.findIndex((r) => r.id === input.claimId);
  if (index < 0) {
    throw new Error("SalesOS: commercial claim not found");
  }

  const current = reviews[index];
  if (current.status === "reviewed") {
    throw new Error("SalesOS validation: commercial claim already reviewed");
  }

  const now = new Date().toISOString();
  const reviewed: CommercialClaimReview = {
    ...current,
    status: "reviewed",
    reviewedAt: now,
    reviewedById: input.actor.id,
    reviewedByName: input.actor.name ?? null,
  };
  reviews[index] = reviewed;
  const metadata = mergeReviewsIntoMetadata(existingMeta, reviews);

  await recordSalesAuditEvent({
    organizationId: input.scope.organizationId,
    platformOrganizationId: input.scope.platformOrganizationId,
    actorId: input.actor.id,
    actorName: input.actor.name ?? undefined,
    action: SalesAuditActions.CLAIM_REVIEWED,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: {
      claimId: reviewed.id,
      sourceType: reviewed.sourceType,
      sourceId: reviewed.sourceId,
    },
  });

  return { metadata, review: reviewed };
}

export function getOutreachDraftClaimState(
  metadata: unknown,
  draftId: string,
  subject: string,
  body: string,
): OutreachDraftClaimState {
  const validation = validateClaimText(outreachDraftClaimText(subject, body));
  if (!validation.requiresReview) {
    return {
      pendingClaimReview: false,
      claimId: null,
      labelAr: "",
      validation,
      review: null,
    };
  }

  const review =
    findClaimReview(
      readCommercialClaimReviews(metadata),
      "outreach_draft",
      draftId,
    ) ?? null;

  const pending = !review || review.status !== "reviewed";
  return {
    pendingClaimReview: pending,
    claimId: review?.id ?? null,
    labelAr: pending
      ? "\u0645\u0637\u0627\u0644\u0628\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u2014 \u0645\u0631\u0627\u062c\u0639\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"
      : "\u0645\u0637\u0627\u0644\u0628\u0629 \u062a\u062c\u0627\u0631\u064a\u0629 \u2014 \u062a\u0645\u062a \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629",
    validation,
    review,
  };
}

export async function reviewCommercialClaimOnDeal(
  scope: SalesOrgScope,
  dealId: string,
  claimId: string,
  actor: SalesActor,
): Promise<CommercialClaimReview> {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId: scope.organizationId },
    select: { id: true, metadata: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }

  const { metadata, review } = await markCommercialClaimReviewed({
    scope,
    actor,
    targetType: "SalesDeal",
    targetId: dealId,
    existingMetadata: deal.metadata,
    claimId,
  });

  await prisma.salesDeal.update({
    where: { id: dealId },
    data: { metadata: metadata as Prisma.InputJsonValue, updatedById: actor.id },
  });

  return review;
}
