"use client";

import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";

export interface IcpDistributionCardProps {
  icpFit: { labelAr: string; count: number; pct: number }[];
}

export function IcpDistributionCard({ icpFit }: IcpDistributionCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">توزيع ملاءمة ICP</p>
          <Link href="/sales/icp" className="text-xs text-primary hover:underline">
            تفاصيل ICP
          </Link>
        </div>
        {icpFit.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا بيانات ICP بعد</p>
        ) : (
          <ul className="space-y-2">
            {icpFit.map((f) => (
              <li key={f.labelAr} className="flex items-center gap-2 text-sm">
                <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
                <span className="w-24 shrink-0">{f.labelAr}</span>
                <span className="text-muted-foreground">{f.count}</span>
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
