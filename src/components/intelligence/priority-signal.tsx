import { cn } from "@/lib/utils"
import { ArrowUp, ArrowRight, ArrowDown, AlertTriangle } from "lucide-react"

export type PriorityLevel = "critical" | "high" | "medium" | "low"

interface PrioritySignalProps {
  level: PriorityLevel
  label?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const priorityConfig: Record<PriorityLevel, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  critical: {
    color: "text-status-error",
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    icon: AlertTriangle,
    label: "Critical",
  },
  high: {
    color: "text-status-error",
    bg: "bg-status-error/5",
    border: "border-status-error/10",
    icon: ArrowUp,
    label: "High",
  },
  medium: {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: ArrowRight,
    label: "Medium",
  },
  low: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: ArrowDown,
    label: "Low",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
  lg: "px-3 py-1.5 gap-2 text-sm [&_svg]:size-4",
}

export function PrioritySignal({
  level,
  label,
  showIcon = true,
  size = "md",
  className,
}: PrioritySignalProps) {
  const config = priorityConfig[level]
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
