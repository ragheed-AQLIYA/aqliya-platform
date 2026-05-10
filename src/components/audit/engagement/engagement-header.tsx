"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink, MoreHorizontal } from "lucide-react"
import type { Engagement, WorkflowStatus } from "@/types/audit"

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

const typeLabels: Record<string, string> = {
  full_audit: "Full Audit",
  review: "Review",
  agreed_upon_procedures: "Agreed Upon Procedures",
}

interface EngagementHeaderProps {
  engagement: Engagement
  status: WorkflowStatus
}

export function EngagementHeader({ engagement, status }: EngagementHeaderProps) {
  const statusConfig = statusLabels[engagement.status] || { label: engagement.status, variant: "secondary" as const }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{engagement.client?.name || "Unknown Client"}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Fiscal Period: <span className="font-medium text-foreground">{engagement.fiscalPeriod}</span></span>
            <span>Type: <span className="font-medium text-foreground">{typeLabels[engagement.engagementType] || engagement.engagementType}</span></span>
            <span>Completion: <span className="font-medium text-foreground">{status.completionPercentage}%</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-1 h-4 w-4" />
            Open
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
