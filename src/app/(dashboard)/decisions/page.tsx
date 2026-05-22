import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getDecisions, getDashboardMetrics } from "@/actions/decisions";
import { DecisionDashboard } from "@/components/decisions/decision-dashboard";
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
import { Brain, FileText, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

type DecisionListItem = {
  id: string;
  title: string;
  status: string;
  type: string;
  priority?: string | null;
  description?: string | null;
  owner?: { name: string } | null;
  intake?: { status: string };
};

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

function getPriorityVariant(priority?: string | null) {
  if (priority === "HIGH" || priority === "CRITICAL")
    return "destructive" as const;
  if (priority === "MEDIUM") return "default" as const;
  return "secondary" as const;
}

function getStatusBadgeStatus(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "draft",
    IN_PROGRESS: "in_progress",
    APPROVED: "approved",
    REJECTED: "rejected",
    PENDING: "pending",
  };
  return map[status] ?? "draft";
}

export default async function DecisionsPage() {
  const [decisionsResult, metricsResult] = await Promise.all([
    getDecisions(),
    getDashboardMetrics(),
  ]);

  const decisions =
    decisionsResult.success && decisionsResult.data ? decisionsResult.data : [];
  const metrics = metricsResult.success ? metricsResult.data : null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Workspace Status */}
      <WorkspaceStatus
        module="decision"
        status="healthy"
        message="جميع مسارات العمل التشغيلية"
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-h2 font-black text-foreground">DecisionOS</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            مسارات قرارات منظّمة مع تحليل السيناريوهات والتوصيات والحوكمة
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AIIndicator type="insight" label="ذكاء القرارات" />
          <Link href="/decisions/new">
            <Button>قرار جديد</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="إجمالي القرارات"
            value={metrics.totalDecisions}
            icon={FileText}
            module="decision"
          />
          <KPICard
            label="معتمدة"
            value={metrics.approvedCount}
            change={`${metrics.totalDecisions > 0 ? Math.round((metrics.approvedCount / metrics.totalDecisions) * 100) : 0}%`}
            changeType="positive"
            icon={CheckCircle2}
            module="decision"
          />
          <KPICard
            label="بانتظار الاعتماد"
            value={metrics.pendingApproval}
            changeType="neutral"
            icon={Clock}
            module="decision"
          />
          <KPICard
            label="متوسط الإنجاز"
            value={`${metrics.avgCompletion}%`}
            changeType={
              metrics.avgCompletion > 70 ? "positive" : ("warning" as any)
            }
            icon={Brain}
            module="decision"
          />
        </div>
      )}

      {/* Dashboard Metrics */}
      {metrics && <DecisionDashboard metrics={metrics} />}

      {/* Intelligence Summary */}
      <IntelligenceSummaryPanel
        title="ذكاء القرارات"
        module="decision"
        signals={[
          { type: "score", label: "جاهزية القرار", value: 68 },
          { type: "risk", label: "مخاطر الخيارات", value: "medium" },
          {
            type: "confidence",
            label: "جودة الأدلة",
            value: "high",
            confidence: 0.75,
          },
          {
            type: "readiness",
            label: "توافق أصحاب المصلحة",
            value: "needs-review",
          },
        ]}
      />

      {/* AI Insight */}
      <AIInsightCard confidence={0.78}>
        قراران جاهزان للاعتماد. قرار واحد يتطلب تحليل سيناريوهات إضافي. يُوصى
        بمراجعة تحليل المخاطر للقرارات المعلّقة قبل المتابعة.
      </AIInsightCard>

      {/* All Decisions */}
      <SectionHeader
        eyebrow="القرارات"
        title="جميع القرارات"
        description="إدارة وتتبّع جميع مسارات القرارات"
        module="decision"
        action={
          <Link href="/decisions/new">
            <Button size="sm">+ قرار جديد</Button>
          </Link>
        }
      />

      {decisions.length === 0 ? (
        <EnterpriseCard>
          <EnterpriseCardContent className="py-12">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-base font-semibold text-foreground">
                لا توجد قرارات بعد
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                أنشئ أول قرار لبدء الحوكمة المنظّمة للقرارات.
              </p>
              <Link href="/decisions/new" className="mt-4 inline-block">
                <Button>إنشاء قرار</Button>
              </Link>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(decisions as DecisionListItem[]).map((decision) => (
            <Link key={decision.id} href={`/decisions/${decision.id}`}>
              <EnterpriseCard module="decision" hover className="h-full">
                <EnterpriseCardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <EnterpriseCardTitle className="truncate">
                      {decision.title}
                    </EnterpriseCardTitle>
                    <StatusBadge
                      status={getStatusBadgeStatus(decision.status)}
                      size="sm"
                    />
                  </div>
                </EnterpriseCardHeader>
                <EnterpriseCardContent>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge variant="outline" className="text-[10px]">
                      {decision.type}
                    </Badge>
                    {decision.priority && (
                      <Badge
                        variant={getPriorityVariant(decision.priority)}
                        className="text-[10px]"
                      >
                        {decision.priority}
                      </Badge>
                    )}
                  </div>
                  {decision.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {decision.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mt-2">
                    المالك: {decision.owner?.name || "غير معيّن"}
                  </div>
                </EnterpriseCardContent>
                <EnterpriseCardFooter className="flex items-center justify-between">
                  <Badge
                    variant={getIntakeVariant(decision.intake?.status)}
                    className="text-[10px]"
                  >
                    {decision.intake?.status?.replace("_", " ") ||
                      "استلام معلّق"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    عرض التفاصيل ←
                  </span>
                </EnterpriseCardFooter>
              </EnterpriseCard>
            </Link>
          ))}
        </div>
      )}

      {/* Two Column Layout: Recent + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader
            eyebrow="النشاط"
            title="نشاط القرارات"
            description="أحداث مسارات القرارات الأخيرة"
            module="decision"
          />
          <EnterpriseCard>
            <EnterpriseCardContent>
              <EntityTimeline events={mockDecisionTimeline} />
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
        <div>
          <RecentEntitiesPanel
            entities={mockRecentEntities}
            title="آخر النشاطات"
          />
        </div>
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockRecentEntities = [
  {
    id: "1",
    type: "decision" as const,
    module: "decision" as const,
    title: "Q3 Investment Decision",
    status: "in_progress",
    accessedAt: new Date().toISOString(),
    href: "/decisions",
  },
  {
    id: "2",
    type: "engagement" as const,
    module: "audit" as const,
    title: "Acme Corp — FY2025",
    status: "active",
    accessedAt: new Date(Date.now() - 3600000).toISOString(),
    href: "/audit",
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
    type: "decision" as const,
    module: "decision" as const,
    title: "Market Expansion",
    status: "approved",
    accessedAt: new Date(Date.now() - 86400000).toISOString(),
    href: "/decisions",
  },
];

const mockDecisionTimeline = [
  {
    id: "1",
    timestamp: new Date(),
    type: "ai" as const,
    title: "AI recommendation generated",
    description: "GO recommendation with 82% confidence",
    actor: "System",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 3600000),
    type: "action" as const,
    title: "Scenario analysis completed",
    description: "3 scenarios evaluated",
    actor: "Ahmed M.",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 7200000),
    type: "status_change" as const,
    title: "Decision moved to review",
    description: "Framework complete → In Review",
    actor: "System",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 86400000),
    type: "action" as const,
    title: "Risk analysis submitted",
    description: "All scenario risks documented",
    actor: "Sarah K.",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 172800000),
    type: "action" as const,
    title: "Decision created",
    description: "New decision workflow initiated",
    actor: "Ahmed M.",
  },
];
