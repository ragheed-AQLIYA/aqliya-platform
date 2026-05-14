import { cn } from "@/lib/utils"

interface SalesPipelineVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const stages = [
  { label: "ICP", sub: "العميل المثالي", count: 120, color: "#137DC5" },
  { label: "Qualified", sub: "مؤهل", count: 68, color: "#2F4598" },
  { label: "Prioritized", sub: "الأولوية", count: 34, color: "#0BAEE8" },
  { label: "Outreach", sub: "التواصل", count: 22, color: "#63C9ED" },
  { label: "Follow-up", sub: "المتابعة", count: 12, color: "#0F4F7A" },
  { label: "Converted", sub: "تحويل", count: 6, color: "#137DC5" },
]

export function SalesPipelineVisual({ variant = "dark", className }: SalesPipelineVisualProps) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const maxCount = Math.max(...stages.map((s) => s.count))

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Sales Pipeline Funnel
      </div>

      {/* Funnel */}
      <div className="space-y-2 mb-4">
        {stages.map((stage, i) => {
          const width = (stage.count / maxCount) * 100
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <div className="w-20 text-right">
                <div className="text-xs font-semibold" style={{ color: textPrimary }}>{stage.label}</div>
                <div className="text-[9px]" style={{ color: textSecondary }}>{stage.sub}</div>
              </div>
              <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                <div className="h-full rounded-sm transition-all" style={{ width: `${width}%`, background: stage.color, opacity: 0.7 }} />
              </div>
              <div className="w-8 text-xs font-bold" style={{ color: textPrimary }}>{stage.count}</div>
            </div>
          )
        })}
      </div>

      {/* Learning */}
      <div className={cn("rounded-md px-3 py-2 border-t pt-3", isDark ? "border-white/10" : "border-border")}>
        <div className={cn("text-[10px] font-semibold mb-1", isDark ? "text-white/40" : "text-muted-foreground")}>Learning Rate</div>
        <div className="text-sm font-bold" style={{ color: "#137DC5" }}>5% conversion · Improving weekly</div>
      </div>
    </div>
  )
}
