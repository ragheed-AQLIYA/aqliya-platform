import { cn } from "@/lib/utils"

interface TraceabilityChainProps {
  steps: string[]
  className?: string
}

export function TraceabilityChain({ steps, className }: TraceabilityChainProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary text-xs font-bold text-primary-foreground">
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className="h-6 w-px bg-border" />}
          </div>
          <div className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm font-medium shadow-sm">
            {step}
          </div>
        </div>
      ))}
    </div>
  )
}
