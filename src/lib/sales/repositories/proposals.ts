import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SalesActor, SalesOrgScope } from "../services";
import type { SalesProposalStatus } from "../l5-types";
import { assertDealInOrg, orgWhere, withPlatformOrg } from "./org-scope";

export async function createSalesProposal(
  scope: SalesOrgScope,
  input: {
    dealId: string;
    title?: string | null;
    draft?: string;
    pilotCriteria?: string;
    metadata?: Record<string, unknown>;
  },
  actor: SalesActor,
) {
  await assertDealInOrg(input.dealId, scope);

  return prisma.salesProposal.create({
    data: {
      organizationId: scope.organizationId,
      platformOrganizationId: scope.platformOrganizationId ?? null,
      dealId: input.dealId,
      title: input.title ?? null,
      draft: input.draft ?? "",
      pilotCriteria: input.pilotCriteria ?? "",
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      createdById: actor.id,
      updatedById: actor.id,
      status: "draft",
    },
  });
}

export async function getSalesProposal(
  proposalId: string,
  scope: SalesOrgScope,
) {
  return prisma.salesProposal.findFirst({
    where: { id: proposalId, ...orgWhere(scope) },
    include: { deal: { select: { id: true, title: true } } },
  });
}

export async function listSalesProposalsForDeal(
  scope: SalesOrgScope,
  dealId: string,
) {
  return prisma.salesProposal.findMany({
    where: { dealId, ...orgWhere(scope) },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateSalesProposalStatus(
  proposalId: string,
  scope: SalesOrgScope,
  status: SalesProposalStatus,
  actor: SalesActor,
  extra?: { submittedAt?: Date; decidedAt?: Date },
) {
  const existing = await getSalesProposal(proposalId, scope);
  if (!existing) {
    throw new Error("SalesOS: proposal not found");
  }

  return prisma.salesProposal.update({
    where: { id: proposalId },
    data: {
      status,
      updatedById: actor.id,
      ...(extra?.submittedAt ? { submittedAt: extra.submittedAt } : {}),
      ...(extra?.decidedAt ? { decidedAt: extra.decidedAt } : {}),
    },
  });
}
