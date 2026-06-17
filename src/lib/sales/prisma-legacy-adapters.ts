import type {
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
  SalesOpportunityStage,
  SalesRecordSource,
  SalesWinLossInsight,
} from "./types";

function toSource(value: unknown): SalesRecordSource {
  return value === "seed" || value === "import" || value === "ai_draft" || value === "integration"
    ? value
    : "manual";
}

function inferQualificationScore(params: {
  probability?: number | null;
  stageSlug?: string | null;
  status: string;
}): number {
  if (typeof params.probability === "number") {
    return Math.max(0, Math.min(100, Math.round(params.probability)));
  }

  switch (params.stageSlug) {
    case "prospecting":
      return 35;
    case "qualification":
      return 55;
    case "proposal":
      return 70;
    case "negotiation":
      return 82;
    case "won-lost":
      return params.status === "won" ? 95 : 20;
    default:
      return 40;
  }
}

export function mapDealStageToLegacy(params: {
  stageName?: string | null;
  stageSlug?: string | null;
  status: string;
  metadata: Record<string, unknown>;
}): SalesOpportunityStage {
  const reviewStatus =
    typeof params.metadata.reviewStatus === "string"
      ? params.metadata.reviewStatus
      : undefined;

  switch (params.stageSlug) {
    case "prospecting":
      return "Draft";
    case "qualification":
      return "Qualification";
    case "proposal":
      if (reviewStatus === "InReview") {
        return "InReview";
      }
      if (reviewStatus === "Rejected") {
        return "Rejected";
      }
      return "Approved";
    case "negotiation":
      return "Negotiation";
    case "won-lost":
      return params.status === "won" ? "ClosedWon" : "ClosedLost";
    default:
      break;
  }

  switch (params.stageName) {
    case "تقديم":
      return "Draft";
    case "تأهيل":
      return "Qualification";
    case "عرض":
      if (reviewStatus === "InReview") {
        return "InReview";
      }
      if (reviewStatus === "Rejected") {
        return "Rejected";
      }
      return "Approved";
    case "تفاوض":
      return "Negotiation";
    case "فوز/خسارة":
      return params.status === "won" ? "ClosedWon" : "ClosedLost";
    default:
      return "Draft";
  }
}

export function mapPrismaSalesAccount(input: {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  industry: string | null;
  metadata?: Record<string, unknown> | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SalesAccount {
  const metadata = input.metadata ?? {};
  return {
    id: input.id,
    organizationId: input.organizationId,
    name: input.name,
    nameAr:
      typeof metadata.nameAr === "string" ? metadata.nameAr : input.name,
    status: (input.status as SalesAccount["status"]) ?? "active",
    industry: input.industry ?? undefined,
    ownerId:
      typeof metadata.ownerId === "string"
        ? metadata.ownerId
        : input.createdById ?? "system",
    createdById: input.createdById ?? "system",
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString(),
    source: toSource(metadata.source),
    icpFitScore:
      typeof metadata.icpFitScore === "number"
        ? metadata.icpFitScore
        : undefined,
  };
}

export function mapPrismaSalesContact(input: {
  id: string;
  accountId: string;
  organizationId: string;
  name: string;
  email: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SalesContact {
  return {
    id: input.id,
    accountId: input.accountId,
    organizationId: input.organizationId,
    name: input.name,
    title: input.role ?? undefined,
    email: input.email ?? undefined,
    sensitivityLevel: "standard",
    ownerId: "system",
    createdById: "system",
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString(),
    status: "active",
    source: "manual",
  };
}

export function mapPrismaSalesInteraction(input: {
  id: string;
  organizationId: string;
  accountId: string;
  dealId: string | null;
  type: string;
  subject: string | null;
  summary: string | null;
  occurredAt: Date;
  createdById: string | null;
}): SalesInteractionLog {
  const type: SalesInteractionLog["type"] =
    input.type === "call" ||
    input.type === "meeting" ||
    input.type === "email"
      ? input.type
      : "note";

  return {
    id: input.id,
    organizationId: input.organizationId,
    accountId: input.accountId,
    opportunityId: input.dealId ?? undefined,
    type,
    summary: input.summary ?? input.subject ?? "",
    loggedById: input.createdById ?? "system",
    loggedAt: input.occurredAt.toISOString(),
  };
}

export function mapPrismaSalesOpportunity(input: {
  id: string;
  organizationId: string;
  accountId: string;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  probability: number | null;
  expectedCloseDate: Date | null;
  stage?: { name: string; slug: string } | null;
  metadata?: Record<string, unknown> | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SalesOpportunity {
  const metadata = input.metadata ?? {};
  return {
    id: input.id,
    organizationId: input.organizationId,
    accountId: input.accountId,
    name: input.title,
    stage: mapDealStageToLegacy({
      stageName: input.stage?.name,
      stageSlug: input.stage?.slug,
      status: input.status,
      metadata,
    }),
    valueEstimate: input.amount ?? undefined,
    currency: input.currency,
    qualificationScore: inferQualificationScore({
      probability: input.probability,
      stageSlug: input.stage?.slug,
      status: input.status,
    }),
    probability: input.probability ?? undefined,
    expectedCloseDate: input.expectedCloseDate?.toISOString(),
    risks: Array.isArray(metadata.risks)
      ? metadata.risks.filter((value): value is string => typeof value === "string")
      : undefined,
    winLossReason:
      typeof metadata.winLossReason === "string"
        ? metadata.winLossReason
        : typeof metadata.lossReason === "string"
          ? metadata.lossReason
          : undefined,
    ownerId:
      typeof metadata.ownerId === "string"
        ? metadata.ownerId
        : input.createdById ?? "system",
    createdById: input.createdById ?? "system",
    createdAt: input.createdAt.toISOString(),
    updatedAt: input.updatedAt.toISOString(),
    reviewStatus:
      typeof metadata.reviewStatus === "string"
        ? metadata.reviewStatus
        : undefined,
    approvalStatus:
      typeof metadata.approvalStatus === "string"
        ? metadata.approvalStatus
        : undefined,
    source: toSource(metadata.source),
  };
}

function inferClosedReason(opportunity: SalesOpportunity): string {
  const reason = opportunity.winLossReason?.toLowerCase();
  if (!reason) {
    return opportunity.stage === "ClosedWon" ? "expansion_fit" : "price_value";
  }
  if (reason.includes("budget")) return "budget_freeze";
  if (reason.includes("timing")) return "timing";
  if (reason.includes("compet")) return "competitor";
  if (reason.includes("sponsor") || reason.includes("approval")) {
    return "no_executive_sponsor";
  }
  if (reason.includes("expand") || reason.includes("fit")) {
    return "expansion_fit";
  }
  return opportunity.stage === "ClosedWon" ? "expansion_fit" : "price_value";
}

export function deriveWinLossInsightFromOpportunity(
  opportunity: SalesOpportunity,
): SalesWinLossInsight | null {
  if (opportunity.stage !== "ClosedWon" && opportunity.stage !== "ClosedLost") {
    return null;
  }

  return {
    id: `wl-${opportunity.id}`,
    organizationId: opportunity.organizationId,
    opportunityId: opportunity.id,
    accountId: opportunity.accountId,
    outcome: opportunity.stage === "ClosedWon" ? "won" : "lost",
    primaryReason: inferClosedReason(opportunity),
    contributingFactors: opportunity.risks,
    createdById: opportunity.createdById,
    createdAt: opportunity.createdAt ?? new Date().toISOString(),
    updatedAt: opportunity.updatedAt ?? new Date().toISOString(),
    status: "active",
    source: opportunity.source ?? "manual",
  };
}
