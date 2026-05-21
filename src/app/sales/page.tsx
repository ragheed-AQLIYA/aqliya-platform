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
import { EntityIntelligencePanel } from "@/components/entity/entity-intelligence";
import { EntityTimeline } from "@/components/entity/entity-timeline";
import { ContextualActions } from "@/components/workspace/contextual-actions";
import { RecentEntitiesPanel } from "@/components/workspace/recent-entities";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Plus,
  Download,
} from "lucide-react";

// Mock data for demonstration (would come from API in production)
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
  {
    id: "3",
    type: "decision" as const,
    module: "decision" as const,
    title: "Q3 Investment Decision",
    status: "in_progress",
    accessedAt: new Date(Date.now() - 7200000).toISOString(),
    href: "/decisions",
  },
  {
    id: "4",
    type: "engagement" as const,
    module: "audit" as const,
    title: "TechStart Inc — Q4",
    status: "under_review",
    accessedAt: new Date(Date.now() - 86400000).toISOString(),
    href: "/audit",
  },
  {
    id: "5",
    type: "deal" as const,
    module: "sales" as const,
    title: "DataFlow Ltd Pipeline",
    status: "active",
    accessedAt: new Date(Date.now() - 172800000).toISOString(),
    href: "/sales",
  },
];

const mockTimeline = [
  {
    id: "1",
    timestamp: new Date(),
    type: "ai" as const,
    title: "AI evidence suggestion generated",
    description: "3 new evidence items suggested for Acme Corp engagement",
    actor: "System",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 3600000),
    type: "action" as const,
    title: "Trial balance uploaded",
    description: "FY2025 trial balance imported successfully",
    actor: "Ahmed M.",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 7200000),
    type: "status_change" as const,
    title: "Engagement status changed",
    description: "Setup → In Progress",
    actor: "System",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 86400000),
    type: "approval" as const,
    title: "Engagement approved",
    description: "Partner approval received",
    actor: "Sarah K.",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 172800000),
    type: "action" as const,
    title: "Engagement created",
    description: "New audit engagement for FY2025",
    actor: "Ahmed M.",
  },
];

export default function SalesDashboardPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        هذا السطح نموذج أولي داخلي لـ `SalesOS` ببيانات توضيحية ومسارات تفاعلية
        غير موصولة بقاعدة بيانات أو سير عمل محكوم. ليس جزءًا من إصدار v0.1
        الحالي.
      </div>

      {/* Workspace Status */}
      <WorkspaceStatus
        module="sales"
        status="healthy"
        message="جميع مسارات البيع التشغيلية"
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">SalesOS</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            ذكاء الإيرادات وإدارة مسارات البيع المؤسسي
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            نموذج أولي — بيانات توضيحية
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="إجمالي المسار"
          value="$2.4M"
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
          module="sales"
        />
        <KPICard
          label="الصفقات النشطة"
          value={48}
          change="+8"
          changeType="positive"
          icon={Target}
          module="sales"
        />
        <KPICard
          label="معدل الفوز"
          value="34%"
          change="-2.1%"
          changeType="negative"
          icon={TrendingUp}
          module="sales"
        />
        <KPICard
          label="الحسابات النشطة"
          value={156}
          change="+12"
          changeType="positive"
          icon={Users}
          module="sales"
        />
      </div>

      {/* Intelligence Summary */}
      <IntelligenceSummaryPanel
        title="ذكاء المسار البيعي"
        module="sales"
        signals={[
          { type: "score", label: "جودة المسار", value: 72 },
          { type: "risk", label: "مخاطر التحويل", value: "medium" },
          {
            type: "confidence",
            label: "ثقة التوقّع",
            value: "high",
            confidence: 0.78,
          },
          { type: "priority", label: "استعجال المتابعة", value: "high" },
        ]}
      />

      {/* AI Insight */}
      <AIInsightCard confidence={0.82}>
        بناءً على سرعة المسار الحالية، الإيرادات المتوقعة للربع الثالث هي ١٫٨
        مليون دولار (±١٢٪). ٣ صفقات تُظهر احتمالاً عالياً للإغلاق هذا الشهر.
        التركيز الموصى به: قطاع المؤسسات.
      </AIInsightCard>

      {/* Pipeline Overview */}
      <SectionHeader
        eyebrow="مسار البيع"
        title="مسار الصفقات"
        description="الفرص الحالية حسب المرحلة"
        module="sales"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>تأهيل</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-sm text-muted-foreground mt-1">
              قيمة محتملة $480K
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Acme Corp</span>
                <StatusBadge status="in_progress" size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">TechStart Inc</span>
                <StatusBadge status="pending" size="sm" />
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>عرض</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <div className="text-sm text-muted-foreground mt-1">
              قيمة محتملة $720K
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Global Finance</span>
                <StatusBadge status="under_review" size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">DataFlow Ltd</span>
                <StatusBadge status="in_progress" size="sm" />
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>تفاوض</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <div className="text-sm text-muted-foreground mt-1">
              قيمة محتملة $960K
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Enterprise Co</span>
                <StatusBadge status="pending_approval" size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Smart Systems</span>
                <StatusBadge status="in_progress" size="sm" />
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Two Column Layout: Follow-up + Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Follow-up Required */}
        <div className="lg:col-span-2">
          <SectionHeader
            eyebrow="إجراءات"
            title="متابعة مطلوبة"
            description="صفقات تتطلب اهتماماً فورياً"
            module="sales"
          />
          <EnterpriseCard>
            <EnterpriseCardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-status-error" />
                    <div>
                      <span className="text-sm font-medium">Acme Corp</span>
                      <span className="text-sm text-muted-foreground mr-2">
                        — لا تواصل منذ ١٤ يوماً
                      </span>
                    </div>
                  </div>
                  <StatusBadge status="blocked" size="sm" />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-status-warning" />
                    <div>
                      <span className="text-sm font-medium">
                        Global Finance
                      </span>
                      <span className="text-sm text-muted-foreground mr-2">
                        — العرض بانتظار الرد
                      </span>
                    </div>
                  </div>
                  <StatusBadge status="pending" size="sm" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-aqliya-cyan" />
                    <div>
                      <span className="text-sm font-medium">DataFlow Ltd</span>
                      <span className="text-sm text-muted-foreground mr-2">
                        — الذكاء الاصطناعي يقترح متابعة عاجلة
                      </span>
                    </div>
                  </div>
                  <AIIndicator type="suggestion" size="sm" />
                </div>
              </div>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Recent Entities */}
        <div>
          <RecentEntitiesPanel
            entities={mockRecentEntities}
            title="آخر النشاطات"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <SectionHeader
        eyebrow="النشاط"
        title="آخر النشاطات"
        description="آخر تحركات المسار البيعي"
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
