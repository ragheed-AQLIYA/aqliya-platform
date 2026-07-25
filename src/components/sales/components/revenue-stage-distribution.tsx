"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { formatSalesStageLabel } from "@/lib/sales/sales-ux-copy";
import type { RevenueStageBucket } from "@/lib/sales/vnext/revenue-intelligence";

export function RevenueStageDistribution({ buckets }: { buckets: RevenueStageBucket[] }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>توزيع المراحل</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {buckets.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا فرص نشطة في المسار</p>
        ) : (
          <div className="space-y-3">
            {buckets.map((bucket) => (
              <div key={bucket.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatSalesStageLabel(bucket.stage)}</span>
                  <span className="text-muted-foreground">
                    {bucket.count} · {bucket.rawValue.toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/70"
                    style={{ width: `${Math.min(100, bucket.pctOfPipeline)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {bucket.pctOfPipeline}% من المسار · مرجّح{" "}
                  {bucket.weightedValue.toLocaleString("ar-SA")} ر.س
                </p>
              </div>
            ))}
          </div>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
