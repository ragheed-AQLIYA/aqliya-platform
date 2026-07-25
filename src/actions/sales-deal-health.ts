"use server";

import { getCurrentUser } from "@/lib/auth";

export async function getDealHealthAction(dealId: string) {
  try {
    const { getDealHealth } = await import(
      "@/lib/platform/sales-intelligence/sales-intel-service/health"
    );
    return await getDealHealth(dealId);
  } catch {
    return null;
  }
}

export async function listDealHealthAction(dealIds: string[]) {
  try {
    const { getDealHealth } = await import(
      "@/lib/platform/sales-intelligence/sales-intel-service/health"
    );
    const results = await Promise.allSettled(
      dealIds.map((id) => getDealHealth(id))
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
