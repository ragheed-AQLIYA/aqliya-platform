"use client"

import {
  Activity, Upload, CheckCircle, AlertTriangle, MessageSquare,
  FileText, Scale, Send, Network, ShieldCheck, FileSearch,
} from "lucide-react"
import type { AuditEvent } from "@/types/audit"

const eventIcons: Record<string, React.ReactNode> = {
  "engagement.created": <Activity className="h-4 w-4" />,
  "engagement.state_changed": <Activity className="h-4 w-4" />,
  "team.assigned": <Activity className="h-4 w-4" />,
  "trial_balance.uploaded": <Upload className="h-4 w-4" />,
  "mapping.ai_suggested": <Network className="h-4 w-4" />,
  "mapping.confirmed": <Network className="h-4 w-4" />,
  "validation.completed": <ShieldCheck className="h-4 w-4" />,
  "evidence.uploaded": <Upload className="h-4 w-4" />,
  "evidence.accepted": <CheckCircle className="h-4 w-4" />,
  "signal.generated": <AlertTriangle className="h-4 w-4" />,
  "finding.created": <FileSearch className="h-4 w-4" />,
  "finding.state_changed": <Scale className="h-4 w-4" />,
  "recommendation.ai_suggested": <FileText className="h-4 w-4" />,
  "recommendation.created": <FileText className="h-4 w-4" />,
  "recommendation.state_changed": <FileText className="h-4 w-4" />,
  "review.comment_added": <MessageSquare className="h-4 w-4" />,
  "review.comment_resolved": <CheckCircle className="h-4 w-4" />,
  "approval.granted": <CheckCircle className="h-4 w-4" />,
  "publication.published": <Send className="h-4 w-4" />,
  "ai.output_generated": <FileText className="h-4 w-4" />,
  "ai.output_accepted": <CheckCircle className="h-4 w-4" />,
  "ai.output_rejected": <AlertTriangle className="h-4 w-4" />,
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) return "الآن"
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`
  if (diffHr < 24) return `منذ ${diffHr} ساعة`
  if (diffDay < 7) return `منذ ${diffDay} يوم`
  if (diffWeek < 5) return `منذ ${diffWeek} أسبوع`
  return `منذ ${diffMonth} شهر`
}

const eventColors: Record<string, string> = {
  "engagement.created": "bg-blue-500",
  "engagement.state_changed": "bg-blue-500",
  "team.assigned": "bg-indigo-500",
  "trial_balance.uploaded": "bg-emerald-500",
  "mapping.ai_suggested": "bg-purple-500",
  "mapping.confirmed": "bg-emerald-500",
  "validation.completed": "bg-teal-500",
  "evidence.uploaded": "bg-emerald-500",
  "evidence.accepted": "bg-green-500",
  "signal.generated": "bg-amber-500",
  "finding.created": "bg-orange-500",
  "finding.state_changed": "bg-orange-500",
  "recommendation.ai_suggested": "bg-violet-500",
  "recommendation.created": "bg-violet-500",
  "recommendation.state_changed": "bg-violet-500",
  "review.comment_added": "bg-rose-500",
  "approval.granted": "bg-green-500",
  "publication.published": "bg-sky-500",
  "ai.output_generated": "bg-violet-500",
  "ai.output_accepted": "bg-green-500",
  "ai.output_rejected": "bg-amber-500",
}

interface RecentActivityProps {
  events: AuditEvent[]
}

export function RecentActivity({ events }: RecentActivityProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">لا توجد نشاطات حديثة</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute start-4 top-0 h-full w-px bg-border" />
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${eventColors[event.eventType] || "bg-muted-foreground"}`}>
              {eventIcons[event.eventType] || <Activity className="h-4 w-4" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col pt-1">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm">
                  <span className="font-medium">{event.actorName}</span>{" "}
                  <span className="text-muted-foreground">{event.description}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
              {event.aiRelated && (
                <span className="mt-1 inline-flex w-fit items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  ذكاء اصطناعي
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
