import { cn } from "@/lib/utils"

interface OutputCardProps {
  title: string
  items: string[]
  className?: string
}

export function OutputCard({ title, items, className }: OutputCardProps) {
  return (
    <div className={cn("rounded-xl border bg-background p-6 shadow-sm", className)}>
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
