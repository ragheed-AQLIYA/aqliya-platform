/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── SalesOS Prisma persistence layer ───
// Tenant-scoped CRUD. Enabled via SALESOS_PRISMA_PERSISTENCE=1.
//
// === R-04 Resolution: Schema Alignment Complete ===
// Prisma schema fields added 2026-06-21:
//   SalesAccount:  nameAr, ownerId
//   SalesContact:  title, phone, sensitivityLevel, ownerId, createdById
//   SalesDeal:     name, pipelineStage, qualificationScore, reviewStatus,
//                  approvalStatus, ownerId
//   SalesInteraction: contactId, evidenceRef
//
// All core model references now use correct Prisma model names and field names.
// No `as any` casts remain for core CRUD (SalesAccount, SalesContact, SalesDeal,
// SalesInteraction, SalesEvidenceLink).
//
// Tier B/A models (salesMarketSignal, salesKnowledgeGraphNode, etc.) remain as
// optional schema extensions with `as any` + fail-soft try/catch. These are
// intentionally not typed — they depend on advanced schema extensions not part
// of the SalesOS v0.1 baseline.

import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
} from "./types";
import type { SalesAuditEntry, SalesEvidenceRef } from "./store";
import { buildSalesSeedData } from "./seed-data";

function toAccount(row: {
  id: string;
  organizationId: string;
  name: string;
  nameAr: string | null;
  industry: string | null;
  status: string;
  ownerId: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SalesAccount {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    industry: row.industry ?? undefined,
    status: row.status as SalesAccount["status"],
    ownerId: row.ownerId ?? "",
    createdById: row.createdById ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toContact(row: {
  id: string;
  organizationId: string;
  accountId: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  sensitivityLevel: string;
  ownerId: string | null;
  createdById: string | null;
}): SalesContact {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    name: row.name,
    title: row.title ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    sensitivityLevel: row.sensitivityLevel as SalesContact["sensitivityLevel"],
    ownerId: row.ownerId ?? "",
    createdById: row.createdById ?? "",
  };
}

function toOpportunity(row: {
  id: string;
  organizationId: string;
  accountId: string;
  name: string | null;
  title: string;
  pipelineStage: string;
  amount: number | null;
  currency: string;
  qualificationScore: number | null;
  ownerId: string | null;
  createdById: string | null;
  reviewStatus: string | null;
  approvalStatus: string | null;
  probability: number | null;
  expectedCloseDate: Date | null;
}): SalesOpportunity {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    name: row.name ?? row.title,
    stage: row.pipelineStage as SalesOpportunity["stage"],
    valueEstimate: row.amount ?? undefined,
    currency: row.currency === "SAR" ? undefined : row.currency,
    qualificationScore: row.qualificationScore ?? undefined,
    ownerId: row.ownerId ?? "",
    createdById: row.createdById ?? "",
    reviewStatus: row.reviewStatus ?? undefined,
    approvalStatus: row.approvalStatus ?? undefined,
    probability: row.probability ?? undefined,
    expectedCloseDate: row.expectedCloseDate?.toISOString() ?? undefined,
  };
}

function toInteraction(row: {
  id: string;
  organizationId: string;
  accountId: string;
  dealId: string | null;
  contactId: string | null;
  type: string;
  summary: string | null;
  evidenceRef: string | null;
  createdById: string | null;
  occurredAt: Date;
}): SalesInteractionLog {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    opportunityId: row.dealId ?? undefined,
    contactId: row.contactId ?? undefined,
    type: row.type as SalesInteractionLog["type"],
    summary: row.summary ?? "",
    evidenceRef: row.evidenceRef ?? undefined,
    loggedById: row.createdById ?? "",
    loggedAt: row.occurredAt.toISOString(),
  };
}

function toEvidence(row: {
  id: string;
  organizationId: string;
  targetId: string;
  evidenceId: string;
  label: string | null;
  createdById: string | null;
  createdAt: Date;
}): SalesEvidenceRef {
  return {
    id: row.id,
    organizationId: row.organizationId,
    opportunityId: row.targetId,
    typeId: row.evidenceId,
    label: row.label ?? "",
    linkedById: row.createdById ?? "",
    linkedAt: row.createdAt.toISOString(),
  };
}

export async function prismaLoadOrgSnapshot(organizationId: string): Promise<{
  accounts: SalesAccount[];
  contacts: SalesContact[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  evidence: SalesEvidenceRef[];
  seeded: boolean;
} | null> {
  const accountCount = await prisma.salesAccount.count({
    where: { organizationId },
  });
  if (accountCount === 0) return null;

  const [accounts, contacts, deals, interactions, evidence] =
    await Promise.all([
      prisma.salesAccount.findMany({ where: { organizationId } }),
      prisma.salesContact.findMany({ where: { organizationId } }),
      prisma.salesDeal.findMany({ where: { organizationId } }),
      prisma.salesInteraction.findMany({ where: { organizationId } }),
      prisma.salesEvidenceLink.findMany({ where: { organizationId } }),
    ]);

  return {
    accounts: accounts.map(toAccount),
    contacts: contacts.map(toContact),
    opportunities: deals.map(toOpportunity),
    interactions: interactions.map(toInteraction),
    evidence: evidence.map(toEvidence),
    seeded: true,
  };
}

export async function prismaSeedOrg(
  organizationId: string,
  ownerId: string,
): Promise<void> {
  const existing = await prisma.salesAccount.count({
    where: { organizationId },
  });
  if (existing > 0) return;

  const seed = buildSalesSeedData(organizationId, ownerId);

  await prisma.$transaction(async (tx) => {
    for (const a of seed.accounts) {
      await tx.salesAccount.create({
        data: {
          id: a.id,
          organizationId: a.organizationId,
          name: a.name,
          nameAr: a.nameAr ?? null,
          industry: a.industry ?? null,
          status: a.status,
          ownerId: a.ownerId ?? null,
          createdById: a.createdById ?? null,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        },
      });
    }
    for (const c of seed.contacts) {
      await tx.salesContact.create({
        data: {
          id: c.id,
          organizationId: c.organizationId,
          accountId: c.accountId,
          name: c.name,
          title: c.title ?? null,
          email: c.email ?? null,
          phone: c.phone ?? null,
          sensitivityLevel: c.sensitivityLevel ?? "standard",
          ownerId: c.ownerId ?? null,
          createdById: c.createdById ?? null,
        },
      });
    }
    for (const o of seed.opportunities) {
      await tx.salesDeal.create({
        data: {
          id: o.id,
          organizationId: o.organizationId,
          accountId: o.accountId,
          name: o.name,
          title: o.name,
          pipelineStage: o.stage ?? "new",
          stageId: null,
          amount: o.valueEstimate ?? null,
          currency: o.currency ?? "SAR",
          qualificationScore: o.qualificationScore ?? null,
          ownerId: o.ownerId ?? null,
          createdById: o.createdById ?? null,
          reviewStatus: o.reviewStatus ?? null,
          approvalStatus: o.approvalStatus ?? null,
          status: "open",
        },
      });
    }
    for (const i of seed.interactions) {
      await tx.salesInteraction.create({
        data: {
          id: i.id,
          organizationId: i.organizationId,
          accountId: i.accountId,
          dealId: i.opportunityId ?? null,
          contactId: i.contactId ?? null,
          type: i.type,
          subject: i.summary,
          summary: i.summary,
          evidenceRef: i.evidenceRef ?? null,
          occurredAt: new Date(i.loggedAt),
          createdById: i.loggedById ?? null,
        },
      });
    }
  });
}

export async function prismaCreateAccount(
  account: SalesAccount,
): Promise<void> {
  await prisma.salesAccount.create({
    data: {
      id: account.id,
      organizationId: account.organizationId,
      name: account.name,
      nameAr: account.nameAr ?? null,
      industry: account.industry ?? null,
      status: account.status,
      ownerId: account.ownerId ?? null,
      createdById: account.createdById ?? null,
      createdAt: new Date(account.createdAt),
      updatedAt: new Date(account.updatedAt),
    },
  });
}

export async function prismaCreateOpportunity(
  opportunity: SalesOpportunity,
): Promise<void> {
  await prisma.salesDeal.create({
    data: {
      id: opportunity.id,
      organizationId: opportunity.organizationId,
      accountId: opportunity.accountId,
      title: opportunity.name,
      amount: opportunity.valueEstimate,
      status: "open",
      createdById: opportunity.createdById,
    },
  });
}

export async function prismaCreateInteraction(
  interaction: SalesInteractionLog,
): Promise<void> {
  await prisma.salesInteraction.create({
    data: {
      id: interaction.id,
      organizationId: interaction.organizationId,
      accountId: interaction.accountId,
      dealId: interaction.opportunityId,
      type: interaction.type,
      summary: interaction.summary,
      subject: interaction.summary,
      occurredAt: new Date(interaction.loggedAt),
      createdById: interaction.loggedById,
    },
  });
}

export async function prismaUpdateOpportunity(
  organizationId: string,
  opportunityId: string,
  patch: Partial<SalesOpportunity>,
): Promise<void> {
  await prisma.salesDeal.updateMany({
    where: { id: opportunityId, organizationId },
    data: {
      ...(patch.stage !== undefined ? { pipelineStage: patch.stage } : {}),
      ...(patch.reviewStatus !== undefined
        ? { reviewStatus: patch.reviewStatus }
        : {}),
      ...(patch.approvalStatus !== undefined
        ? { approvalStatus: patch.approvalStatus }
        : {}),
      ...(patch.valueEstimate !== undefined
        ? { amount: patch.valueEstimate }
        : {}),
      ...(patch.qualificationScore !== undefined
        ? { qualificationScore: patch.qualificationScore }
        : {}),
    },
  });
}

export async function prismaCreateEvidence(
  ref: SalesEvidenceRef,
): Promise<void> {
  await prisma.salesEvidenceLink.create({
    data: {
      id: ref.id,
      organizationId: ref.organizationId,
      targetType: "SalesDeal",
      targetId: ref.opportunityId,
      dealId: ref.opportunityId,
      evidenceId: ref.typeId,
      evidenceType: ref.typeId,
      label: ref.label,
      createdById: ref.linkedById,
      createdAt: new Date(ref.linkedAt),
    },
  });
}

export async function prismaAppendAuditEntry(
  _entry: SalesAuditEntry,
): Promise<void> {
  // Platform audit trail handles persistence via recordAuditEventSafe.
  // Sales-local audit log remains in-memory/file snapshot only.
}

// ─── Tier B3 intelligence (knowledge graph) ───

interface TierB3NodeRow {
  id: string;
  organizationId: string;
  kind: string;
  refId: string | null;
  label: string | null;
  graphBuildId: string | null;
  builtAt: Date | null;
  source: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
}

interface TierB3EdgeRow {
  id: string;
  organizationId: string;
  kind: string;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  graphBuildId: string | null;
  builtAt: Date | null;
  source: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
}

function toTierB3Node(row: TierB3NodeRow) {
  const ts = row.createdAt.toISOString();
  return {
    id: row.id,
    organizationId: row.organizationId,
    kind: row.kind,
    refId: row.refId ?? "",
    label: row.label ?? "",
    graphBuildId: row.graphBuildId ?? "",
    builtAt: row.builtAt?.toISOString() ?? ts,
    source: row.source ?? "",
    status: row.status ?? "active",
    createdAt: ts,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById ?? "",
  };
}

function toTierB3Edge(row: TierB3EdgeRow) {
  const ts = row.createdAt.toISOString();
  return {
    id: row.id,
    organizationId: row.organizationId,
    kind: row.kind,
    sourceNodeId: row.sourceNodeId ?? "",
    targetNodeId: row.targetNodeId ?? "",
    graphBuildId: row.graphBuildId ?? "",
    builtAt: row.builtAt?.toISOString() ?? ts,
    source: row.source ?? "",
    status: row.status ?? "active",
    createdAt: ts,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById ?? "",
  };
}

// ─── Tier B1 (market signals, commercial recommendations) ───

export function isTierB1PrismaReady(): boolean {
  const db = prisma as any;
  return !!(db.salesMarketSignal?.findMany && db.salesCommercialRecommendation?.findMany);
}

export async function prismaLoadTierB1Intelligence(
  organizationId: string,
): Promise<{
  marketSignals: Map<string, unknown>;
  commercialRecommendations: Map<string, unknown>;
} | null> {
  try {
    const db = prisma as any;
    const [signals, recs] = await Promise.all([
      db.salesMarketSignal.findMany({ where: { organizationId } }),
      db.salesCommercialRecommendation.findMany({ where: { organizationId } }),
    ]);
    return {
      marketSignals: new Map(signals.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      commercialRecommendations: new Map(recs.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateMarketSignal(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesMarketSignal.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateMarketSignal(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesMarketSignal.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteMarketSignal(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesMarketSignal.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateCommercialRecommendation(
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesCommercialRecommendation.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateCommercialRecommendation(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesCommercialRecommendation.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteCommercialRecommendation(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesCommercialRecommendation.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

// ─── Tier B2 (institutional learning insights) ───

export function isTierB2PrismaReady(): boolean {
  const db = prisma as any;
  return !!(db.salesInstitutionalLearningInsight?.findMany);
}

export async function prismaLoadTierB2Intelligence(
  organizationId: string,
): Promise<{
  institutionalLearningInsights: Map<string, unknown>;
} | null> {
  try {
    const db = prisma as any;
    const rows = await db.salesInstitutionalLearningInsight.findMany({
      where: { organizationId },
    });
    return {
      institutionalLearningInsights: new Map(rows.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateInstitutionalLearningInsight(
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesInstitutionalLearningInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateInstitutionalLearningInsight(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesInstitutionalLearningInsight.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteInstitutionalLearningInsight(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesInstitutionalLearningInsight.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

// ─── Tier B3 (knowledge graph) ───

export function isTierB3PrismaReady(): boolean {
  return !!(prisma as any).salesKnowledgeGraphNode;
}

export async function prismaLoadTierB3Intelligence(
  organizationId: string,
): Promise<{
  knowledgeGraphNodes: Map<string, ReturnType<typeof toTierB3Node>>;
  knowledgeGraphEdges: Map<string, ReturnType<typeof toTierB3Edge>>;
} | null> {
  try {
    const db = prisma as any;
    if (!db.salesKnowledgeGraphNode || !db.salesKnowledgeGraphEdge) return null;

    const [nodes, edges] = await Promise.all([
      db.salesKnowledgeGraphNode.findMany({ where: { organizationId } }),
      db.salesKnowledgeGraphEdge.findMany({ where: { organizationId } }),
    ]);

    return {
      knowledgeGraphNodes: new Map(
        nodes.map((row: TierB3NodeRow) => [row.id, toTierB3Node(row)]),
      ),
      knowledgeGraphEdges: new Map(
        edges.map((row: TierB3EdgeRow) => [row.id, toTierB3Edge(row)]),
      ),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateKnowledgeGraphNode(node: {
  id: string;
  organizationId: string;
  kind: string;
  refId: string;
  label: string;
  graphBuildId: string;
  builtAt: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesKnowledgeGraphNode.create({
      data: {
        id: node.id,
        organizationId: node.organizationId,
        kind: node.kind,
        refId: node.refId,
        label: node.label,
        graphBuildId: node.graphBuildId,
        builtAt: new Date(node.builtAt),
        source: node.source,
        status: node.status,
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
        createdById: node.createdById,
      },
    });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateKnowledgeGraphEdge(edge: {
  id: string;
  organizationId: string;
  kind: string;
  sourceNodeId: string;
  targetNodeId: string;
  graphBuildId: string;
  builtAt: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesKnowledgeGraphEdge.create({
      data: {
        id: edge.id,
        organizationId: edge.organizationId,
        kind: edge.kind,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        graphBuildId: edge.graphBuildId,
        builtAt: new Date(edge.builtAt),
        source: edge.source,
        status: edge.status,
        createdAt: new Date(edge.createdAt),
        updatedAt: new Date(edge.updatedAt),
        createdById: edge.createdById,
      },
    });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateKnowledgeGraphNode(
  organizationId: string,
  nodeId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesKnowledgeGraphNode.updateMany({
      where: { id: nodeId, organizationId },
      data: patch,
    });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteKnowledgeGraphEdge(
  organizationId: string,
  edgeId: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesKnowledgeGraphEdge.deleteMany({
      where: { id: edgeId, organizationId },
    });
  } catch {
    // fail-soft
  }
}

// ─── Tier A (signals, objections, mentions, insights, etc.) ───

const TIER_A_DELEGATES = [
  "salesSignal",
  "salesObjection",
  "salesCompetitorMention",
  "salesWinLossInsight",
  "salesICPInsight",
  "salesNextAction",
  "salesProofAsset",
] as const;

export function isTierAPrismaIntelligenceReady(): boolean {
  const db = prisma as any;
  return TIER_A_DELEGATES.every((name) => !!db[name]?.findMany);
}

export async function prismaLoadTierAIntelligence(
  organizationId: string,
): Promise<Record<string, Map<string, unknown>> | null> {
  try {
    const db = prisma as any;
    const [signals, objections, mentions, winLoss, icp, actions, proofs] =
      await Promise.all([
        db.salesSignal.findMany({ where: { organizationId } }),
        db.salesObjection.findMany({ where: { organizationId } }),
        db.salesCompetitorMention.findMany({ where: { organizationId } }),
        db.salesWinLossInsight.findMany({ where: { organizationId } }),
        db.salesICPInsight.findMany({ where: { organizationId } }),
        db.salesNextAction.findMany({ where: { organizationId } }),
        db.salesProofAsset.findMany({ where: { organizationId } }),
      ]);
    return {
      signals: new Map(signals.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      objections: new Map(objections.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      competitorMentions: new Map(mentions.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      winLossInsights: new Map(winLoss.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      icpInsights: new Map(icp.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      nextActions: new Map(actions.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
      proofAssets: new Map(proofs.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateSignal(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesSignal.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateSignal(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesSignal.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteSignal(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesSignal.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateObjection(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesObjection.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateCompetitorMention(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesCompetitorMention.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateWinLossInsight(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesWinLossInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateICPInsight(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesICPInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateNextAction(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesNextAction.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateProofAsset(data: Record<string, unknown>): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesProofAsset.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteProofAsset(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = prisma as any;
    await db.salesProofAsset.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}
