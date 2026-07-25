"use client";

import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountBriefPack } from "@/lib/sales/account-brief-pack";
import { ACCOUNT_STATUS_LABELS, formatArDate } from "./account-brief-constants";

export function AccountBriefInfoCard({
  pack,
}: {
  pack: AccountBriefPack;
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {pack.accountName}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <span className="text-muted-foreground">القطاع: </span>
          <span className="font-medium">{pack.industry ?? "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">الحالة: </span>
          <span className="font-medium">
            {ACCOUNT_STATUS_LABELS[pack.status] ?? pack.status}
          </span>
          {pack.isDemo ? (
            <span className="mr-2 text-xs text-muted-foreground">(demo)</span>
          ) : null}
        </div>
        <div>
          <span className="text-muted-foreground">تاريخ الإنشاء: </span>
          <span>{formatArDate(pack.createdAt)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">آخر تحديث: </span>
          <span>{formatArDate(pack.updatedAt)}</span>
        </div>
        <div className="sm:col-span-2 text-xs text-muted-foreground">
          توليد الموجز: {formatArDate(pack.generatedAt)}
        </div>
      </CardContent>
    </Card>
  );
}
