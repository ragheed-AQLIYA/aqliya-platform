"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesAccount } from "@/lib/sales/types";

export interface QuickAccountsCardProps {
  accounts: SalesAccount[];
}

export function QuickAccountsCard({ accounts }: QuickAccountsCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">حسابات سريعة</p>
          <Link
            href="/sales/accounts"
            className="text-xs text-primary hover:underline"
          >
            كل الحسابات
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.slice(0, 6).map((a) => (
            <Link
              key={a.id}
              href={`/sales/accounts/${a.id}`}
              className="rounded-lg border p-3 hover:border-primary/50 transition-colors"
            >
              <p className="font-medium text-sm">{a.nameAr ?? a.name}</p>
              <StatusBadge status={a.status} size="sm" />
            </Link>
          ))}
        </div>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
