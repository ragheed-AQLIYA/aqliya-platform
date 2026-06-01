import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import {
  assertEvidenceAccessibleInSalesOrg,
  type ResolvedSalesEvidenceRef,
  type SalesEvidenceSource,
} from "./evidence-resolver";
import type { SalesActor, SalesOrgScope } from "./services";

export const SALES_EVIDENCE_TARGETS = {
  DEAL: "SalesDeal",
  ACCOUNT: "SalesAccount",
} as const;

export interface SalesEvidenceLinkView {
  id: string;
  evidenceId: string;
  evidenceSource: string;
  label: string | null;
  evidenceType: string | null;
  title: string;
  type: string;
  resolved: boolean;
  createdAt: Date;
  createdById: string | null;
}

const linkSelect = {
  id: true,
  evidenceId: true,
  evidenceSource: true,
  label: true,
  evidenceType: true,
  createdAt: true,
  createdById: true,
} as const;

function toLinkView(
  link: {
    id: string;
    evidenceId: string;
    evidenceSource: string;
    label: string | null;
    evidenceType: string | null;
    createdAt: Date;
    createdById: string | null;
  },
  resolved?: ResolvedSalesEvidenceRef | null,
): SalesEvidenceLinkView {
  return {
    ...link,
    title: resolved?.title ?? link.label ?? link.evidenceId,
    type: resolved?.type ?? link.evidenceType ?? "reference",
    resolved: Boolean(resolved),
  };
}

async function enrichLinks(
  links: Array<{
    id: string;
    evidenceId: string;
    evidenceSource: string;
    label: string | null;
    evidenceType: string | null;
    createdAt: Date;
    createdById: string | null;
  }>,
  scope: SalesOrgScope,
): Promise<SalesEvidenceLinkView[]> {
  const enriched: SalesEvidenceLinkView[] = [];
  for (const link of links) {
    const resolved = await assertEvidenceAccessibleInSalesOrg({
      evidenceId: link.evidenceId,
      organizationId: scope.organizationId,
      platformOrganizationId: scope.platformOrganizationId,
      preferredSource: link.evidenceSource as SalesEvidenceSource,
    }).catch(() => null);
    enriched.push(toLinkView(link, resolved));
  }
  return enriched;
}

export async function listEvidenceLinksForDeal(
  scope: SalesOrgScope,
  dealId: string,
): Promise<SalesEvidenceLinkView[]> {
  const links = await prisma.salesEvidenceLink.findMany({
    where: {
      organizationId: scope.organizationId,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: dealId,
    },
    select: linkSelect,
    orderBy: { createdAt: "desc" },
  });
  return enrichLinks(links, scope);
}

export async function listEvidenceLinksForAccount(
  scope: SalesOrgScope,
  accountId: string,
): Promise<SalesEvidenceLinkView[]> {
  const links = await prisma.salesEvidenceLink.findMany({
    where: {
      organizationId: scope.organizationId,
      targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
      targetId: accountId,
    },
    select: linkSelect,
    orderBy: { createdAt: "desc" },
  });
  return enrichLinks(links, scope);
}

async function assertDealInOrg(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: { id: true, title: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function assertAccountInOrg(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: { id: true, name: true },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

export async function linkEvidenceToDeal(
  scope: SalesOrgScope,
  params: { dealId: string; evidenceId: string; evidenceSource?: SalesEvidenceSource },
  actor: SalesActor,
): Promise<SalesEvidenceLinkView> {
  const deal = await assertDealInOrg(params.dealId, scope.organizationId);
  const evidenceId = params.evidenceId.trim();
  if (!evidenceId) {
    throw new Error("SalesOS validation: evidenceId is required");
  }

  const resolved = await assertEvidenceAccessibleInSalesOrg({
    evidenceId,
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    preferredSource: params.evidenceSource,
  });

  const link = await prisma.salesEvidenceLink.create({
    data: {
      organizationId: scope.organizationId,
      platformOrganizationId: scope.platformOrganizationId ?? null,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: params.dealId,
      dealId: params.dealId,
      evidenceId,
      evidenceSource: resolved.source,
      label: resolved.title,
      evidenceType: resolved.type,
      createdById: actor.id,
    },
    select: linkSelect,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.EVIDENCE_LINKED,
    targetType: SALES_EVIDENCE_TARGETS.DEAL,
    targetId: params.dealId,
    metadata: {
      linkId: link.id,
      evidenceId,
      evidenceSource: resolved.source,
      dealTitle: deal.title,
    },
  });

  return toLinkView(link, resolved);
}

export async function unlinkEvidenceFromDeal(
  scope: SalesOrgScope,
  params: { dealId: string; linkId: string },
  actor: SalesActor,
): Promise<void> {
  await assertDealInOrg(params.dealId, scope.organizationId);

  const existing = await prisma.salesEvidenceLink.findFirst({
    where: {
      id: params.linkId,
      organizationId: scope.organizationId,
      targetType: SALES_EVIDENCE_TARGETS.DEAL,
      targetId: params.dealId,
    },
    select: { id: true, evidenceId: true, evidenceSource: true },
  });

  if (!existing) {
    throw new Error("SalesOS: evidence link not found");
  }

  await prisma.salesEvidenceLink.delete({ where: { id: existing.id } });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.EVIDENCE_UNLINKED,
    targetType: SALES_EVIDENCE_TARGETS.DEAL,
    targetId: params.dealId,
    metadata: {
      linkId: existing.id,
      evidenceId: existing.evidenceId,
      evidenceSource: existing.evidenceSource,
    },
  });
}

export async function linkEvidenceToAccount(
  scope: SalesOrgScope,
  params: {
    accountId: string;
    evidenceId: string;
    evidenceSource?: SalesEvidenceSource;
  },
  actor: SalesActor,
): Promise<SalesEvidenceLinkView> {
  const account = await assertAccountInOrg(params.accountId, scope.organizationId);
  const evidenceId = params.evidenceId.trim();
  if (!evidenceId) {
    throw new Error("SalesOS validation: evidenceId is required");
  }

  const resolved = await assertEvidenceAccessibleInSalesOrg({
    evidenceId,
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    preferredSource: params.evidenceSource,
  });

  const link = await prisma.salesEvidenceLink.create({
    data: {
      organizationId: scope.organizationId,
      platformOrganizationId: scope.platformOrganizationId ?? null,
      targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
      targetId: params.accountId,
      accountId: params.accountId,
      evidenceId,
      evidenceSource: resolved.source,
      label: resolved.title,
      evidenceType: resolved.type,
      createdById: actor.id,
    },
    select: linkSelect,
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.EVIDENCE_LINKED,
    targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
    targetId: params.accountId,
    metadata: {
      linkId: link.id,
      evidenceId,
      evidenceSource: resolved.source,
      accountName: account.name,
    },
  });

  return toLinkView(link, resolved);
}

export async function unlinkEvidenceFromAccount(
  scope: SalesOrgScope,
  params: { accountId: string; linkId: string },
  actor: SalesActor,
): Promise<void> {
  await assertAccountInOrg(params.accountId, scope.organizationId);

  const existing = await prisma.salesEvidenceLink.findFirst({
    where: {
      id: params.linkId,
      organizationId: scope.organizationId,
      targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
      targetId: params.accountId,
    },
    select: { id: true, evidenceId: true, evidenceSource: true },
  });

  if (!existing) {
    throw new Error("SalesOS: evidence link not found");
  }

  await prisma.salesEvidenceLink.delete({ where: { id: existing.id } });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.EVIDENCE_UNLINKED,
    targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
    targetId: params.accountId,
    metadata: {
      linkId: existing.id,
      evidenceId: existing.evidenceId,
      evidenceSource: existing.evidenceSource,
    },
  });
}

export async function countEvidenceLinksForAccount(
  scope: SalesOrgScope,
  accountId: string,
): Promise<number> {
  return prisma.salesEvidenceLink.count({
    where: {
      organizationId: scope.organizationId,
      targetType: SALES_EVIDENCE_TARGETS.ACCOUNT,
      targetId: accountId,
    },
  });
}
