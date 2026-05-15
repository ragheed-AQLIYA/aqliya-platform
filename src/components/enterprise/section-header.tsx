import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  module?: "audit" | "sales" | "decision" | "platform"
}

const moduleAccents: Record<string, string> = {
  audit: "bg-module-audit",
  sales: "bg-module-sales",
  decision: "bg-module-decision",
  platform: "bg-primary",
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  module = "platform",
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-1.5 rounded-full", moduleAccents[module])} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
