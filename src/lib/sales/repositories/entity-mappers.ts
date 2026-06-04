import "server-only";
import type { Prisma } from "@prisma/client";
import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesInteractionLog,
} from "../types";
import type { SalesAuditEntry, SalesEvidenceRef } from "../store";

/** Accept the full Prisma row shape (extra fields beyond domain type are tolerated). */
export function prismaAccountToDomain(row: {
  id: string;
  organizationId: string;
  name: string;
  nameAr?: string | null;
  industry: string | null;
  status: string;
  isDemo: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}): SalesAccount {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    nameAr: row.nameAr ?? undefined,
    industry: row.industry ?? undefined,
    status: row.status as SalesAccount["status"],
    ownerId: row.createdById ?? "",
    createdById: row.createdById ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    source: "manual",
  };
}

export function domainAccountToPrisma(
  account: SalesAccount,
): Prisma.SalesAccountCreateInput {
  return {
    id: account.id,
    organizationId: account.organizationId,
    name: account.name,
    industry: account.industry ?? null,
    status: account.status,
    isDemo: false,
    createdById: account.createdById,
    updatedById: account.createdById,
  };
}

export function prismaContactToDomain(row: {
  id: string;
  organizationId: string;
  accountId: string;
  name: string;
  email: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}): SalesContact {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    name: row.name,
    email: row.email ?? undefined,
    title: row.role ?? undefined,
    sensitivityLevel: "standard",
    ownerId: "",
    createdById: "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: "active",
    source: "manual",
  };
}

export function domainContactToPrisma(
  contact: SalesContact,
): Prisma.SalesContactCreateInput {
  return {
    id: contact.id,
    organizationId: contact.organizationId,
    account: { connect: { id: contact.accountId } },
    name: contact.name,
    email: contact.email ?? null,
    role: contact.title ?? null,
  };
}

export function prismaDealToOpportunity(row: {
  id: string;
  organizationId: string;
  accountId: string;
  title: string;
  status: string;
  stageId: string | null;
  amount: number | null;
  currency: string | null;
  probability: number | null;
  expectedCloseDate: Date | null;
  isDemo: boolean;
  metadata: Prisma.JsonValue | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}): SalesOpportunity {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    name: row.title,
    stage: ((row.metadata as { stage?: string })?.stage ??
      "New") as SalesOpportunity["stage"],
    valueEstimate: row.amount ?? undefined,
    currency: row.currency ?? "SAR",
    probability: row.probability ?? undefined,
    expectedCloseDate: row.expectedCloseDate?.toISOString() ?? undefined,
    ownerId: row.createdById ?? "",
    createdById: row.createdById ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    source: "manual",
    reviewStatus: (row.metadata as { reviewStatus?: string })?.reviewStatus,
    approvalStatus: (row.metadata as { approvalStatus?: string })
      ?.approvalStatus,
  };
}

export function domainOpportunityToDealCreate(
  opportunity: SalesOpportunity,
): Prisma.SalesDealCreateInput {
  return {
    id: opportunity.id,
    organizationId: opportunity.organizationId,
    account: { connect: { id: opportunity.accountId } },
    title: opportunity.name,
    amount: opportunity.valueEstimate ?? null,
    currency: opportunity.currency ?? "SAR",
    probability: opportunity.probability ?? null,
    expectedCloseDate: opportunity.expectedCloseDate
      ? new Date(opportunity.expectedCloseDate)
      : null,
    createdById: opportunity.createdById,
    updatedById: opportunity.createdById,
    metadata: {
      stage: opportunity.stage,
      reviewStatus: opportunity.reviewStatus,
      approvalStatus: opportunity.approvalStatus,
    } as Prisma.InputJsonValue,
  };
}

export function prismaInteractionToDomain(row: {
  id: string;
  organizationId: string;
  accountId: string;
  dealId: string | null;
  type: string;
  subject: string | null;
  summary: string | null;
  occurredAt: Date;
  metadata: Prisma.JsonValue | null;
  createdById: string | null;
  createdAt: Date;
  [key: string]: unknown;
}): SalesInteractionLog {
  return {
    id: row.id,
    organizationId: row.organizationId,
    accountId: row.accountId,
    opportunityId: row.dealId ?? undefined,
    type: row.type as SalesInteractionLog["type"],
    summary: row.summary ?? row.subject ?? "",
    evidenceRef:
      (row.metadata as { evidenceRef?: string })?.evidenceRef ?? undefined,
    loggedById: row.createdById ?? "",
    loggedAt: row.occurredAt.toISOString(),
    metadata: row.metadata as SalesInteractionLog["metadata"],
  };
}

export function domainInteractionToPrisma(
  interaction: SalesInteractionLog,
  accountId?: string,
): Prisma.SalesInteractionCreateInput {
  return {
    id: interaction.id,
    organizationId: interaction.organizationId,
    account: { connect: { id: accountId ?? interaction.accountId } },
    deal: interaction.opportunityId
      ? { connect: { id: interaction.opportunityId } }
      : undefined,
    type: interaction.type,
    subject: interaction.summary.slice(0, 200),
    summary: interaction.summary,
    occurredAt: new Date(interaction.loggedAt),
    metadata: interaction.metadata as Prisma.InputJsonValue | undefined,
    createdById: interaction.loggedById,
  };
}

export function prismaEvidenceToDomain(row: {
  id: string;
  organizationId: string;
  targetType: string;
  targetId: string;
  dealId: string | null;
  accountId: string | null;
  evidenceId: string;
  label: string | null;
  createdAt: Date;
  [key: string]: unknown;
}): SalesEvidenceRef {
  return {
    id: row.id,
    organizationId: row.organizationId,
    opportunityId: row.dealId ?? row.targetId,
    typeId: row.evidenceId,
    label: row.label ?? row.targetType,
    linkedAt: row.createdAt.toISOString(),
    linkedById: "",
  };
}

export function domainEvidenceToPrisma(
  ref: SalesEvidenceRef,
  accountId?: string,
): Prisma.SalesEvidenceLinkCreateInput {
  return {
    id: ref.id,
    organizationId: ref.organizationId,
    targetType: "opportunity",
    targetId: ref.opportunityId,
    deal: ref.opportunityId
      ? { connect: { id: ref.opportunityId } }
      : undefined,
    account: accountId ? { connect: { id: accountId } } : undefined,
    evidenceId: ref.typeId,
    label: ref.label,
    evidenceType: ref.label,
    createdById: ref.linkedById,
  };
}

export function prismaAuditToDomain(row: {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  [key: string]: unknown;
}): SalesAuditEntry {
  return {
    id: row.id,
    organizationId: row.organizationId,
    action: row.action,
    actorId: row.actorId,
    targetType: row.targetType,
    targetId: row.targetId,
    timestamp: row.createdAt.toISOString(),
    metadata: row.metadata as Record<string, unknown> | undefined,
  };
}

export function domainAuditToPrisma(
  entry: SalesAuditEntry,
  actorName?: string,
): Prisma.SalesAuditEventCreateInput {
  return {
    id: entry.id,
    organizationId: entry.organizationId,
    actorId: entry.actorId,
    actorName: actorName ?? null,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    metadata: entry.metadata as Prisma.InputJsonValue | undefined,
  };
}
