"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountBriefDealSummary } from "@/lib/sales/account-brief-pack";
import { DEAL_STATUS_LABELS, formatAmount, formatArDate } from "./account-brief-constants";

export function AccountBriefDealsCard({
  deals,
}: {
  deals: AccountBriefDealSummary[];
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          الصفقات المرتبطة ({deals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا صفقات مرتبطة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-muted-foreground">
                  <th className="py-2 pe-3 font-medium">العنوان</th>
                  <th className="py-2 pe-3 font-medium">الحالة</th>
                  <th className="py-2 pe-3 font-medium">المرحلة</th>
                  <th className="py-2 pe-3 font-medium">القيمة</th>
                  <th className="py-2 font-medium">آخر تحديث</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b last:border-0">
                    <td className="py-2 pe-3">
                      <Link
                        href={`/sales/deals/${deal.id}`}
                        className="font-medium text-primary hover:underline print:text-foreground print:no-underline"
                      >
                        {deal.title}
                      </Link>
                    </td>
                    <td className="py-2 pe-3">
                      {DEAL_STATUS_LABELS[deal.status] ?? deal.status}
                    </td>
                    <td className="py-2 pe-3">{deal.stageName ?? "—"}</td>
                    <td className="py-2 pe-3 tabular-nums">
                      {formatAmount(deal.amount, deal.currency)}
                    </td>
                    <td className="py-2">{formatArDate(deal.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
