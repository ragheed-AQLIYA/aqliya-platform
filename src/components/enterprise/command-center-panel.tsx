import { cn } from "@/lib/utils"

interface CommandCenterPanelProps {
  className?: string
}

const layers = [
  { id: "workflows", label: "Workflows", status: "active", count: "مسارات" },
  { id: "data", label: "Data", status: "active", count: "بيانات" },
  { id: "rules", label: "Rules", status: "active", count: "قواعد" },
  { id: "outputs", label: "Outputs", status: "active", count: "مخرجات" },
  { id: "review", label: "Review", status: "active", count: "مراجعة" },
  { id: "decisions", label: "Decisions", status: "active", count: "قرارات" },
]

const metrics = [
  { label: "سير عمل مصمم", value: "✓" },
  { label: "مخرجات منظمة", value: "✓" },
  { label: "قرارات قابلة للتتبع", value: "✓" },
  { label: "أنظمة قابلة للتخصيص", value: "✓" },
]

export function CommandCenterPanel({ className }: CommandCenterPanelProps) {
  return (
    <div className={cn("relative w-full rounded-xl border border-white/10 bg-[#0B1728] p-4 sm:p-5 shadow-2xl", className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#137dc5] animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">AQLIYA Enterprise Systems</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#137dc5]" /> Active</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-white/20" /> Review</span>
        </div>
      </div>

      {/* Layers */}
      <div className="space-y-1.5">
        {layers.map((layer, i) => (
          <div key={layer.id} className="group relative flex items-center gap-2.5">
            {i > 0 && <div className="absolute -top-1.5 right-[0.85rem] h-1.5 w-px bg-gradient-to-b from-[#137dc5]/40 to-transparent" />}
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold transition-all",
              layer.status === "active"
                ? "bg-[#137dc5]/20 text-[#137dc5] border border-[#137dc5]/30"
                : "bg-white/5 text-white/30 border border-white/10"
            )}>
              {i + 1}
            </div>
            <div className="flex flex-1 items-center justify-between rounded-md border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs transition-all group-hover:border-[#137dc5]/30 group-hover:bg-[#137dc5]/5">
              <span className="font-medium text-white/80">{layer.label}</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-white/40">{layer.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center">
            <div className="text-base font-bold text-[#137dc5]">{m.value}</div>
            <div className="text-[9px] text-white/40">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
