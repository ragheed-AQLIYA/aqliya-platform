import { EngagementTabs } from "@/components/audit/engagement/engagement-tabs";
import { PlatformContextCard } from "@/components/audit/engagement/platform-context-card";
import { EngagementWorkflowShell } from "@/components/audit/layout/engagement-workflow-shell";
import { getWorkflowReadinessAction } from "@/actions/audit-read-actions";

export default async function EngagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;

  let workflowContext = undefined;
  try {
    const readiness = await getWorkflowReadinessAction(engagementId);
    workflowContext = readiness.context;
  } catch {
    // If readiness fetch fails (e.g., no session), render tabs without gating
  }

  return (
    <div className="space-y-6">
      <PlatformContextCard engagementId={engagementId} />
      <EngagementTabs
        engagementId={engagementId}
        workflowContext={workflowContext}
      />
      <EngagementWorkflowShell engagementId={engagementId}>
        {children}
      </EngagementWorkflowShell>
    </div>
  );
}
