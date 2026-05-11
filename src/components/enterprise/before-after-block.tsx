import { cn } from "@/lib/utils"

interface BeforeAfterBlockProps {
  before: string[]
  after: string[]
  className?: string
}

export function BeforeAfterBlock({ before, after, className }: BeforeAfterBlockProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", className)}>
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-destructive">قبل</h3>
        <ul className="space-y-2">
          {before.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/50" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">بعد</h3>
        <ul className="space-y-2">
          {after.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
