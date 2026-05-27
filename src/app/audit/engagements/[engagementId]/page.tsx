import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EngagementHeader } from "@/components/audit/engagement/engagement-header";
import { AlertsBar } from "@/components/audit/engagement/alerts-bar";
import { OverviewTab } from "@/components/audit/engagement/overview-tab";
import { RecentActivity } from "@/components/audit/dashboard/recent-activity";
import { WorkflowProgress } from "@/components/audit/layout/workflow-progress";
import {
  getEngagement,
  getEngagementWorkflowStatus,
  getAuditEvents,
  getAISuggestions,
  getMissingEvidence,
} from "@/lib/audit/services";
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { ArrowLeft, Circle } from "lucide-react";
import { AIOutputsPanel } from "@/components/audit/ai/ai-outputs-panel";
import { ArchiveEngagementButton } from "@/components/audit/engagement/archive-engagement-button";

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const actor = await getAuditActor();

  const [
    engagement,
    workflowStatusRaw,
    auditEvents,
    aiOutputs,
    missingEvidence,
  ] = await Promise.all([
    getEngagement(actor.organizationId, engagementId),
    getEngagementWorkflowStatus(engagementId).catch(() => null),
    getAuditEvents(engagementId).catch(() => []),
    getAISuggestions(engagementId).catch(() => []),
    getMissingEvidence(engagementId).catch(() => []),
  ]);

  if (!engagement) {
    notFound();
  }

  await assertEngagementAccess(engagementId, actor);

  const workflowStatus = workflowStatusRaw ?? {
    currentState: "setup" as const,
    availableTransitions: [] as string[],
    blockingIssues: [] as string[],
    completionPercentage: 0,
  };

  const recentEvents = auditEvents.slice(-5).reverse();

  const canArchive = ["admin", "partner"].includes(actor.actorRole);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <Link href="/audit">
          <Button variant="outline" size="sm">
            <ArrowLeft className="ml-1 h-4 w-4" />
            العودة إلى لوحة AuditOS
          </Button>
        </Link>
        <ArchiveEngagementButton
          engagementId={engagementId}
          engagementStatus={engagement.status}
          canArchive={canArchive}
        />
      </div>

      <EngagementHeader engagement={engagement} status={workflowStatus} />

      <WorkflowProgress status={engagement.status} />

      {engagement.alerts && engagement.alerts.length > 0 && (
        <AlertsBar alerts={engagement.alerts} />
      )}

      <OverviewTab engagementId={engagementId} engagement={engagement} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[24px] border-border/70 shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-bold">سجل النشاط</h2>
          </div>
          <CardContent className="pt-4">
            <RecentActivity events={recentEvents} />
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-border/70 shadow-sm">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-bold">ملخص التتبع</h2>
          </div>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
                <h3 className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  التتبع الأمامي
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
                  <span>
                    ميزان المراجعة ← التصنيف ← الأدلة ← النتائج ← التوصيات
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <h3 className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  التتبع العكسي
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-300">
                  <span>النشر ← الاعتماد ← المراجعة ← القوائم</span>
                </div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                <h3 className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  الروابط الناقصة
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-blue-600 dark:text-blue-300">
                  {missingEvidence.length === 0 ? (
                    <li className="flex items-center gap-1">
                      <Circle className="h-2 w-2" />
                      لا توجد عناصر دليل مفقودة مسجلة
                    </li>
                  ) : (
                    missingEvidence.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex items-center gap-1">
                        <Circle className="h-2 w-2" />
                        {item.filename}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIOutputsPanel engagementId={engagementId} initialOutputs={aiOutputs} />
    </div>
  );
}
