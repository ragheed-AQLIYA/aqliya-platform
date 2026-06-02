import "server-only";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import {
  assertSalesPermission as assertSalesPermissionForRole,
  type SalesPermission,
} from "./permissions";

export interface SalesOrgAccessContext {
  user: CurrentUser;
  organizationId: string;
  platformOrganizationId: string | null;
}

export class SalesAccessError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "SalesAccessError";
    this.code = code;
  }
}

export async function requireSalesOrgAccess(): Promise<SalesOrgAccessContext> {
  const user = await getCurrentUser();
  return {
    user,
    organizationId: user.organizationId,
    platformOrganizationId: user.platformOrganizationId ?? null,
  };
}

export function assertSalesPermission(
  role: UserRole,
  permission: SalesPermission,
): void {
  try {
    assertSalesPermissionForRole(role, permission);
  } catch {
    throw new SalesAccessError(
      `Access denied: missing permission ${permission}`,
      "FORBIDDEN",
    );
  }
}

export async function requireSalesPermission(
  permission: SalesPermission,
): Promise<SalesOrgAccessContext> {
  const ctx = await requireSalesOrgAccess();
  assertSalesPermission(ctx.user.role, permission);
  return ctx;
}

export async function assertSalesAccountAccess(
  accountId: string,
): Promise<SalesOrgAccessContext & { accountId: string }> {
  const ctx = await requireSalesOrgAccess();

  const account = await prisma.salesAccount.findUnique({
    where: { id: accountId },
    select: { id: true, organizationId: true, platformOrganizationId: true },
  });

  if (!account) {
    throw new SalesAccessError("Account not found", "NOT_FOUND");
  }

  if (account.organizationId !== ctx.organizationId) {
    throw new SalesAccessError(
      "Access denied: account belongs to another organization",
      "FORBIDDEN",
    );
  }

  if (
    ctx.platformOrganizationId &&
    account.platformOrganizationId &&
    account.platformOrganizationId !== ctx.platformOrganizationId
  ) {
    throw new SalesAccessError(
      "Access denied: account belongs to another platform organization",
      "FORBIDDEN",
    );
  }

  return { ...ctx, accountId: account.id };
}

export async function assertSalesDealAccess(
  dealId: string,
): Promise<
  SalesOrgAccessContext & {
    dealId: string;
    accountId: string;
    stageId: string | null;
  }
> {
  const ctx = await requireSalesOrgAccess();

  const deal = await prisma.salesDeal.findUnique({
    where: { id: dealId },
    select: {
      id: true,
      organizationId: true,
      platformOrganizationId: true,
      accountId: true,
      stageId: true,
    },
  });

  if (!deal) {
    throw new SalesAccessError("Deal not found", "NOT_FOUND");
  }

  if (deal.organizationId !== ctx.organizationId) {
    throw new SalesAccessError(
      "Access denied: deal belongs to another organization",
      "FORBIDDEN",
    );
  }

  if (
    ctx.platformOrganizationId &&
    deal.platformOrganizationId &&
    deal.platformOrganizationId !== ctx.platformOrganizationId
  ) {
    throw new SalesAccessError(
      "Access denied: deal belongs to another platform organization",
      "FORBIDDEN",
    );
  }

  return {
    ...ctx,
    dealId: deal.id,
    accountId: deal.accountId,
    stageId: deal.stageId,
  };
}
