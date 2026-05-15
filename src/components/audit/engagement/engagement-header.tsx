"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink, MoreHorizontal } from "lucide-react"
import type { Engagement, WorkflowStatus } from "@/types/audit"

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  setup: { label: "إعداد", variant: "secondary" },
  in_progress: { label: "قيد التنفيذ", variant: "default" },
  under_review: { label: "قيد المراجعة", variant: "outline" },
  awaiting_client: { label: "بانتظار العميل", variant: "outline" },
  ready_for_approval: { label: "جاهز للاعتماد", variant: "default" },
  approved: { label: "معتمد", variant: "default" },
  published: { label: "منشور", variant: "default" },
  archived: { label: "مؤرشف", variant: "ghost" },
}

const typeLabels: Record<string, string> = {
  full_audit: "تدقيق كامل",
  review: "مراجعة",
  agreed_upon_procedures: "إجراءات متفق عليها",
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
            <h1 className="text-2xl font-bold tracking-tight">{engagement.client?.name || "عميل غير معروف"}</h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>الفترة المالية: <span className="font-medium text-foreground">{engagement.fiscalPeriod}</span></span>
            <span>النوع: <span className="font-medium text-foreground">{typeLabels[engagement.engagementType] || engagement.engagementType}</span></span>
            <span>الإنجاز: <span className="font-medium text-foreground">{status.completionPercentage}%</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="ml-1 h-4 w-4" />
            الإعدادات
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="ml-1 h-4 w-4" />
            فتح
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
