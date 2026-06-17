import "server-only";

import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import { scoreToLevel } from "@/lib/platform/intelligence";
import { prisma } from "@/lib/prisma";
import type { SalesAuditEntry } from "./store";
import type {
  SalesCompetitorMentionView,
  SalesICPInsight,
  SalesInteractionLog,
  SalesObjectionSignal,
  SalesOpportunity,
} from "./types";
import {
  deriveWinLossInsightFromOpportunity,
  mapPrismaSalesAccount,
  mapPrismaSalesContact,
  mapPrismaSalesInteraction,
  mapPrismaSalesOpportunity,
} from "./prisma-legacy-adapters";
import {
  deriveCompetitorMentions,
  extractObjectionsFromInteractions,
} from "./intelligence/commercial-memory";
import {
  buildICPLearningSnapshot,
  type ICPLearningSnapshot,
} from "./vnext/icp-learning";
import {
  buildOpportunityIntelligence,
  type OpportunityIntelligenceSummary,
} from "./vnext/opportunity-intelligence";

export interface SalesICPLearningFromPrisma {
  snapshot: ICPLearningSnapshot;
  accountCount: number;
  dealCount: number;
}

export interface SalesIntelligenceMemorySnapshot {
  objections: SalesObjectionSignal[];
  competitors: SalesCompetitorMentionView[];
  signals: IntelligenceSignal[];
  auditRecent: SalesAuditEntry[];
  interactionCount: number;
  opportunityInsights: Array<{
    opportunity: SalesOpportunity;
    intelligence: OpportunityIntelligenceSummary;
  }>;
  accountCount: number;
  dealCount: number;
}

async function loadSalesKnowledgeBase(organizationId: string) {
  const [accounts, contacts, deals, interactions] = await Promise.all([
    prisma.salesAccount.findMany({
      where: { organizationId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        status: true,
        industry: true,
        metadata: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.salesContact.findMany({
      where: { organizationId },
      select: {
        id: true,
        accountId: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.salesDeal.findMany({
      where: { organizationId },
      select: {
        id: true,
        organizationId: true,
        accountId: true,
        title: true,
        status: true,
        amount: true,
        currency: true,
        probability: true,
        expectedCloseDate: true,
        metadata: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        stage: { select: { name: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.salesInteraction.findMany({
      where: { organizationId },
      select: {
        id: true,
        organizationId: true,
        accountId: true,
        dealId: true,
        type: true,
        subject: true,
        summary: true,
        occurredAt: true,
        createdById: true,
      },
      orderBy: { occurredAt: "desc" },
    }),
  ]);

  return {
    accounts: accounts.map((account) =>
      mapPrismaSalesAccount({
        ...account,
        metadata:
          account.metadata && typeof account.metadata === "object"
            ? (account.metadata as Record<string, unknown>)
            : null,
      }),
    ),
    contacts: contacts.map(mapPrismaSalesContact),
    opportunities: deals.map((deal) =>
      mapPrismaSalesOpportunity({
        ...deal,
        metadata:
          deal.metadata && typeof deal.metadata === "object"
            ? (deal.metadata as Record<string, unknown>)
            : null,
      }),
    ),
    interactions: interactions.map(mapPrismaSalesInteraction),
  };
}

function buildDerivedICPInsights(params: {
  organizationId: string;
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
}): SalesICPInsight[] {
  const objections = extractObjectionsFromInteractions(params.interactions);
  const highestValueOpportunity = [...params.opportunities].sort(
    (a, b) => (b.valueEstimate ?? 0) - (a.valueEstimate ?? 0),
  )[0];
  const insights: SalesICPInsight[] = [];

  if (objections[0]) {
    const now = new Date().toISOString();
    insights.push({
      id: "prisma-icp-pain-point",
      organizationId: params.organizationId,
      dimension: "pain_point",
      hypothesis: objections[0].labelAr,
      evidenceSummary: `تكررت هذه الإشارة ${objections[0].count} مرات في التفاعلات التجارية.`,
      recommendation: `عالج ${objections[0].labelAr} مبكراً داخل التأهيل والعروض.`,
      createdById: "system",
      createdAt: now,
      updatedAt: now,
      status: "active",
      source: "manual",
      confidence: { score: Math.min(0.85, 0.45 + objections[0].count * 0.1), rationale: "auto", generatedAt: new Date().toISOString(), outputStatus: "draft" },
    });
  }

  if (highestValueOpportunity) {
    const now = new Date().toISOString();
    insights.push({
      id: "prisma-icp-region-other",
      organizationId: params.organizationId,
      accountId: highestValueOpportunity.accountId,
      dimension: "other",
      hypothesis: `الفرص الأعلى قيمة تتركز حول ${highestValueOpportunity.stage}`,
      evidenceSummary: `أعلى صفقة حالية بقيمة ${(highestValueOpportunity.valueEstimate ?? 0).toLocaleString("ar-SA")} ر.س في مرحلة ${highestValueOpportunity.stage}.`,
      recommendation: "راجع شروط الإثبات والمراجعة في الصفقات الأعلى قيمة قبل التوسّع.",
      createdById: highestValueOpportunity.createdById,
      createdAt: now,
      updatedAt: now,
      status: "active",
      source: "manual",
      confidence: { score: 0.58, rationale: "auto", generatedAt: new Date().toISOString(), outputStatus: "draft" },
    });
  }

  return insights;
}

function buildSignals(params: {
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  objections: SalesObjectionSignal[];
}): IntelligenceSignal[] {
  const openDeals = params.opportunities.filter(
    (opportunity) =>
      opportunity.stage !== "ClosedWon" && opportunity.stage !== "ClosedLost",
  );
  const reviewRequired = openDeals.filter(
    (opportunity) =>
      opportunity.stage === "InReview" || opportunity.approvalStatus !== "Approved",
  ).length;
  const recentInteractionCount = params.interactions.filter((interaction) => {
    const loggedAt = new Date(interaction.loggedAt).getTime();
    return Date.now() - loggedAt <= 14 * 86400000;
  }).length;
  const totalPipeline = openDeals.reduce(
    (sum, opportunity) => sum + (opportunity.valueEstimate ?? 0),
    0,
  );

  const rawSignals = [
    {
      id: "pipeline-open-deals",
      value: Math.min(95, openDeals.length * 15 + 20),
      label: `مسار نشط بقيمة ${Math.round(totalPipeline).toLocaleString("ar-SA")} ر.س`,
      description: `${openDeals.length} صفقات مفتوحة في المسار الحالي`,
    },
    {
      id: "recent-activity",
      value:
        params.interactions.length > 0
          ? Math.round((recentInteractionCount / params.interactions.length) * 100)
          : 10,
      label: `نشاط حديث: ${recentInteractionCount} تفاعلات خلال 14 يوماً`,
      description: "إشارة مشتقة من تكرار التفاعل الحديث عبر الحسابات",
    },
    {
      id: "review-pressure",
      value: Math.max(5, 100 - reviewRequired * 18),
      label: `ضغط المراجعة: ${reviewRequired} صفقات تحتاج اعتماداً أو مراجعة`,
      description: `عدد الاعتراضات المستخرجة: ${params.objections.length}`,
    },
  ];

  return rawSignals.map((signal) => ({
    id: signal.id,
    dimension: "pipeline_quality",
    level: scoreToLevel(signal.value),
    value: signal.value,
    confidence: 0.7,
    label: signal.label,
    description: signal.description,
    module: "sales",
    timestamp: new Date(),
    source: "derived",
  }));
}

export async function getSalesICPLearningFromPrisma(
  organizationId: string,
): Promise<SalesICPLearningFromPrisma> {
  const { accounts, contacts, opportunities, interactions } =
    await loadSalesKnowledgeBase(organizationId);
  const winLossInsights = opportunities
    .map(deriveWinLossInsightFromOpportunity)
    .filter((value): value is NonNullable<typeof value> => value !== null);
  const snapshot = buildICPLearningSnapshot({
    organizationId,
    accounts,
    opportunities,
    contacts,
    icpInsights: buildDerivedICPInsights({
      organizationId,
      opportunities,
      interactions,
    }),
    winLossInsights,
    interactions,
  });

  return {
    snapshot,
    accountCount: accounts.length,
    dealCount: opportunities.length,
  };
}

export async function getSalesIntelligenceMemoryFromPrisma(
  organizationId: string,
): Promise<SalesIntelligenceMemorySnapshot> {
  const [{ accounts, opportunities, interactions }, evidenceLinks, approvals, auditRecent] =
    await Promise.all([
      loadSalesKnowledgeBase(organizationId),
      prisma.salesEvidenceLink.findMany({
        where: { organizationId, dealId: { not: null } },
        select: { dealId: true },
      }),
      prisma.salesApproval.findMany({
        where: { organizationId, dealId: { not: null }, status: "approved" },
        select: { dealId: true },
      }),
      prisma.salesAuditEvent.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          organizationId: true,
          actorId: true,
          action: true,
          targetType: true,
          targetId: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ]);

  const evidenceCountByDeal = new Map<string, number>();
  for (const link of evidenceLinks) {
    if (!link.dealId) continue;
    evidenceCountByDeal.set(link.dealId, (evidenceCountByDeal.get(link.dealId) ?? 0) + 1);
  }

  const approvedDeals = new Set(
    approvals
      .map((approval) => approval.dealId)
      .filter((dealId): dealId is string => typeof dealId === "string"),
  );

  const objections = extractObjectionsFromInteractions(interactions);
  const competitors = deriveCompetitorMentions(accounts, interactions);
  const interactionCountByDeal = new Map<string, number>();
  for (const interaction of interactions) {
    if (!interaction.opportunityId) continue;
    interactionCountByDeal.set(
      interaction.opportunityId,
      (interactionCountByDeal.get(interaction.opportunityId) ?? 0) + 1,
    );
  }

  return {
    objections,
    competitors,
    signals: buildSignals({
      opportunities,
      interactions,
      objections,
    }),
    auditRecent: auditRecent.map((event) => ({
      id: event.id,
      organizationId: event.organizationId,
      action: event.action,
      actorId: event.actorId,
      targetType: event.targetType,
      targetId: event.targetId,
      timestamp: event.createdAt.toISOString(),
      metadata:
        event.metadata && typeof event.metadata === "object"
          ? (event.metadata as Record<string, unknown>)
          : undefined,
    })),
    interactionCount: interactions.length,
    opportunityInsights: opportunities.map((opportunity) => ({
      opportunity,
      intelligence: buildOpportunityIntelligence({
        opportunity,
        evidenceCount: evidenceCountByDeal.get(opportunity.id) ?? 0,
        interactionCount: interactionCountByDeal.get(opportunity.id) ?? 0,
        hasApprovedClaims: approvedDeals.has(opportunity.id),
      }),
    })),
    accountCount: accounts.length,
    dealCount: opportunities.length,
  };
}
