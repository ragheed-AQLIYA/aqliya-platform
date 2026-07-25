"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import type { AccountIntelligenceSummary } from "@/lib/sales/vnext/account-intelligence";

export function AccountProfileMetrics({
  intelligence,
  interactionCount,
}: {
  intelligence: AccountIntelligenceSummary;
  interactionCount: number;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">نظرة عامة</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">صحة الحساب</p>
            <p className="text-2xl font-bold">{intelligence.healthScore}%</p>
            <p className="text-sm">{intelligence.healthLevel}</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">قيمة المسار</p>
            <p className="text-2xl font-bold">
              {intelligence.pipelineValue.toLocaleString("ar-SA")}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">تفاعلات</p>
            <p className="text-2xl font-bold">{interactionCount}</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </section>
  );
}
