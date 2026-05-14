import { cn } from "@/lib/utils"

interface SimulationScenarioVisualProps {
  variant?: "light" | "dark"
  className?: string
}

const scenarios = [
  { name: "Scenario A", impact: "+12%", cost: "-5%", risk: "Low", color: "#137DC5" },
  { name: "Scenario B", impact: "+8%", cost: "-12%", risk: "Medium", color: "#2F4598" },
  { name: "Scenario C", impact: "-3%", cost: "+15%", risk: "High", color: "#0BAEE8" },
]

export function SimulationScenarioVisual({ variant = "dark", className }: SimulationScenarioVisualProps) {
  const isDark = variant === "dark"
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "#0F172A"
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#64748B"

  return (
    <div className={cn("relative w-full rounded-xl border p-4 sm:p-6", isDark ? "border-white/10 bg-[#0B1728]" : "border-border bg-muted/10", className)}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] mb-4", isDark ? "text-white/50" : "text-muted-foreground")}>
        Scenario Comparison
      </div>

      {/* Scenario Bars */}
      <div className="space-y-3 mb-4">
        {scenarios.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <div className="w-20 text-xs font-semibold" style={{ color: textPrimary }}>{s.name}</div>
            <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
              <div className="h-full rounded-md flex items-center px-2" style={{ width: s.impact.startsWith("+") ? "70%" : "30%", background: s.color, opacity: 0.8 }}>
                <span className="text-[10px] font-bold text-white">{s.impact} impact</span>
              </div>
            </div>
            <div className="w-16 text-[10px] text-right" style={{ color: textSecondary }}>{s.cost}</div>
            <div className={cn("w-14 text-[10px] font-medium text-right", s.risk === "Low" ? "text-emerald-500" : s.risk === "Medium" ? "text-amber-500" : "text-red-500")}>
              {s.risk}
            </div>
          </div>
        ))}
      </div>

      {/* Assumptions */}
      <div className={cn("rounded-md px-3 py-2 border-t pt-3", isDark ? "border-white/10" : "border-border")}>
        <div className={cn("text-[10px] font-semibold mb-1", isDark ? "text-white/40" : "text-muted-foreground")}>Assumptions</div>
        <div className="flex flex-wrap gap-1.5">
          {["Market growth +5%", "Cost baseline", "Risk tolerance: Medium"].map((a) => (
            <span key={a} className={cn("rounded px-1.5 py-0.5 text-[9px]", isDark ? "bg-white/5 text-white/40" : "bg-muted/60 text-muted-foreground")}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
