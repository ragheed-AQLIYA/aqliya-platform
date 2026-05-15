import { cn } from "@/lib/utils"
import { Circle, CheckCircle2, AlertCircle, Clock, Sparkles } from "lucide-react"

interface TimelineEvent {
  id: string
  timestamp: Date | string
  type: "action" | "system" | "ai" | "approval" | "status_change"
  title: string
  description?: string
  actor?: string
  icon?: React.ElementType
}

interface EntityTimelineProps {
  events: TimelineEvent[]
  className?: string
  emptyMessage?: string
  maxEvents?: number
}

const typeConfig: Record<string, { color: string; defaultIcon: React.ElementType }> = {
  action: { color: "bg-primary", defaultIcon: Circle },
  system: { color: "bg-muted-foreground", defaultIcon: Circle },
  ai: { color: "bg-aqliya-cyan", defaultIcon: Sparkles },
  approval: { color: "bg-status-success", defaultIcon: CheckCircle2 },
  status_change: { color: "bg-status-warning", defaultIcon: AlertCircle },
}

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function EntityTimeline({
  events,
  className,
  emptyMessage = "No activity yet",
  maxEvents = 20,
}: EntityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-card p-8 text-center", className)}>
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-0", className)}>
      {events.slice(0, maxEvents).map((event, i) => {
        const config = typeConfig[event.type] || typeConfig.action
        const Icon = event.icon || config.defaultIcon
        const isLast = i === Math.min(events.length, maxEvents) - 1

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1.5", config.color)} />
              {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className={cn("pb-4", isLast && "pb-0")}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{event.title}</span>
                {event.actor && (
                  <span className="text-xs text-muted-foreground">by {event.actor}</span>
                )}
                {event.type === "ai" && (
                  <Sparkles className="h-3 w-3 text-aqliya-cyan" />
                )}
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              )}
              <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
