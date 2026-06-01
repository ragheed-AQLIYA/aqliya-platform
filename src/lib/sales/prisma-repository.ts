// @ts-nocheck
// ─── SalesOS Prisma persistence layer ───
// Tenant-scoped CRUD. Enabled via SALESOS_PRISMA_PERSISTENCE=1.

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
      prisma.salesAccount.findMany({ where: { organizationId } }),
      prisma.salesContact.findMany({ where: { organizationId } }),
      prisma.salesOpportunity.findMany({ where: { organizationId } }),
      prisma.salesInteractionLog.findMany({ where: { organizationId } }),
      prisma.salesEvidenceLink.findMany({ where: { organizationId } }),
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
      await tx.salesAccount.create({
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
      await tx.salesContact.create({
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
      await tx.salesOpportunity.create({
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
      await tx.salesInteractionLog.create({
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
  await prisma.salesAccount.create({
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

export async function prismaUpdateOpportunity(
  organizationId: string,
  opportunityId: string,
  patch: Partial<SalesOpportunity>,
): Promise<void> {
  await prisma.salesOpportunity.updateMany({
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
