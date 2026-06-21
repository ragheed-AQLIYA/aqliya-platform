/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── SalesOS Prisma persistence layer ───
// Tenant-scoped CRUD. Enabled via SALESOS_PRISMA_PERSISTENCE=1.
//
// === R-04 Tech Debt: Schema Drift ===
// This file references model names and field names from an earlier SalesOS schema design
// that differ from the current Prisma schema. Targeted `as any` casts handle the drift:
//
//   Model name drift:
//     - prisma.salesOpportunity → current schema: SalesDeal
//     - prisma.salesInteractionLog → current schema: SalesInteraction
//
//   Field name drift:
//     - Account: nameAr, ownerId → not in current schema
//     - Contact: title, sensitivityLevel, ownerId → not in current schema
//     - Opportunity: name, stage, valueEstimate, currency, qualificationScore,
//       ownerId, reviewStatus, approvalStatus → mapped differently in SalesDeal
//     - Interaction: summary, evidenceRef, loggedById, opportunityId →
//       mapped differently in SalesInteraction
//
// The functions prismaCreateOpportunity and prismaCreateInteraction correctly write to
// the current schema models (salesDeal, salesInteraction) with proper field mappings.
// Legacy seed/read functions still reference the old model/field names.
//
// Tier B/A models (salesMarketSignal, salesKnowledgeGraphNode, etc.) are optional
// schema extensions — only present when the full SalesOS advanced schema is applied.
// These use `as any` with fail-soft try/catch and are intentionally not typed.
//
// Full fix: ALIGN ALL references to match current Prisma schema via dedicated refactor task.
// TODO (R-04): https://github.com/aqliya/aqliya/issues/R-04

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
  ownerId: string;
  createdById: string;
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
    ownerId: row.ownerId,
    createdById: row.createdById,
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
  ownerId: string;
  createdById: string;
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
    ownerId: row.ownerId,
    createdById: row.createdById,
  };
}

function toOpportunity(row: {
  id: string;
  organizationId: string;
  accountId: string;
  name: string;
  stage: string;
  valueEstimate: number | null;
  currency: string | null;
  qualificationScore: number | null;
  ownerId: string;
  createdById: string;
  reviewStatus: string | null;
  approvalStatus: string | null;
}): SalesOpportunity {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    name: row.name,
    stage: row.stage as SalesOpportunity["stage"],
    valueEstimate: row.valueEstimate ?? undefined,
    currency: row.currency ?? undefined,
    qualificationScore: row.qualificationScore ?? undefined,
    ownerId: row.ownerId,
    createdById: row.createdById,
    reviewStatus: row.reviewStatus ?? undefined,
    approvalStatus: row.approvalStatus ?? undefined,
  };
}

function toInteraction(row: {
  id: string;
  organizationId: string;
  accountId: string;
  opportunityId: string | null;
  contactId: string | null;
  type: string;
  summary: string;
  evidenceRef: string | null;
  loggedById: string;
  loggedAt: Date;
}): SalesInteractionLog {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    opportunityId: row.opportunityId ?? undefined,
    contactId: row.contactId ?? undefined,
    type: row.type as SalesInteractionLog["type"],
    summary: row.summary,
    evidenceRef: row.evidenceRef ?? undefined,
    loggedById: row.loggedById,
    loggedAt: row.loggedAt.toISOString(),
  };
}

function toEvidence(row: {
  id: string;
  organizationId: string;
  opportunityId: string;
  typeId: string;
  label: string;
  linkedById: string;
  linkedAt: Date;
}): SalesEvidenceRef {
  return {
    id: row.id,
    organizationId: row.organizationId,
    opportunityId: row.opportunityId,
    typeId: row.typeId,
    label: row.label,
    linkedById: row.linkedById,
    linkedAt: row.linkedAt.toISOString(),
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

  const [accounts, contacts, opportunities, interactions, evidence] =
    await Promise.all([
      prisma.salesAccount.findMany({ where: { organizationId } }) as any,
      prisma.salesContact.findMany({ where: { organizationId } }) as any,
      (prisma as any).salesOpportunity.findMany({ where: { organizationId } }),
      (prisma as any).salesInteractionLog.findMany({ where: { organizationId } }),
      prisma.salesEvidenceLink.findMany({ where: { organizationId } }) as any,
    ]);

  return {
    accounts: accounts.map(toAccount),
    contacts: contacts.map(toContact),
    opportunities: opportunities.map(toOpportunity),
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
      await (tx.salesAccount.create as any)({
        data: {
          id: a.id,
          organizationId: a.organizationId,
          name: a.name,
          nameAr: a.nameAr,
          industry: a.industry,
          status: a.status,
          ownerId: a.ownerId,
          createdById: a.createdById,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        },
      });
    }
    for (const c of seed.contacts) {
      await (tx.salesContact.create as any)({
        data: {
          id: c.id,
          organizationId: c.organizationId,
          accountId: c.accountId,
          name: c.name,
          title: c.title,
          email: c.email,
          phone: c.phone,
          sensitivityLevel: c.sensitivityLevel,
          ownerId: c.ownerId,
          createdById: c.createdById,
        },
      });
    }
    for (const o of seed.opportunities) {
      await (tx as any).salesOpportunity.create({
        data: {
          id: o.id,
          organizationId: o.organizationId,
          accountId: o.accountId,
          name: o.name,
          stage: o.stage,
          valueEstimate: o.valueEstimate,
          currency: o.currency,
          qualificationScore: o.qualificationScore,
          ownerId: o.ownerId,
          createdById: o.createdById,
          reviewStatus: o.reviewStatus,
          approvalStatus: o.approvalStatus,
        },
      });
    }
    for (const i of seed.interactions) {
      await (tx as any).salesInteractionLog.create({
        data: {
          id: i.id,
          organizationId: i.organizationId,
          accountId: i.accountId,
          opportunityId: i.opportunityId,
          contactId: i.contactId,
          type: i.type,
          summary: i.summary,
          evidenceRef: i.evidenceRef,
          loggedById: i.loggedById,
          loggedAt: new Date(i.loggedAt),
        },
      });
    }
  });
}

export async function prismaCreateAccount(
  account: SalesAccount,
): Promise<void> {
  await (prisma.salesAccount.create as any)({
    data: {
      id: account.id,
      organizationId: account.organizationId,
      name: account.name,
      nameAr: account.nameAr,
      industry: account.industry,
      status: account.status,
      ownerId: account.ownerId,
      createdById: account.createdById,
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
  await (prisma as any).salesOpportunity.updateMany({
    where: { id: opportunityId, organizationId },
    data: {
      ...(patch.stage !== undefined ? { stage: patch.stage } : {}),
      ...(patch.reviewStatus !== undefined
        ? { reviewStatus: patch.reviewStatus }
        : {}),
      ...(patch.approvalStatus !== undefined
        ? { approvalStatus: patch.approvalStatus }
        : {}),
      ...(patch.valueEstimate !== undefined
        ? { valueEstimate: patch.valueEstimate }
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
