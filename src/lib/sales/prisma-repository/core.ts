// ─── Core CRUD: accounts, contacts, opportunities, interactions, evidence, audit ───

import { prisma } from "./common";
import { toAccount, toContact, toOpportunity, toInteraction, toEvidence } from "./common";
import type {
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
} from "../types";
import type { SalesAuditEntry, SalesEvidenceRef } from "../store";
import { buildSalesSeedData } from "../seed-data";

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
      prisma.salesAccount.findMany({ where: { organizationId }, take: 10000 }),
      prisma.salesContact.findMany({ where: { organizationId }, take: 10000 }),
      prisma.salesDeal.findMany({ where: { organizationId }, take: 10000 }),
      prisma.salesInteraction.findMany({ where: { organizationId }, take: 10000 }),
      prisma.salesEvidenceLink.findMany({ where: { organizationId }, take: 10000 }),
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
