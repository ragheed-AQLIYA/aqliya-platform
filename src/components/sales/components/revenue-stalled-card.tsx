"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { formatSalesStageLabel } from "@/lib/sales/sales-ux-copy";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";

type StalledOpportunities = RevenueIntelligenceSnapshot["stalledOpportunities"];

export function RevenueStalledCard({ stalled }: { stalled: StalledOpportunities }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>فرص متوقفة</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {stalled.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا فرص متوقفة حالياً</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {stalled.items.map((item) => (
              <li key={item.id} className="rounded border px-2 py-2">
                <Link
                  href={`/sales/opportunities/${item.id}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatSalesStageLabel(item.stage)} ·{" "}
                  {item.valueEstimate.toLocaleString("ar-SA")} ر.س
                  {item.daysSinceActivity != null
                    ? ` · ${item.daysSinceActivity} يوم بدون نشاط`
                    : " · لا تفاعلات مسجّلة"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
