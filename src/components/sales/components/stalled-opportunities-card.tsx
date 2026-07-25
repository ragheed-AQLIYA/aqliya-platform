"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { SalesOpportunity, SalesAccount } from "@/lib/sales/types";

export interface StalledOpportunitiesCardProps {
  stalledList: SalesOpportunity[];
  stalledOpps: number;
  accountById: Map<string, SalesAccount>;
}

export function StalledOpportunitiesCard({
  stalledList,
  stalledOpps,
  accountById,
}: StalledOpportunitiesCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="mb-3 text-sm font-semibold">فرص متوقفة</p>
        {stalledList.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا فرص متوقفة حالياً</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {stalledList.map((o) => {
              const account = accountById.get(o.accountId);
              return (
                <li key={o.id} className="rounded border px-2 py-1.5">
                  <Link
                    href={`/sales/opportunities/${o.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {o.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {account?.nameAr ?? account?.name ?? "—"} · {o.stage}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {stalledOpps > stalledList.length && (
          <Link
            href="/sales/opportunities"
            className="mt-2 inline-block text-xs text-primary hover:underline"
          >
            عرض المسار الكامل
          </Link>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
