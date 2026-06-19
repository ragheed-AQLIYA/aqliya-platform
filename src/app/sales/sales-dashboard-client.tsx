"use client";

import { KPICard } from "@/components/enterprise/kpi-card";
import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import {
  AIIndicator,
  AIInsightCard,
} from "@/components/enterprise/ai-indicator";
import { IntelligenceSummaryPanel } from "@/components/intelligence/intelligence-summary-panel";
import { EntityTimeline } from "@/components/entity/entity-timeline";
import { ContextualActions } from "@/components/workspace/contextual-actions";
import { RecentEntitiesPanel } from "@/components/workspace/recent-entities";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";

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

function formatPipelineValue(stats: SalesDashboardStats | null): string {
  if (!stats) return "—";
  const total = stats.dealsByStage.reduce((sum, stage) => {
    return (
      sum +
      stage.deals.reduce((s, d) => s + (d.amount ?? 0), 0)
    );
  }, 0);
  if (total === 0) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(total);
}

export function SalesDashboardClient({
  stats,
  statsError,
  hasDbData,
}: SalesDashboardClientProps) {
  const stageCards = stats?.dealsByStage.filter((s) => s._count.deals > 0).slice(0, 3) ?? [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        {hasDbData
          ? "SalesOS L5 — بيانات حقيقية من Prisma (P0). جميع التدفقات الأساسية تعمل مع الحوكمة وسجل التدقيق."
          : "SalesOS L5 — قاعدة البيانات جاهزة. شغّل `npx prisma db seed` لعرض بيانات حقيقية."}
      </div>

      {statsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          تعذر تحميل إحصائيات SalesOS: {statsError}
        </div>
      ) : null}

      <WorkspaceStatus
        module="sales"
        status={hasDbData ? "healthy" : "degraded"}
        message={
          hasDbData
            ? "مسار البيع — P0 foundation"
            : "بانتظار migration + seed"
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">SalesOS</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            ذكاء الإيرادات وإدارة مسارات البيع المؤسسي
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {hasDbData ? "L5 Pilot-ready — Prisma" : "L5 — database connected"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AIIndicator type="insight" label="٣ رؤى ذكية" />
          <ContextualActions
            orientation="horizontal"
            actions={[
              {
                id: "new-deal",
                label: "صفقة جديدة",
                icon: "Plus",
                variant: "default",
                action: () => {},
              },
              {
                id: "export",
                label: "تصدير",
                icon: "Download",
                variant: "secondary",
                action: () => {},
              },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="قيمة المسار المفتوح (تقريبي)"
          value={formatPipelineValue(stats)}
          icon={DollarSign}
          module="sales"
        />
        <KPICard
          label="الصفقات المفتوحة"
          value={stats?.openDealCount ?? "—"}
          icon={Target}
          module="sales"
        />
        <KPICard
          label="إجمالي الصفقات"
          value={stats?.dealCount ?? "—"}
          icon={TrendingUp}
          module="sales"
        />
        <KPICard
          label="الحسابات"
          value={stats?.accountCount ?? "—"}
          icon={Users}
          module="sales"
        />
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
