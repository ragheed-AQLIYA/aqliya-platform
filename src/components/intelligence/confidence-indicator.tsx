import { cn } from "@/lib/utils"
import { Sparkles, Zap, Target, AlertCircle } from "lucide-react"

export type ConfidenceLevel = "very-low" | "low" | "medium" | "high" | "very-high"

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel
  value?: number
  label?: string
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const confidenceConfig: Record<ConfidenceLevel, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  "very-low": {
    color: "text-status-error",
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    icon: AlertCircle,
    label: "Very Low Confidence",
  },
  low: {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: AlertCircle,
    label: "Low Confidence",
  },
  medium: {
    color: "text-aqliya-cyan",
    bg: "bg-aqliya-cyan/10",
    border: "border-aqliya-cyan/20",
    icon: Target,
    label: "Medium Confidence",
  },
  high: {
    color: "text-aqliya-blue",
    bg: "bg-aqliya-blue/10",
    border: "border-aqliya-blue/20",
    icon: Zap,
    label: "High Confidence",
  },
  "very-high": {
    color: "text-status-success",
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    icon: Sparkles,
    label: "Very High Confidence",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
  lg: "px-3 py-1.5 gap-2 text-sm [&_svg]:size-4",
}

export function ConfidenceIndicator({
  level,
  value,
  label,
  showValue = true,
  size = "md",
  className,
}: ConfidenceIndicatorProps) {
  const config = confidenceConfig[level]
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
      <Icon className="shrink-0" />
      <span>{displayLabel}</span>
      {showValue && value !== undefined && (
        <span className="font-mono">{Math.round(value * 100)}%</span>
      )}
    </span>
  )
}

export function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 90) return "very-high"
  if (score >= 75) return "high"
  if (score >= 50) return "medium"
  if (score >= 25) return "low"
  return "very-low"
}
