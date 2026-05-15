import { cn } from "@/lib/utils"
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react"

export type RiskLevel = "low" | "medium" | "high" | "critical"

interface RiskIndicatorProps {
  level: RiskLevel
  label?: string
  showIcon?: boolean
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  low: {
    color: "text-status-success",
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    icon: ShieldCheck,
    label: "Low Risk",
  },
  medium: {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: Shield,
    label: "Medium Risk",
  },
  high: {
    color: "text-status-error",
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    icon: AlertTriangle,
    label: "High Risk",
  },
  critical: {
    color: "text-status-error",
    bg: "bg-status-error/20",
    border: "border-status-error/30",
    icon: ShieldAlert,
    label: "Critical",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
  lg: "px-3 py-1.5 gap-2 text-sm [&_svg]:size-4",
}

export function RiskIndicator({
  level,
  label,
  showIcon = true,
  showLabel = true,
  size = "md",
  className,
}: RiskIndicatorProps) {
  const config = riskConfig[level]
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
      {showLabel && <span>{displayLabel}</span>}
    </span>
  )
}

interface RiskLevelBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskLevelBadge({ level, className }: RiskLevelBadgeProps) {
  const config = riskConfig[level]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        config.bg,
        config.color,
        config.border,
        "border",
        className
      )}
    >
      <config.icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  )
}
