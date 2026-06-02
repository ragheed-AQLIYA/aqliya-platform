import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "../audit-events";
import {
  aggregateDealRiskSeverity,
  type DealRiskAssessment,
  type DealRiskFlag,
  type DealRiskFlagId,
} from "../deal-risk-types";
import { OPEN_DEAL_STATUSES } from "../validation";
import type { SalesActor, SalesOrgScope } from "../services";

const MS_PER_DAY = 86_400_000;
const ACTIVITY_GAP_MEDIUM_DAYS = 14;
const ACTIVITY_GAP_HIGH_DAYS = 21;
const NO_RESPONSE_DAYS = 7;
const OUTBOUND_TYPES = new Set(["call", "email"]);

export interface DealRiskInteractionInput {
  type: string;
  occurredAt: Date;
  metadata?: unknown;
}

export interface DealRiskStubDealInput {
  status: string;
  updatedAt: Date;
  metadata: unknown;
}

export interface DealRiskStubContextInput {
  accountMetadata?: unknown;
}

export interface DealRiskStubResult {
  assessment: DealRiskAssessment;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function daysBetween(earlier: Date, later: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function hasStakeholderHints(...sources: unknown[]): boolean {
  for (const source of sources) {
    const meta = parseMetadata(source);
    if (typeof meta.stakeholderHints === "string" && meta.stakeholderHints.trim()) {
      return true;
    }
    if (Array.isArray(meta.stakeholderHints) && meta.stakeholderHints.length > 0) {
      return true;
    }
    if (Array.isArray(meta.stakeholders) && meta.stakeholders.length > 0) {
      return true;
    }
    if (Array.isArray(meta.contacts) && meta.contacts.length > 0) {
      return true;
    }
    const hint = meta.stakeholderHint;
    if (typeof hint === "string" && hint.trim()) return true;
  }
  return false;
}

function interactionDirection(
  type: string,
  metadata: unknown,
): "outbound" | "inbound" | "neutral" {
  const meta = parseMetadata(metadata);
  const direction = meta.direction ?? meta.interactionDirection;
  if (direction === "outbound" || direction === "inbound") {
    return direction;
  }
  if (meta.awaitingReply === true || meta.awaitingResponse === true) {
    return "outbound";
  }
  if (OUTBOUND_TYPES.has(type)) return "outbound";
  if (type === "meeting") return "inbound";
  return "neutral";
}

function isOpenDeal(status: string): boolean {
  return (OPEN_DEAL_STATUSES as readonly string[]).includes(status);
}

function pushFlag(
  flags: DealRiskFlag[],
  id: DealRiskFlagId,
  severity: DealRiskFlag["severity"],
  message: string,
) {
  if (flags.some((f) => f.id === id)) return;
  flags.push({ id, severity, message });
}

/** Pure rules engine — advisory only, no LLM. */
export function computeDealRiskStub(
  deal: DealRiskStubDealInput,
  interactions: DealRiskInteractionInput[],
  context: DealRiskStubContextInput = {},
): DealRiskStubResult {
  const flags: DealRiskFlag[] = [];
  const now = new Date();
  const dealMeta = parseMetadata(deal.metadata);
  const open = isOpenDeal(deal.status);

  const sorted = [...interactions].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
  const lastInteraction = sorted[0] ?? null;

  if (open) {
    if (!lastInteraction) {
      const daysSinceUpdate = daysBetween(deal.updatedAt, now);
      pushFlag(
        flags,
        "activity_gap",
        daysSinceUpdate >= ACTIVITY_GAP_HIGH_DAYS ? "high" : "medium",
        `لا توجد تفاعلات مسجّلة على الصفقة منذ ${daysSinceUpdate} يومًا.`,
      );
    } else {
      const gapDays = daysBetween(lastInteraction.occurredAt, now);
      if (gapDays >= ACTIVITY_GAP_HIGH_DAYS) {
        pushFlag(
          flags,
          "activity_gap",
          "high",
          `آخر تفاعل قبل ${gapDays} يومًا — فجوة نشاط طويلة.`,
        );
      } else if (gapDays >= ACTIVITY_GAP_MEDIUM_DAYS) {
        pushFlag(
          flags,
          "activity_gap",
          "medium",
          `آخر تفاعل قبل ${gapDays} يومًا — فجوة نشاط.`,
        );
      }
    }

    const awaitingExplicit =
      dealMeta.awaitingResponse === true || dealMeta.awaitingReply === true;

    if (awaitingExplicit) {
      pushFlag(
        flags,
        "no_response",
        "medium",
        "البيانات الوصفية تشير إلى انتظار رد من الطرف الآخر.",
      );
    } else if (lastInteraction) {
      const direction = interactionDirection(
        lastInteraction.type,
        lastInteraction.metadata,
      );
      const daysSinceLast = daysBetween(lastInteraction.occurredAt, now);
      if (
        direction === "outbound" &&
        daysSinceLast >= NO_RESPONSE_DAYS &&
        OUTBOUND_TYPES.has(lastInteraction.type)
      ) {
        pushFlag(
          flags,
          "no_response",
          daysSinceLast >= 14 ? "high" : "medium",
          `آخر تواصل (${lastInteraction.type}) صادر منذ ${daysSinceLast} يومًا دون متابعة واردة.`,
        );
      }
    }
  }

  if (
    open &&
    !hasStakeholderHints(deal.metadata, context.accountMetadata)
  ) {
    pushFlag(
      flags,
      "missing_stakeholder_hint",
      "low",
      "No stakeholder hints in deal/account metadata (stakeholderHints / stakeholders / contacts).",
    );
  }

  const severity = aggregateDealRiskSeverity(flags);
  const assessment: DealRiskAssessment & { notes?: string } = {
    riskFlags: flags,
    severity,
    computedAt: now.toISOString(),
    source: "rules-agent",
    advisoryOnly: true,
    agentGenerated: true,
    notes: "Stub PR-17 — rule-based risk assessment, no LLM.",
  };

  return { assessment };
}

async function loadDealForRisk(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: {
      id: true,
      title: true,
      status: true,
      metadata: true,
      updatedAt: true,
      accountId: true,
      account: { select: { metadata: true } },
    },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function loadDealInteractionsForRisk(
  dealId: string,
  organizationId: string,
): Promise<DealRiskInteractionInput[]> {
  const rows = await prisma.salesInteraction.findMany({
    where: { dealId, organizationId },
    select: {
      type: true,
      occurredAt: true,
      metadata: true,
    },
    orderBy: { occurredAt: "desc" },
  });

  return rows
    .filter((row) => {
      const deletedAt = parseMetadata(row.metadata).deletedAt;
      return !(typeof deletedAt === "string" && deletedAt.length > 0);
    })
    .map((row) => ({
      type: row.type,
      occurredAt: row.occurredAt,
      metadata: row.metadata,
    }));
}

export async function recalculateDealRisk(
  dealId: string,
  scope: SalesOrgScope,
  actor: SalesActor,
): Promise<{
  deal: Awaited<ReturnType<typeof loadDealForRisk>>;
  result: DealRiskStubResult;
}> {
  const deal = await loadDealForRisk(dealId, scope.organizationId);
  const interactions = await loadDealInteractionsForRisk(
    dealId,
    scope.organizationId,
  );

  const result = computeDealRiskStub(
    {
      status: deal.status,
      updatedAt: deal.updatedAt,
      metadata: deal.metadata,
    },
    interactions,
    { accountMetadata: deal.account?.metadata },
  );

  const existingMeta = parseMetadata(deal.metadata);
  const updated = await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: {
        ...existingMeta,
        riskAssessment: result.assessment,
      } as unknown as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      title: true,
      status: true,
      metadata: true,
      updatedAt: true,
      accountId: true,
      account: { select: { metadata: true } },
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name ?? undefined,
    action: SalesAuditActions.AGENT_DEAL_RISK_COMPUTED,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: {
      severity: result.assessment.severity,
      flagCount: result.assessment.riskFlags.length,
      flagIds: result.assessment.riskFlags.map((f) => f.id),
      agentGenerated: true,
      advisoryOnly: true,
    },
  });

  return { deal: updated, result };
}

export { readDealRiskAssessment } from "./deal-risk-shared";
