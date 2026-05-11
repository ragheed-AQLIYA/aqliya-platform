import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductLineCardProps {
  title: string
  description: string
  href: string
  workflow?: string[]
  className?: string
}

export function ProductLineCard({ title, description, href, workflow, className }: ProductLineCardProps) {
  return (
    <Link href={href} className={cn("group flex flex-col rounded-xl border bg-background p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{title}</h3>
        <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </div>
      <p className="mb-4 text-sm leading-6 text-muted-foreground">{description}</p>
      {workflow && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {workflow.slice(0, 3).map((step, i) => (
            <span key={i} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {step}
            </span>
          ))}
          {workflow.length > 3 && (
            <span className="rounded-md border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{workflow.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
