import { cn } from "@/lib/utils"

interface DecisionMatrixVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const rows = [
  { alt: "Alternative A", risk: "Low", evidence: "Strong", score: 85 },
  { alt: "Alternative B", risk: "Medium", evidence: "Moderate", score: 62 },
  { alt: "Alternative C", risk: "High", evidence: "Weak", score: 34 },
]

export function DecisionMatrixVisual({ variant = "dark", className }: DecisionMatrixVisualProps) {
  const isDark = variant === "dark"
  const cellBg = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"
  const cellBorder = isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"
  const accentColor = "#137DC5"

  const riskColor = (risk: string) => {
    if (risk === "Low") return isDark ? "text-emerald-400" : "text-emerald-600"
    if (risk === "Medium") return isDark ? "text-amber-400" : "text-amber-600"
    return isDark ? "text-red-400" : "text-red-600"
  }

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Decision Matrix
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={cn("border-b", isDark ? "border-white/10" : "border-border")}>
              {["Alternative", "Risk", "Evidence", "Score"].map((h) => (
                <th key={h} className={cn("px-3 py-2 text-left font-semibold", isDark ? "text-white/50" : "text-muted-foreground")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={cn("border-b", isDark ? "border-white/5" : "border-border")}>
                <td className="px-3 py-2 font-medium" style={{ color: textPrimary }}>{row.alt}</td>
                <td className={cn("px-3 py-2 font-medium", riskColor(row.risk))}>{row.risk}</td>
                <td className="px-3 py-2" style={{ color: textSecondary }}>{row.evidence}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${row.score}%`, background: accentColor }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: accentColor }}>{row.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendation */}
      <div className={cn("mt-4 rounded-md px-3 py-2 flex items-center gap-2", isDark ? "bg-[#137DC5]/10 border border-[#137DC5]/20" : "bg-[#137DC5]/5 border border-[#137DC5]/15")}>
        <span className="h-2 w-2 rounded-full bg-[#137DC5]" />
        <span className="text-[10px] font-medium" style={{ color: accentColor }}>Recommendation: Alternative A — Highest score, lowest risk</span>
      </div>
    </div>
  )
}
