import { EngagementTabs } from "@/components/audit/engagement/engagement-tabs"

export default async function EngagementLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ engagementId: string }>
}) {
  const { engagementId } = await params

  return (
    <div className="space-y-6">
      <EngagementTabs engagementId={engagementId} />
      {children}
    </div>
  )
}
