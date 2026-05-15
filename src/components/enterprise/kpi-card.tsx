import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  label: string
  labelAr?: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ElementType
  module?: "audit" | "sales" | "decision" | "platform"
  className?: string
  suffix?: string
  prefix?: string
}

const moduleColors: Record<string, string> = {
  audit: "border-l-module-audit",
  sales: "border-l-module-sales",
  decision: "border-l-module-decision",
  platform: "border-l-primary",
}

export function KPICard({
  label,
  labelAr,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  module = "platform",
  className,
  suffix,
  prefix,
}: KPICardProps) {
  const ChangeIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : Minus

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-l-4 bg-card p-5 transition-all hover:shadow-md",
        moduleColors[module],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-lg font-medium text-muted-foreground">{prefix}</span>}
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {value}
            </span>
            {suffix && <span className="text-sm font-medium text-muted-foreground">{suffix}</span>}
          </div>
          {change && (
            <div className="flex items-center gap-1">
              <ChangeIcon
                className={cn(
                  "h-3.5 w-3.5",
                  changeType === "positive" && "text-status-success",
                  changeType === "negative" && "text-status-error",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  changeType === "positive" && "text-status-success",
                  changeType === "negative" && "text-status-error",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
