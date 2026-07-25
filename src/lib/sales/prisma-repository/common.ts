// ─── Shared imports and helpers for SalesOS Prisma persistence modules ───

import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  SalesAccount,
  SalesContact,
  SalesInteractionLog,
  SalesOpportunity,
} from "../types";
import type { SalesEvidenceRef } from "../store";

// Tier B/A models (salesMarketSignal, salesKnowledgeGraphNode, etc.) are optional
// schema extensions not present in the Prisma schema baseline. Accessing them
// requires `as any` escape — isolated to this single function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPrismaAny(): any {
  return prisma;
}

export function toAccount(row: {
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

export function toContact(row: {
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

export function toOpportunity(row: {
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

export function toInteraction(row: {
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

export function toEvidence(row: {
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

export { prisma };
