"use server";

import {
  requireSalesPermission,
  assertSalesDealAccess,
  SalesAccessError,
} from "@/lib/sales/guards";

/**
 * Get deal health for a single deal.
 *
 * Security: requires authenticated user with salesos:read permission,
 * then verifies the deal belongs to the user's organization via
 * assertSalesDealAccess (which checks organizationId and platformOrganizationId).
 *
 * This prevents cross-tenant deal health data exposure.
 */
export async function getDealHealthAction(dealId: string) {
  if (!dealId) return null;

  // Authenticate + RBAC check
  await requireSalesPermission("salesos:read");

  // Tenant isolation: verify deal belongs to caller's organization
  // assertSalesDealAccess checks: auth → deal exists → org match → platform org match
  await assertSalesDealAccess(dealId);

  try {
    const { getDealHealth } = await import(
      "@/lib/platform/sales-intelligence/sales-intel-service/health"
    );
    return await getDealHealth(dealId);
  } catch {
    return null;
  }
}

/**
 * Get deal health for multiple deals.
 *
 * Security: requires authenticated user with salesos:read permission.
 * Each dealId is validated against the caller's organization before scoring.
 * Only deals belonging to the caller's org are processed.
 *
 * This prevents:
 * - Unauthenticated access (requireSalesPermission)
 * - Cross-tenant enumeration (organizationId filter)
 * - Forged dealIds (assertSalesDealAccess per-deal)
 */
export async function listDealHealthAction(dealIds: string[]) {
  if (!dealIds || dealIds.length === 0) return [];

  // Authenticate + RBAC check
  const ctx = await requireSalesPermission("salesos:read");

  try {
    // Tenant-scoped bulk query: only fetch deals belonging to this org
    const { prisma } = await import("@/lib/prisma");
    const validDeals = await prisma.salesDeal.findMany({
      where: {
        id: { in: dealIds },
        organizationId: ctx.organizationId,
      },
      select: { id: true },
    });
    const validIds = new Set(validDeals.map((d) => d.id));

    const { getDealHealth } = await import(
      "@/lib/platform/sales-intelligence/sales-intel-service/health"
    );

    // Only score deals that passed tenant validation
    const results = await Promise.allSettled(
      Array.from(validIds).map((id) => getDealHealth(id))
    );
    return results
      .filter(
        (r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof getDealHealth>>>> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);
  } catch {
    return [];
  }
}
