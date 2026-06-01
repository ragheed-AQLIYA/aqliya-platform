import { prisma } from "@/lib/prisma";
import type { SalesOrgScope } from "../services";

export function orgWhere(scope: SalesOrgScope) {
  return { organizationId: scope.organizationId };
}

export async function assertDealInOrg(dealId: string, scope: SalesOrgScope) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId: scope.organizationId },
    select: {
      id: true,
      title: true,
      accountId: true,
      metadata: true,
      stage: { select: { slug: true, name: true } },
    },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found");
  }
  return deal;
}

export async function assertAccountInOrg(accountId: string, scope: SalesOrgScope) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId: scope.organizationId },
    select: { id: true, name: true },
  });
  if (!account) {
    throw new Error("SalesOS: account not found");
  }
  return account;
}

export function withPlatformOrg<T extends { platformOrganizationId?: string | null }>(
  scope: SalesOrgScope,
  data: T,
): T & { platformOrganizationId: string | null } {
  return {
    ...data,
    platformOrganizationId: scope.platformOrganizationId ?? null,
  };
}
