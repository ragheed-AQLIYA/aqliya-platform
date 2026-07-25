"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { SalesInteractionLog, SalesAccount } from "@/lib/sales/types";
import { INTERACTION_TYPE_LABELS } from "./use-command-center";

export interface RecentActivityCardProps {
  recentActivity: SalesInteractionLog[];
  accountById: Map<string, SalesAccount>;
}

export function RecentActivityCard({
  recentActivity,
  accountById,
}: RecentActivityCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">نشاط تجاري حديث</p>
          <Link
            href="/sales/activities"
            className="text-xs text-primary hover:underline"
          >
            سجل الأنشطة
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا نشاط</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentActivity.map((a) => {
              const account = accountById.get(a.accountId);
              return (
                <li key={a.id} className="rounded border px-2 py-1">
                  <span className="text-xs text-muted-foreground">
                    {a.loggedAt.slice(0, 10)} ·{" "}
                    {INTERACTION_TYPE_LABELS[a.type] ?? a.type}
                    {account ? ` · ${account.nameAr ?? account.name}` : ""}
                  </span>
                  <p>{a.summary.slice(0, 100)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
