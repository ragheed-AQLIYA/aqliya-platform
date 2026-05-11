import { cn } from "@/lib/utils"

interface OperatingLayer {
  label: string
  color?: string
}

interface AqliyaOperatingMapProps {
  mainLayers?: OperatingLayer[]
  supportingPaths?: string[]
  className?: string
}

const defaultLayers: OperatingLayer[] = [
  { label: "مصادر البيانات" },
  { label: "طبقة سير العمل" },
  { label: "طبقة الذكاء المؤسسي" },
  { label: "طبقة المراجعة" },
  { label: "طبقة القرار" },
  { label: "المخرجات" },
]

const defaultSupporting = ["أدلة", "محاكاة", "تتبع", "اعتماد", "تقارير"]

export function AqliyaOperatingMap({ mainLayers = defaultLayers, supportingPaths = defaultSupporting, className }: AqliyaOperatingMapProps) {
  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
      {/* Operating Grid Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="rounded-xl border bg-background/80 p-6 shadow-lg backdrop-blur sm:p-8">
        <div className="space-y-3">
          {mainLayers.map((layer, i) => (
            <div key={i} className="relative flex items-center gap-4">
              {/* Traceability Line */}
              {i > 0 && (
                <div className="absolute -top-3 right-6 h-3 w-px bg-border" />
              )}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-bold text-muted-foreground">
                {i + 1}
              </div>
              <div className="flex-1 rounded-lg border bg-gradient-to-r from-background to-muted/30 px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
                {layer.label}
              </div>
            </div>
          ))}
        </div>

        {/* Supporting Paths */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t pt-4">
          {supportingPaths.map((path, i) => (
            <span key={i} className="rounded-full border border-dashed bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {path}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
