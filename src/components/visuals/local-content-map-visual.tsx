import { cn } from "@/lib/utils"

interface LocalContentMapVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const nodes = [
  { label: "Suppliers", sub: "الموردون", value: "48", icon: "◆" },
  { label: "Spend", sub: "الإنفاق", value: "SAR 12M", icon: "◇" },
  { label: "Classification", sub: "التصنيف", value: "A/B/C", icon: "●" },
  { label: "Compliance", sub: "الالتزام", value: "73%", icon: "▲" },
  { label: "Indicators", sub: "المؤشرات", value: "8 KPIs", icon: "■" },
]

export function LocalContentMapVisual({ variant = "dark", className }: LocalContentMapVisualProps) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const accentColor = "#137DC5"

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Local Content Compliance Map
      </div>

      {/* Nodes */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2 sm:gap-3">
            <div className={cn("rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-center", isDark ? "bg-white/[0.03] border border-white/8" : "bg-white border border-border")}>
              <div className="text-xs sm:text-sm font-semibold" style={{ color: textPrimary }}>{node.icon} {node.label}</div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: textSecondary }}>{node.sub}</div>
              <div className="text-[10px] font-bold mt-0.5" style={{ color: accentColor }}>{node.value}</div>
            </div>
            {i < nodes.length - 1 && (
              <svg className="h-3 w-3 shrink-0 rtl:rotate-180" style={{ color: isDark ? "rgba(19,125,197,0.25)" : "rgba(19,125,197,0.2)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Compliance Gap */}
      <div className={cn("rounded-md px-3 py-2 border-t pt-3", isDark ? "border-white/10" : "border-border")}>
        <div className={cn("text-[10px] font-semibold mb-1", isDark ? "text-white/40" : "text-muted-foreground")}>Compliance Gap</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}>
            <div className="h-2 rounded-full" style={{ width: "73%", background: accentColor }} />
          </div>
          <span className="text-xs font-bold" style={{ color: accentColor }}>73%</span>
        </div>
      </div>
    </div>
  )
}
