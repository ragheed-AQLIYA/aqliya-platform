import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, AlertCircle, XCircle, PauseCircle } from "lucide-react"

export type ReadinessState = "not-ready" | "needs-review" | "ready" | "approved" | "blocked"

interface ReadinessStateProps {
  state: ReadinessState
  label?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const readinessConfig: Record<ReadinessState, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  "not-ready": {
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: XCircle,
    label: "Not Ready",
  },
  "needs-review": {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: Clock,
    label: "Needs Review",
  },
  ready: {
    color: "text-aqliya-blue",
    bg: "bg-aqliya-blue/10",
    border: "border-aqliya-blue/20",
    icon: CheckCircle2,
    label: "Ready",
  },
  approved: {
    color: "text-status-success",
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    icon: CheckCircle2,
    label: "Approved",
  },
  blocked: {
    color: "text-status-error",
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    icon: PauseCircle,
    label: "Blocked",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
  lg: "px-3 py-1.5 gap-2 text-sm [&_svg]:size-4",
}

export function ReadinessState({
  state,
  label,
  showIcon = true,
  size = "md",
  className,
}: ReadinessStateProps) {
  const config = readinessConfig[state]
  const Icon = config.icon
  const displayLabel = label ?? config.label

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        config.color,
        config.bg,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  )
}
