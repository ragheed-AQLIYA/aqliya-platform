"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountBriefExportButton } from "../account-brief-export-button";

export function AccountBriefHeader({
  accountId,
}: {
  accountId: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
      <div>
        <Link
          href={`/sales/accounts/${accountId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى الحساب
        </Link>
        <h1 className="text-xl font-bold">موجز الحساب</h1>
        <p className="text-sm text-muted-foreground">
          قراءة فقط — تجميع الحقول وICP والإشارات وبحث الحساب والصفقات والأدلة
        </p>
      </div>
      <AccountBriefExportButton accountId={accountId} />
    </div>
  );
}
