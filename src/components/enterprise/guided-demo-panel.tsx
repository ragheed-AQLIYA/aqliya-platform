import { cn } from "@/lib/utils"

interface GuidedDemoPanelProps {
  title?: string
  questions: string[]
  className?: string
}

export function GuidedDemoPanel({ title = "دليل الاستعراض", questions, className }: GuidedDemoPanelProps) {
  return (
    <div className={cn("rounded-xl border bg-muted/30 p-4 sm:p-6", className)}>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h3>
      <ul className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-sm leading-6 text-foreground">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
