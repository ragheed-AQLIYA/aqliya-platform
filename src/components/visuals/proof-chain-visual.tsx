import { cn } from "@/lib/utils"

interface ProofChainVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const chain = [
  { label: "Source", sub: "المصدر", icon: "◆" },
  { label: "Logic", sub: "المنطق", icon: "◇" },
  { label: "Output", sub: "المخرج", icon: "●" },
  { label: "Evidence", sub: "الدليل", icon: "○" },
  { label: "Review", sub: "المراجعة", icon: "▲" },
  { label: "Decision", sub: "القرار", icon: "■" },
]

const statements = [
  "كل مخرج له مصدر.",
  "كل توصية لها سبب.",
  "كل مراجعة لها أثر.",
  "كل قرار له سجل.",
]

export function ProofChainVisual({ variant = "dark", className }: ProofChainVisualProps) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const accentColor = "#137DC5"

  return (
    <div className={cn("relative w-full rounded-xl border p-5 sm:p-8", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      {/* Chain */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
        {chain.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2 sm:gap-3">
            <div className={cn("rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-center", isDark ? "bg-white/[0.04] border border-white/10" : "bg-white border border-border")}>
              <div className="text-xs sm:text-sm font-semibold" style={{ color: textPrimary }}>{node.icon} {node.label}</div>
              <div className="text-[9px] sm:text-[10px]" style={{ color: textSecondary }}>{node.sub}</div>
            </div>
            {i < chain.length - 1 && (
              <svg className="h-3 w-3 shrink-0 rtl:rotate-180" style={{ color: isDark ? "rgba(19,125,197,0.3)" : "rgba(19,125,197,0.25)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Statements */}
      <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-5 border-t", isDark ? "border-white/10" : "border-border")}>
        {statements.map((s, i) => (
          <div key={i} className={cn("flex items-center gap-2 rounded-md px-3 py-2", isDark ? "bg-white/[0.03] border border-white/8" : "bg-white/60 border border-border")}>
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentColor }} />
            <span className="text-xs font-medium" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "text-muted-foreground" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
