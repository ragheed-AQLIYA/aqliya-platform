import { cn } from "@/lib/utils"

interface AqliyaOperatingMapProps {
  className?: string
}

const layers = [
  { id: "data", label: "مصادر البيانات", icon: "◆", status: "active", metrics: "12 مصدر" },
  { id: "workflow", label: "طبقة سير العمل", icon: "◇", status: "active", metrics: "8 مسارات" },
  { id: "intelligence", label: "طبقة الذكاء المؤسسي", icon: "●", status: "active", metrics: "5 نماذج" },
  { id: "review", label: "طبقة المراجعة", icon: "○", status: "active", metrics: "3 نقاط" },
  { id: "decision", label: "طبقة القرار", icon: "▲", status: "active", metrics: "2 مخرجات" },
  { id: "outputs", label: "المخرجات", icon: "■", status: "active", metrics: "6 تقارير" },
]

const supportingPaths = [
  { label: "أدلة", icon: "⬡" },
  { label: "محاكاة", icon: "◈" },
  { label: "تتبع", icon: "◇" },
  { label: "اعتماد", icon: "✓" },
  { label: "تقارير", icon: "▤" },
]

export function AqliyaOperatingMap({ className }: AqliyaOperatingMapProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Grid Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="rounded-xl border bg-gradient-to-b from-background to-muted/20 p-4 shadow-xl backdrop-blur sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AQLIYA Operating System</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> نشط</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" /> قيد المراجعة</span>
          </div>
        </div>

        {/* Layers */}
        <div className="space-y-2">
          {layers.map((layer, i) => (
            <div key={layer.id} className="group relative flex items-center gap-3">
              {/* Connection Line */}
              {i > 0 && (
                <div className="absolute -top-2 right-[1.35rem] h-2 w-px bg-gradient-to-b from-primary/30 to-primary/10" />
              )}

              {/* Status Indicator */}
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-all",
                layer.status === "active"
                  ? "border-primary/30 bg-primary/10 text-primary group-hover:bg-primary/20"
                  : "border-muted bg-muted/50 text-muted-foreground"
              )}>
                {layer.icon}
              </div>

              {/* Layer Panel */}
              <div className={cn(
                "flex flex-1 items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all",
                "bg-gradient-to-r from-background to-muted/20",
                "group-hover:border-primary/30 group-hover:bg-primary/[0.03] group-hover:shadow-sm"
              )}>
                <span className="font-medium">{layer.label}</span>
                <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {layer.metrics}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting Paths */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t pt-4">
          {supportingPaths.map((path, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-dashed bg-muted/30 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <span>{path.icon}</span>
              {path.label}
            </span>
          ))}
        </div>

        {/* Bottom Metrics Row */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
          <div className="rounded-md bg-muted/30 px-3 py-2 text-center">
            <div className="text-lg font-bold text-primary">22</div>
            <div className="text-[10px] text-muted-foreground">حساب مصنف</div>
          </div>
          <div className="rounded-md bg-muted/30 px-3 py-2 text-center">
            <div className="text-lg font-bold text-primary">16</div>
            <div className="text-[10px] text-muted-foreground">حدث تتبع</div>
          </div>
          <div className="rounded-md bg-muted/30 px-3 py-2 text-center">
            <div className="text-lg font-bold text-primary">21/22</div>
            <div className="text-[10px] text-muted-foreground">mapping confirmed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
