import { cn } from "@/lib/utils"
import { FileText, ShieldCheck, TrendingUp, Brain, Users, FolderOpen } from "lucide-react"

export type EntityIconType = "decision" | "engagement" | "deal" | "client" | "evidence" | "organization" | "default"

interface EntityIconProps {
  type: EntityIconType
  size?: "sm" | "md" | "lg"
  className?: string
}

const iconMap: Record<EntityIconType, React.ElementType> = {
  decision: Brain,
  engagement: ShieldCheck,
  deal: TrendingUp,
  client: Users,
  evidence: FolderOpen,
  organization: FileText,
  default: FileText,
}

const colorMap: Record<EntityIconType, string> = {
  decision: "text-module-decision",
  engagement: "text-module-audit",
  deal: "text-module-sales",
  client: "text-muted-foreground",
  evidence: "text-aqliya-cyan",
  organization: "text-muted-foreground",
  default: "text-muted-foreground",
}

const sizeMap: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function EntityIcon({ type, size = "md", className }: EntityIconProps) {
  const Icon = iconMap[type] || iconMap.default
  const color = colorMap[type] || colorMap.default
  const sizeClass = sizeMap[size]

  return <Icon className={cn(color, sizeClass, className)} />
}

interface EntityBadgeProps {
  type: EntityIconType
  label: string
  size?: "sm" | "md"
  className?: string
}

const badgeSizeMap: Record<string, string> = {
  sm: "px-1.5 py-0.5 gap-1 text-[10px] [&_svg]:size-2.5",
  md: "px-2.5 py-1 gap-1.5 text-xs [&_svg]:size-3",
}

export function EntityBadge({ type, label, size = "md", className }: EntityBadgeProps) {
  const Icon = iconMap[type] || iconMap.default
  const color = colorMap[type] || colorMap.default

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-muted/50 font-medium",
        badgeSizeMap[size],
        className
      )}
    >
      <Icon className={cn("shrink-0", color)} />
      <span>{label}</span>
    </span>
  )
}
