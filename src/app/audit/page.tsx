export const dynamic = "force-dynamic"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsOverview } from "@/components/audit/dashboard/stats-overview"
import { RecentActivity } from "@/components/audit/dashboard/recent-activity"
import { EngagementFormWrapper } from "@/components/audit/dashboard/engagement-form-wrapper"
import { getDashboardSummary, getEngagements, getAuditUsers } from "@/lib/audit/services"
import { getAuditActor } from "@/lib/audit/actor-context"
import { Circle } from "lucide-react"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" }> = {
  draft: { label: "Draft", variant: "secondary" },
  setup: { label: "Setup", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  under_review: { label: "Under Review", variant: "outline" },
  awaiting_client: { label: "Awaiting Client", variant: "outline" },
  ready_for_approval: { label: "Ready for Approval", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "ghost" },
}

function daysSince(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "1 day ago"
  return `${diff} days ago`
}

export default async function AuditDashboardPage() {
  const actor = await getAuditActor()
  const [summary, engagements] = await Promise.all([
    getDashboardSummary(actor.organizationId),
    getEngagements(actor.organizationId),
  ])

  return (
    <div className="space-y-8">
      <section id="dashboard">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AQLIYA AuditOS</h1>
            <p className="mt-1 text-sm text-muted-foreground">Current primary product line for Financial Intelligence and governed financial assurance workflows</p>
          </div>
          <EngagementFormWrapper users={summary.engagements.length > 0 ? (await getAuditUsers()) : []} />
        </div>
      </section>

      <StatsOverview
        stats={{
          totalEngagements: summary.totalEngagements,
          activeEngagements: summary.activeEngagements,
          pendingReviews: summary.pendingReviews,
          openFindings: summary.openFindings,
          missingEvidence: summary.missingEvidence,
          readyForApproval: summary.readyForApproval,
          publishedCount: summary.publishedCount,
        }}
      />

      <section id="engagements" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Engagements</h2>
          </div>
          <CardContent className="divide-y pt-0">
            {engagements.map((eng) => {
              const config = statusLabels[eng.status] || { label: eng.status, variant: "secondary" as const }
              return (
                <Link
                  key={eng.id}
                  href={`/audit/engagements/${eng.id}`}
                  className="flex items-start gap-4 px-0 py-4 transition-colors hover:bg-muted/30 first:pt-4 last:pb-0"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{eng.client?.name || "Unknown"}</span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{eng.fiscalPeriod}</span>
                      <span className="flex items-center gap-1">
                        <Circle className="h-1.5 w-1.5 fill-current" />
                        {eng.team.length} team members
                      </span>
                      {eng.alerts && eng.alerts.length > 0 && (
                        <span className="text-amber-600">
                          {eng.alerts.length} alert{eng.alerts.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {daysSince(eng.updatedAt)}
                  </div>
                </Link>
              )
            })}
            {engagements.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No engagements found</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="clients" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Clients</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Client records are linked through engagements. Open an engagement to view and manage client details.
          </CardContent>
        </Card>
      </section>

      <section id="trial-balances" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Trial Balances</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Trial balances are imported and managed within each audit engagement.
          </CardContent>
        </Card>
      </section>

      <section id="statements" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Financial Statements</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Draft financial statements are generated and reviewed within each engagement workspace.
          </CardContent>
        </Card>
      </section>

      <section id="evidence" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Evidence</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Evidence requirements and supporting documents are linked inside each engagement.
          </CardContent>
        </Card>
      </section>

      <section id="findings" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Findings</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Review findings are tracked per engagement. Open an engagement to view and manage findings.
          </CardContent>
        </Card>
      </section>

      <section id="recommendations" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Recommendations</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Recommendations are managed within each engagement as part of the governed review workflow.
          </CardContent>
        </Card>
      </section>

      <section id="reviews" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Reviews</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            The review queue consolidates findings and evidence readiness across all active engagements.
          </CardContent>
        </Card>
      </section>

      <section id="approval" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Approval</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Approval workflows are governed per engagement with full traceability and audit trail.
          </CardContent>
        </Card>
      </section>

      <section id="publication" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Publication</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Once approved, engagement packages can be prepared for publication with full traceability.
          </CardContent>
        </Card>
      </section>

      <section id="audit-trail" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Audit Trail</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Every action within AuditOS is recorded with timestamp, actor, and change details for full traceability.
          </CardContent>
        </Card>
      </section>

      <section id="settings" className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Settings</h2>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Organisation and user settings are accessible from the admin panel. Navigate to Admin for configuration.
          </CardContent>
        </Card>
      </section>

      <section className="scroll-mt-20">
        <Card>
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>
          <CardContent className="pt-4">
            <RecentActivity events={summary.recentActivity} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
