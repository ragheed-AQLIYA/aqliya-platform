"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { RevenueActionItem } from "@/lib/sales/vnext/revenue-intelligence";

function priorityVariant(priority: string) {
  if (priority === "high") return "blocked" as const;
  if (priority === "medium") return "under_review" as const;
  return "draft" as const;
}

export function RevenueActionsCard({ items }: { items: RevenueActionItem[] }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>فرص تحتاج إجراء</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا إجراءات عاجلة</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.opportunityId} className="rounded border px-2 py-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/sales/opportunities/${item.opportunityId}`}
                    className="font-medium hover:underline"
                  >
                    {item.opportunityName}
                  </Link>
                  <StatusBadge status={priorityVariant(item.priority)} />
                </div>
                <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                  {item.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
