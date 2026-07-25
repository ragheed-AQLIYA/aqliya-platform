"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesAccount } from "@/lib/sales/types";

export function AccountProfileHeader({ account }: { account: SalesAccount }) {
  return (
    <div>
      <Link
        href="/sales/accounts"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← الحسابات
      </Link>
      <h1 className="mt-2 text-h2 font-black">
        {account.nameAr ?? account.name}
      </h1>
      <StatusBadge status={account.status} size="sm" />
    </div>
  );
}
