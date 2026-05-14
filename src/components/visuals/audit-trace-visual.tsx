import { cn } from "@/lib/utils"

interface AuditTraceVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const chain = [
  { label: "Source Data", sub: "البيانات المصدر", icon: "◆", status: "confirmed" },
  { label: "Classification", sub: "التصنيف", icon: "◇", status: "confirmed" },
  { label: "Output", sub: "المخرجات", icon: "●", status: "generated" },
  { label: "Evidence", sub: "الأدلة", icon: "○", status: "linked" },
  { label: "Review", sub: "المراجعة", icon: "▲", status: "pending" },
]

export function AuditTraceVisual({ variant = "dark", className }: AuditTraceVisualProps) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const accentColor = "#137DC5"

  const statusColor = (status: string) => {
    if (status === "confirmed") return isDark ? "text-emerald-400" : "text-emerald-600"
    if (status === "generated") return isDark ? "text-blue-400" : "text-blue-600"
    if (status === "linked") return isDark ? "text-amber-400" : "text-amber-600"
    return isDark ? "text-white/30" : "text-muted-foreground"
  }

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Audit Traceability Chain
      </div>

      {/* Chain */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {chain.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2 sm:gap-3">
            <div className={cn("rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-center", isDark ? "bg-white/[0.03] border border-white/8" : "bg-white border border-border")}>
              <div className="text-xs sm:text-sm font-semibold" style={{ color: textPrimary }}>{node.icon} {node.label}</div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: textSecondary }}>{node.sub}</div>
              <div className={cn("text-[8px] font-medium mt-0.5", statusColor(node.status))}>{node.status}</div>
            </div>
            {i < chain.length - 1 && (
              <svg className="h-3 w-3 shrink-0 rtl:rotate-180" style={{ color: isDark ? "rgba(19,125,197,0.25)" : "rgba(19,125,197,0.2)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className={cn("grid grid-cols-3 gap-2 pt-3 border-t", isDark ? "border-white/10" : "border-border")}>
        {[
          { label: "Accounts", value: "22" },
          { label: "Mapped", value: "21/22" },
          { label: "Evidence", value: "6 linked" },
        ].map((m) => (
          <div key={m.label} className={cn("rounded-md px-2.5 py-2 text-center", isDark ? "bg-white/[0.03]" : "bg-muted/30")}>
            <div className="text-sm font-bold" style={{ color: accentColor }}>{m.value}</div>
            <div className="text-[9px]" style={{ color: textSecondary }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
