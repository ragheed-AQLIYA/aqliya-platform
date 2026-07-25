"use client";

import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesDashboardStats } from "../sales-dashboard-client";

interface SalesRecentDealsProps {
  stats: SalesDashboardStats | null;
}

export function SalesRecentDeals({ stats }: SalesRecentDealsProps) {
  return (
    <>
      <SectionHeader
        eyebrow="النشاط"
        title="آخر الصفقات المحدّثة"
        description="من Prisma — updatedAt"
        module="sales"
      />
      <EnterpriseCard>
        <EnterpriseCardContent>
          {stats?.latestDeals.length ? (
            <div className="space-y-3">
              {stats.latestDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium">{deal.title}</span>
                    <span className="text-sm text-muted-foreground mr-2">
                      — {deal.account.name}
                    </span>
                  </div>
                  <StatusBadge
                    status={
                      deal.status === "open" ? "in_progress" : "completed"
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا صفقات بعد.</p>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </>
  );
}
