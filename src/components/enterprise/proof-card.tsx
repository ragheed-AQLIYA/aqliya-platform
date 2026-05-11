import { cn } from "@/lib/utils"

interface ProofCardProps {
  title: string
  description: string
  flow?: string[]
  metric?: { value: string; label: string }
  icon?: React.ReactNode
  className?: string
}

export function ProofCard({ title, description, flow, metric, icon, className }: ProofCardProps) {
  return (
    <div className={cn("group relative rounded-xl border bg-background p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md", className)}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/50 text-primary">
          {icon || (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          )}
        </div>
        {metric && (
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{metric.value}</div>
            <div className="text-[10px] text-muted-foreground">{metric.label}</div>
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>

      {/* Mini Flow */}
      {flow && flow.length > 0 && (
        <div className="mt-4 flex items-center gap-1.5 border-t pt-3">
          {flow.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {step}
              </span>
              {i < flow.length - 1 && (
                <svg className="h-2.5 w-2.5 text-muted-foreground/40 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
