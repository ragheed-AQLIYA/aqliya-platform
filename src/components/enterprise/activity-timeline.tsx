import { cn } from "@/lib/utils"
import { Circle } from "lucide-react"

interface ActivityItem {
  id: string
  title: string
  description?: string
  timestamp: string | Date
  type?: "action" | "system" | "ai" | "approval"
  user?: string
}

interface ActivityTimelineProps {
  items: ActivityItem[]
  className?: string
  emptyMessage?: string
}

const typeColors: Record<string, string> = {
  action: "bg-primary",
  system: "bg-muted-foreground",
  ai: "bg-aqliya-cyan",
  approval: "bg-status-success",
}

function formatTimestamp(timestamp: string | Date): string {
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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function ActivityTimeline({ items, className, emptyMessage = "No activity yet" }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Circle className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        const dotColor = typeColors[item.type ?? "action"]

        return (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1.5", dotColor)} />
              {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className={cn("pb-4", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                {item.user && (
                  <span className="text-xs text-muted-foreground">by {item.user}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              )}
              <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
