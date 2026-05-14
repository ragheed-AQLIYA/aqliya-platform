import { cn } from "@/lib/utils"

interface SystemBlueprintPanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  variant?: "light" | "dark"
  className?: string
}

export function SystemBlueprintPanel({ title, subtitle, children, variant = "dark", className }: SystemBlueprintPanelProps) {
  const isDark = variant === "dark"

  return (
    <div className={cn("relative w-full rounded-xl border p-5 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-4 pb-3 border-b", isDark ? "border-white/10" : "border-border")}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#137DC5] animate-pulse" />
          <span className={cn("text-[10px] font-semibold uppercase tracking-[0.15em]", isDark ? "text-white/50" : "text-muted-foreground")}>
            {title}
          </span>
        </div>
        {subtitle && (
          <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-muted-foreground/60")}>{subtitle}</span>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
