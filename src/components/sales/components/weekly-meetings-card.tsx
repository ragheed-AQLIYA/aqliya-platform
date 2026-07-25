"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { SalesInteractionLog, SalesAccount } from "@/lib/sales/types";
import { INTERACTION_TYPE_LABELS } from "./use-command-center";

export interface WeeklyMeetingsCardProps {
  weeklyMeetings: SalesInteractionLog[];
  accountById: Map<string, SalesAccount>;
}

export function WeeklyMeetingsCard({
  weeklyMeetings,
  accountById,
}: WeeklyMeetingsCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="mb-3 text-sm font-semibold">اجتماعات هذا الأسبوع</p>
        {weeklyMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا اجتماعات هذا الأسبوع</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {weeklyMeetings.map((m) => {
              const account = accountById.get(m.accountId);
              return (
                <li key={m.id} className="rounded border px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    {m.loggedAt.slice(0, 10)} ·{" "}
                    {INTERACTION_TYPE_LABELS[m.type] ?? m.type}
                  </span>
                  <p className="truncate">{m.summary.slice(0, 80)}</p>
                  {account && (
                    <Link
                      href={`/sales/accounts/${account.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {account.nameAr ?? account.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/sales/activities"
          className="mt-2 inline-block text-xs text-primary hover:underline"
        >
          كل الأنشطة
        </Link>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
