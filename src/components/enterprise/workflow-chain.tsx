import { cn } from "@/lib/utils"

interface WorkflowChainProps {
  steps: string[]
  className?: string
}

export function WorkflowChain({ steps, className }: WorkflowChainProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-md border bg-background px-3 py-2 text-xs font-medium leading-5 shadow-sm sm:px-4 sm:py-2.5 sm:text-sm">
            {step}
          </div>
          {i < steps.length - 1 && (
            <svg className="h-3 w-3 shrink-0 text-muted-foreground/50 rtl:rotate-180 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
