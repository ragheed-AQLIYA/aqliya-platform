import { EngagementTabs } from "@/components/audit/engagement/engagement-tabs"
import { getWorkflowReadinessAction } from "@/actions/audit-read-actions"

export default async function EngagementLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ engagementId: string }>
}) {
  const { engagementId } = await params

  let workflowContext = undefined
  try {
    const readiness = await getWorkflowReadinessAction(engagementId)
    workflowContext = readiness.context
  } catch {
    // If readiness fetch fails (e.g., no session), render tabs without gating
  }

  return (
    <div className="space-y-6">
      <EngagementTabs engagementId={engagementId} workflowContext={workflowContext} />
      {children}
    </div>
  )
}
