import { cn } from "@/lib/utils"

interface ProductWorkflowVisualProps {
  title: string
  steps: string[]
  className?: string
}

export function ProductWorkflowVisual({ title, steps, className }: ProductWorkflowVisualProps) {
  return (
    <div className={cn("rounded-xl border bg-background p-6 shadow-sm", className)}>
      <h3 className="mb-6 text-center text-lg font-semibold">{title}</h3>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg border bg-gradient-to-b from-background to-muted/30 px-3 py-2 text-sm font-medium shadow-sm sm:px-4 sm:py-2.5">
              {step}
            </div>
            {i < steps.length - 1 && (
              <svg className="h-4 w-4 shrink-0 text-muted-foreground/50 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
