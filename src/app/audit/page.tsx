export const dynamic = "force-dynamic";

import Link from "next/link";
import { KPICard } from "@/components/enterprise/kpi-card";
import { SectionHeader } from "@/components/enterprise/section-header";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import {
  AIIndicator,
  AIInsightCard,
} from "@/components/enterprise/ai-indicator";
import { IntelligenceSummaryPanel } from "@/components/intelligence/intelligence-summary-panel";
import { WorkspaceStatus } from "@/components/workspace/workspace-status";
import { EngagementFormWrapper } from "@/components/audit/dashboard/engagement-form-wrapper";
import { EngagementListItem } from "@/components/audit/dashboard/engagement-list-item";
import { RecentActivity } from "@/components/audit/dashboard/recent-activity";
import { getWorkflowReadinessAction } from "@/actions/audit-read-actions";
import { getNextWorkflowAction } from "@/lib/audit/workflow-next-action";
import {
  getDashboardSummary,
  getEngagements,
  getAuditUsers,
} from "@/lib/audit/services";
import { getAuditActor } from "@/lib/audit/actor-context";
import { prisma } from "@/lib/prisma";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

async function getEngagementOperatorSummaries(engagementIds: string[]) {
  const summaries = await Promise.all(
    engagementIds.map(async (id) => {
      try {
        const readiness = await getWorkflowReadinessAction(id);
        return {
          id,
          nextAction: getNextWorkflowAction(
            id,
            readiness.context,
            readiness.workflowStatus.blockingIssues,
          ),
          blockingIssues: readiness.workflowStatus.blockingIssues,
        };
      } catch {
        return { id, nextAction: null, blockingIssues: [] as string[] };
      }
    }),
  );
  return new Map(summaries.map((s) => [s.id, s]));
}

type EngagementWithPlatformContext = Awaited<
  ReturnType<typeof getEngagements>
>[number] & {
  projectId?: string | null;
  client?:
    | (Awaited<ReturnType<typeof getEngagements>>[number]["client"] & {
        clientWorkspaceId?: string | null;
      })
    | null;
};

function getEngagementProjectId(
  engagement: Awaited<ReturnType<typeof getEngagements>>[number],
) {
  return (engagement as EngagementWithPlatformContext).projectId ?? null;
}

function getClientWorkspaceId(
  engagement: Awaited<ReturnType<typeof getEngagements>>[number],
) {
  return (
    (engagement as EngagementWithPlatformContext).client?.clientWorkspaceId ??
    null
  );
}

export default async function AuditDashboardPage() {
  const actor = await getAuditActor();
  const [summary, engagements] = await Promise.all([
    getDashboardSummary(actor.organizationId),
    getEngagements(actor.organizationId),
  ]);

  const reviewDepthScore =
    summary.totalEngagements === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            100 - summary.openFindings * 6 - summary.missingEvidence * 8,
          ),
        );
  const evidenceStrength =
    summary.totalEngagements === 0
      ? "partial"
      : summary.missingEvidence > 0
        ? "partial"
        : "strong";
  const evidenceConfidence =
    summary.totalEngagements === 0
      ? 0.4
      : summary.missingEvidence > 0
        ? 0.62
        : 0.82;
  const insightConfidence =
    summary.totalEngagements === 0
      ? 0.45
      : summary.missingEvidence > 0 || summary.openFindings > 0
        ? 0.68
        : 0.85;

  // Batch-fetch project context for engagements
  const engagementProjectIds = engagements
    .map((engagement) => getEngagementProjectId(engagement))
    .filter((projectId): projectId is string => Boolean(projectId));
  const projects =
    engagementProjectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: engagementProjectIds } },
          select: { id: true, name: true, projectType: true },
        })
      : [];
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Batch-fetch workspace context for unique client workspace IDs
  const clientWorkspaceIds = [
    ...new Set(
      engagements
        .map((engagement) => getClientWorkspaceId(engagement))
        .filter((workspaceId): workspaceId is string => Boolean(workspaceId)),
    ),
  ];
  const workspaces =
    clientWorkspaceIds.length > 0
      ? await prisma.clientWorkspace.findMany({
          where: { id: { in: clientWorkspaceIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
  const workspaceMap = new Map(workspaces.map((w) => [w.id, w]));

  const operatorSummaries = await getEngagementOperatorSummaries(
    engagements.map((eng) => eng.id),
  );

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
          <Link
            href="/audit/portfolio"
            className="text-sm font-medium text-primary hover:underline"
          >
            محفظة التدقيق ←
          </Link>
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
          { type: "score", label: "عمق المراجعة", value: reviewDepthScore },
          {
            type: "risk",
            label: "الأهمية المالية",
            value: summary.openFindings > 5 ? "high" : "medium",
          },
          {
            type: "evidence",
            label: "قوة الأدلة",
            value: evidenceStrength,
            confidence: evidenceConfidence,
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
        <AIInsightCard confidence={insightConfidence}>
          {summary.openFindings} نتيجة مفتوحة مكتشفة عبر{" "}
          {summary.activeEngagements} مهمة نشطة.
          {summary.missingEvidence > 0 &&
            ` ${summary.missingEvidence} عنصر دليل ما زال مفقوداً. يُوصى بجمع الأدلة قبل المراجعة.`}
        </AIInsightCard>
      )}

      {/* Engagements */}
      <SectionHeader
        eyebrow="المهام"
        title="المهام النشطة"
        description="كل مهمة تعرض الخطوة التالية المطلوبة — بدون مقاييس وهمية"
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
            {engagements.map((eng) => {
              const summary = operatorSummaries.get(eng.id);
              const projectId = getEngagementProjectId(eng);
              const workspaceId = getClientWorkspaceId(eng);

              return (
                <EngagementListItem
                  key={eng.id}
                  engagement={eng}
                  nextAction={summary?.nextAction ?? null}
                  blockingIssues={summary?.blockingIssues ?? []}
                  projectName={
                    projectId && projectMap.has(projectId)
                      ? projectMap.get(projectId)!.name
                      : null
                  }
                  workspaceName={
                    workspaceId && workspaceMap.has(workspaceId)
                      ? workspaceMap.get(workspaceId)!.name
                      : null
                  }
                />
              );
            })}
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
    </div>
  );
}
