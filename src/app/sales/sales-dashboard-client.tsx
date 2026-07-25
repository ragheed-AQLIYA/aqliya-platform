"use client";

import { AIInsightCard } from "@/components/enterprise/ai-indicator";
import { IntelligenceSummaryPanel } from "@/components/intelligence";
import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { EntityTimeline } from "@/components/entity/entity-timeline";
import { RecentEntitiesPanel } from "@/components/workspace/recent-entities";

import { SalesDashboardBanner } from "./components/sales-dashboard-banner";
import { SalesDashboardHeader } from "./components/sales-dashboard-header";
import { SalesKPIRow } from "./components/sales-kpi-row";
import { SalesPipelineCards } from "./components/sales-pipeline-cards";
import { SalesRecentDeals } from "./components/sales-recent-deals";

export interface SalesDashboardStats {
  accountCount: number;
  dealCount: number;
  openDealCount: number;
  dealsByStage: Array<{
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    _count: { deals: number };
    deals: Array<{
      id: string;
      title: string;
      amount: number | null;
      currency: string;
      status: string;
      account: { name: string };
    }>;
  }>;
  latestDeals: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
    account: { name: string };
  }>;
}

interface SalesDashboardClientProps {
  stats: SalesDashboardStats | null;
  statsError?: string;
  hasDbData: boolean;
}

const mockRecentEntities = [
  {
    id: "1",
    type: "engagement" as const,
    module: "audit" as const,
    title: "Acme Corp — FY2025",
    status: "in_progress",
    accessedAt: new Date().toISOString(),
    href: "/audit",
  },
  {
    id: "2",
    type: "deal" as const,
    module: "sales" as const,
    title: "Global Finance Deal",
    status: "active",
    accessedAt: new Date(Date.now() - 3600000).toISOString(),
    href: "/sales",
  },
];

const mockTimeline = [
  {
    id: "1",
    timestamp: new Date(),
    type: "action" as const,
    title: "SalesOS foundation loaded",
    description: "Dashboard wired to Prisma-backed counts where available",
    actor: "System",
  },
];

export function SalesDashboardClient({
  stats,
  statsError,
  hasDbData,
}: SalesDashboardClientProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <SalesDashboardBanner hasDbData={hasDbData} statsError={statsError} />
      <SalesDashboardHeader hasDbData={hasDbData} />
      <SalesKPIRow stats={stats} />

      <IntelligenceSummaryPanel
        title="ذكاء المسار البيعي"
        module="sales"
        signals={[
          { type: "score", label: "جودة المسار", value: hasDbData ? 72 : 0 },
          { type: "risk", label: "مخاطر التحويل", value: "medium" },
          {
            type: "confidence",
            label: "ثقة التوقّع",
            value: hasDbData ? "medium" : "low",
            confidence: hasDbData ? 0.55 : 0.2,
          },
          { type: "priority", label: "استعجال المتابعة", value: "medium" },
        ]}
      />

      <AIInsightCard confidence={hasDbData ? 0.55 : 0.2}>
        {hasDbData
          ? `يوجد ${stats?.openDealCount ?? 0} صفقة مفتوحة عبر ${stats?.dealsByStage.filter((s) => s._count.deals > 0).length ?? 0} مرحلة نشطة. الذكاء التنبؤي الكامل غير مفعّل في PR-1.`
          : "بعد تطبيق migration و seed، ستظهر هنا إحصائيات حقيقية من Prisma. الذكاء التنبؤي غير مفعّل في PR-1."}
      </AIInsightCard>

      <SalesPipelineCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesRecentDeals stats={stats} />
        </div>
        <div>
          <RecentEntitiesPanel
            entities={mockRecentEntities}
            title="آخر النشاطات (توضيحي)"
          />
        </div>
      </div>

      <SectionHeader
        eyebrow="النشاط"
        title="سجل النشاط (توضيحي)"
        description="Platform timeline — PR-2"
        module="sales"
      />
      <EnterpriseCard>
        <EnterpriseCardContent>
          <EntityTimeline events={mockTimeline} />
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
