import { cn } from "@/lib/utils"

interface CustomWorkflowBuilderVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const blocks = [
  { label: "Data Sources", sub: "مصادر البيانات", icon: "◆" },
  { label: "Workflow", sub: "سير العمل", icon: "◇" },
  { label: "Users", sub: "المستخدمون", icon: "●" },
  { label: "Permissions", sub: "الصلاحيات", icon: "▲" },
  { label: "Outputs", sub: "المخرجات", icon: "■" },
]

export function CustomWorkflowBuilderVisual({ variant = "dark", className }: CustomWorkflowBuilderVisualProps) {
  const isDark = variant === "dark"
  const nodeBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF"
  const nodeBorder = isDark ? "rgba(255,255,255,0.1)" : "#D7E2EA"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const accentColor = "#137DC5"
  const lineColor = isDark ? "rgba(19,125,197,0.25)" : "rgba(19,125,197,0.2)"

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Custom System Blueprint
      </div>

      {/* Main Blocks */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
        {blocks.map((block, i) => (
          <div key={block.label} className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-center" style={{ background: nodeBg, border: `1px solid ${nodeBorder}` }}>
              <div className="text-xs sm:text-sm font-semibold" style={{ color: textPrimary }}>{block.icon} {block.label}</div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: textSecondary }}>{block.sub}</div>
            </div>
            {i < blocks.length - 1 && (
              <svg className="h-3 w-3 shrink-0 rtl:rotate-180" style={{ color: lineColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Metrics */}
      <div className={cn("grid grid-cols-3 gap-2 pt-3 border-t", isDark ? "border-white/10" : "border-border")}>
        {[
          { label: "Custom Pages", value: "✓" },
          { label: "Role-based Access", value: "✓" },
          { label: "Scalable", value: "✓" },
        ].map((m) => (
          <div key={m.label} className="rounded-md px-2.5 py-2 text-center" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-sm font-bold" style={{ color: accentColor }}>{m.value}</div>
            <div className="text-[9px]" style={{ color: textSecondary }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
