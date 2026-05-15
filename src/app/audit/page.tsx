export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/enterprise/kpi-card";
import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
  EnterpriseCardContent,
  EnterpriseCardFooter,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import {
  AIIndicator,
  AIInsightCard,
} from "@/components/enterprise/ai-indicator";
import { IntelligenceSummaryPanel } from "@/components/intelligence/intelligence-summary-panel";
import { EntityTimeline } from "@/components/entity/entity-timeline";
import { RecentEntitiesPanel } from "@/components/workspace/recent-entities";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { EngagementFormWrapper } from "@/components/audit/dashboard/engagement-form-wrapper";
import { RecentActivity } from "@/components/audit/dashboard/recent-activity";
import {
  getDashboardSummary,
  getEngagements,
  getAuditUsers,
} from "@/lib/audit/services";
import { getAuditActor } from "@/lib/audit/actor-context";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

function daysSince(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000,
  );
  if (diff === 0) return "اليوم";
  if (diff === 1) return "منذ يوم";
  return `منذ ${diff} أيام`;
}

export default async function AuditDashboardPage() {
  const actor = await getAuditActor();
  const [summary, engagements] = await Promise.all([
    getDashboardSummary(actor.organizationId),
    getEngagements(actor.organizationId),
  ]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Workspace Status */}
      <WorkspaceStatus
        module="audit"
        status={summary.openFindings > 5 ? "warning" : "healthy"}
        message={
          summary.openFindings > 5
            ? `${summary.openFindings} نتيجة مفتوحة تتطلب الانتباه`
            : "جميع المهام التشغيلية"
        }
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">AuditOS</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            ذكاء مالي ومسارات تدقيق مؤسسي محكوم
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AIIndicator type="verified" label="ذكاء التدقيق" />
          <EngagementFormWrapper
            users={
              summary.engagements.length > 0
                ? await getAuditUsers(actor.organizationId)
                : []
            }
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="إجمالي المهام"
          value={summary.totalEngagements}
          icon={FileText}
          module="audit"
        />
        <KPICard
          label="المهام النشطة"
          value={summary.activeEngagements}
          changeType="positive"
          icon={Clock}
          module="audit"
        />
        <KPICard
          label="بانتظار المراجعة"
          value={summary.pendingReviews}
          changeType={summary.pendingReviews > 0 ? "negative" : "neutral"}
          icon={AlertCircle}
          module="audit"
        />
        <KPICard
          label="النتائج المفتوحة"
          value={summary.openFindings}
          changeType={summary.openFindings > 0 ? "negative" : "positive"}
          icon={ShieldCheck}
          module="audit"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          label="أدلة مفقودة"
          value={summary.missingEvidence}
          changeType={summary.missingEvidence > 0 ? "negative" : "positive"}
          icon={AlertCircle}
          module="audit"
        />
        <KPICard
          label="جاهز للاعتماد"
          value={summary.readyForApproval}
          changeType="positive"
          icon={CheckCircle2}
          module="audit"
        />
        <KPICard
          label="منشورة"
          value={summary.publishedCount}
          icon={CheckCircle2}
          module="audit"
        />
      </div>

      {/* Intelligence Summary */}
      <IntelligenceSummaryPanel
        title="ذكاء التدقيق"
        module="audit"
        signals={[
          { type: "score", label: "عمق المراجعة", value: 74 },
          {
            type: "risk",
            label: "الأهمية المالية",
            value: summary.openFindings > 5 ? "high" : "medium",
          },
          {
            type: "confidence",
            label: "قوة الأدلة",
            value: summary.missingEvidence > 0 ? "partial" : "strong",
            confidence: 0.82,
          },
          {
            type: "readiness",
            label: "جاهزية الاعتماد",
            value: summary.readyForApproval > 0 ? "ready" : "not-ready",
          },
        ]}
      />

      {/* AI Insight */}
      {summary.openFindings > 0 && (
        <AIInsightCard confidence={0.85}>
          {summary.openFindings} نتيجة مفتوحة مكتشفة عبر{" "}
          {summary.activeEngagements} مهمة نشطة.
          {summary.missingEvidence > 0 &&
            ` {summary.missingEvidence} عنصر دليل ما زال مفقوداً. يُوصى بجمع الأدلة قبل المراجعة.`}
        </AIInsightCard>
      )}

      {/* Engagements */}
      <SectionHeader
        eyebrow="المهام"
        title="المهام النشطة"
        description="إدارة مهام التدقيق وتتبّع التقدّم"
      />

      <EnterpriseCard>
        {engagements.length === 0 ? (
          <EnterpriseCardContent className="py-12">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-base font-semibold text-foreground">
                لا توجد مهام بعد
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                أنشئ مهمة التدقيق الأولى للبدء.
              </p>
            </div>
          </EnterpriseCardContent>
        ) : (
          <div className="divide-y">
            {engagements.map((eng) => (
              <Link
                key={eng.id}
                href={`/audit/engagements/${eng.id}`}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50 first:pt-4 last:pb-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {eng.client?.name || "غير معروف"}
                    </span>
                    <StatusBadge status={eng.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{eng.fiscalPeriod}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {eng.team.length} فريق
                    </span>
                    {eng.alerts && eng.alerts.length > 0 && (
                      <span className="text-status-warning flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {eng.alerts.length} تنبيه
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {daysSince(eng.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </EnterpriseCard>

      {/* Recent Activity */}
      <SectionHeader
        eyebrow="النشاط"
        title="آخر النشاطات"
        description="أحدث الإجراءات عبر جميع المهام"
      />

      <EnterpriseCard>
        <EnterpriseCardContent>
          <RecentActivity events={summary.recentActivity} />
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Cross-module Recent */}
      <SectionHeader
        eyebrow="المنصة"
        title="آخر النشاطات"
        description="نشاطك الأخير عبر جميع الأنظمة"
      />
      <RecentEntitiesPanel entities={mockRecentEntities} />
    </div>
  );
}

// Mock cross-module recent entities
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
    type: "decision" as const,
    module: "decision" as const,
    title: "Q3 Investment Decision",
    status: "active",
    accessedAt: new Date(Date.now() - 3600000).toISOString(),
    href: "/decisions",
  },
  {
    id: "3",
    type: "deal" as const,
    module: "sales" as const,
    title: "Global Finance Deal",
    status: "active",
    accessedAt: new Date(Date.now() - 7200000).toISOString(),
    href: "/sales",
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
];
