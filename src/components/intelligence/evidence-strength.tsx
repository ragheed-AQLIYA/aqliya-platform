import { cn } from "@/lib/utils"
import { FileText, FolderOpen, CheckCircle2, AlertCircle, Shield } from "lucide-react"

export type EvidenceStrength = "none" | "weak" | "partial" | "strong" | "complete"

interface EvidenceStrengthProps {
  strength: EvidenceStrength
  label?: string
  count?: number
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const evidenceConfig: Record<EvidenceStrength, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  none: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    icon: FileText,
    label: "No Evidence",
  },
  weak: {
    color: "text-status-error",
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    icon: AlertCircle,
    label: "Weak Evidence",
  },
  partial: {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    icon: FolderOpen,
    label: "Partial Evidence",
  },
  strong: {
    color: "text-aqliya-blue",
    bg: "bg-aqliya-blue/10",
    border: "border-aqliya-blue/20",
    icon: Shield,
    label: "Strong Evidence",
  },
  complete: {
    color: "text-status-success",
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    icon: CheckCircle2,
    label: "Complete",
  },
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
  lg: "px-3 py-1.5 gap-2 text-sm [&_svg]:size-4",
}

export function EvidenceStrength({
  strength,
  label,
  count,
  showIcon = true,
  size = "md",
  className,
}: EvidenceStrengthProps) {
  const config = evidenceConfig[strength]
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
      {count !== undefined && (
        <span className="font-mono text-muted-foreground">({count})</span>
      )}
    </span>
  )
}
