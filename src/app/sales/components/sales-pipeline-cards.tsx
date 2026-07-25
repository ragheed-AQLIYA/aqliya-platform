"use client";

import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesDashboardStats } from "../sales-dashboard-client";

interface SalesPipelineCardsProps {
  stats: SalesDashboardStats | null;
}

export function SalesPipelineCards({ stats }: SalesPipelineCardsProps) {
  const stageCards = stats?.dealsByStage.filter((s) => s._count.deals > 0).slice(0, 3) ?? [];

  return (
    <>
      <SectionHeader
        eyebrow="مسار البيع"
        title="مسار الصفقات"
        description="الفرص الحالية حسب المرحلة (Prisma)"
        module="sales"
      />

      {stageCards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stageCards.map((stage) => (
            <EnterpriseCard key={stage.id} module="sales">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>{stage.name}</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stage._count.deals}
                </div>
                <div className="mt-3 space-y-2">
                  {stage.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {deal.account.name}
                      </span>
                      <StatusBadge status="in_progress" size="sm" />
                    </div>
                  ))}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))}
        </div>
      ) : (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent>
            <p className="text-sm text-muted-foreground">
              لا توجد صفقات مفتوحة في المسار — شغّل seed أو أنشئ صفقات عبر server actions.
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </>
  );
}
