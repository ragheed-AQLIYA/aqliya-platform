import { cn } from "@/lib/utils"
import { Clock, FileText, ShieldCheck, TrendingUp, Brain } from "lucide-react"
import Link from "next/link"

interface RecentEntity {
  id: string
  type: "decision" | "engagement" | "deal" | "client" | "report"
  module: "audit" | "sales" | "decision"
  title: string
  status: string
  accessedAt: string
  href: string
}

interface RecentEntitiesPanelProps {
  entities: RecentEntity[]
  className?: string
  title?: string
  maxItems?: number
}

const moduleIcons: Record<string, React.ElementType> = {
  audit: ShieldCheck,
  sales: TrendingUp,
  decision: Brain,
}

const moduleColors: Record<string, string> = {
  audit: "text-module-audit",
  sales: "text-module-sales",
  decision: "text-module-decision",
}

const typeIcons: Record<string, React.ElementType> = {
  decision: FileText,
  engagement: ShieldCheck,
  deal: TrendingUp,
  client: FileText,
  report: FileText,
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
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

export function RecentEntitiesPanel({
  entities,
  className,
  title = "Recent",
  maxItems = 8,
}: RecentEntitiesPanelProps) {
  if (entities.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-card p-6 text-center", className)}>
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="border-b px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="divide-y">
        {entities.slice(0, maxItems).map((entity) => {
          const ModuleIcon = moduleIcons[entity.module]
          const TypeIcon = typeIcons[entity.type] || FileText

          return (
            <Link
              key={entity.id}
              href={entity.href}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entity.title}</p>
                  <div className="flex items-center gap-2">
                    <ModuleIcon className={cn("h-3 w-3", moduleColors[entity.module])} />
                    <span className="text-xs text-muted-foreground capitalize">{entity.type}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo(entity.accessedAt)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
