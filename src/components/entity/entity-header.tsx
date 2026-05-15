import { cn } from "@/lib/utils"
import { EntityIcon, type EntityIconType } from "./entity-icon"
import { StatusBadge } from "@/components/enterprise/status-badge"
import { AIIndicator } from "@/components/enterprise/ai-indicator"

interface EntityHeaderProps {
  icon: EntityIconType
  title: string
  subtitle?: string
  status?: string
  module?: "audit" | "sales" | "decision" | "platform"
  actions?: React.ReactNode
  intelligence?: React.ReactNode
  className?: string
}

const moduleBorderClasses: Record<string, string> = {
  audit: "border-l-module-audit",
  sales: "border-l-module-sales",
  decision: "border-l-module-decision",
  platform: "",
}

export function EntityHeader({
  icon,
  title,
  subtitle,
  status,
  module = "platform",
  actions,
  intelligence,
  className,
}: EntityHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-card p-5",
        moduleBorderClasses[module],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="shrink-0 mt-0.5">
            <EntityIcon type={icon} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {status && <StatusBadge status={status} size="sm" />}
              {intelligence}
            </div>
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
