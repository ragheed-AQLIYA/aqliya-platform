import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductLineCardProps {
  title: string
  description: string
  href: string
  workflow?: string[]
  visualType?: "workflow" | "decision" | "simulation" | "sales" | "audit" | "local-content"
  className?: string
}

function MiniVisual({ type }: { type: string }) {
  switch (type) {
    case "workflow":
      return (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={cn("h-6 w-6 rounded", i === 0 ? "bg-primary/80" : i === 1 ? "bg-primary/60" : i === 2 ? "bg-primary/40" : "bg-primary/20")} />
              {i < 3 && <div className="h-px w-3 bg-primary/30" />}
            </div>
          ))}
        </div>
      )
    case "decision":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-4 rounded-sm", i < 2 ? "bg-primary/80" : i < 4 ? "bg-primary/50" : "bg-primary/25")} />
          ))}
        </div>
      )
    case "simulation":
      return (
        <div className="flex items-end gap-1 h-8">
          {[3, 5, 2, 6, 4].map((h, i) => (
            <div key={i} className={cn("w-3 rounded-t", i === 3 ? "bg-primary/80" : i === 1 ? "bg-primary/60" : i === 4 ? "bg-primary/40" : "bg-primary/25")} style={{ height: `${h * 4}px` }} />
          ))}
        </div>
      )
    case "sales":
      return (
        <div className="flex flex-col items-center gap-0.5">
          {[5, 4, 3, 2].map((w, i) => (
            <div key={i} className={cn("h-2 rounded", i === 0 ? "bg-primary/80 w-12" : i === 1 ? "bg-primary/60 w-9" : i === 2 ? "bg-primary/40 w-6" : "bg-primary/25 w-3")} />
          ))}
        </div>
      )
    case "audit":
      return (
        <div className="flex items-center gap-1">
          {["bg-primary/80", "bg-primary/60", "bg-primary/40", "bg-primary/25"].map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={cn("h-3 w-3 rounded-full", c)} />
              {i < 3 && <div className="h-px w-2 bg-primary/30" />}
            </div>
          ))}
        </div>
      )
    case "local-content":
      return (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("h-4 rounded-sm", i === 0 ? "bg-primary/80" : i === 1 ? "bg-primary/60" : i === 2 ? "bg-primary/40" : "bg-primary/25")} />
          ))}
        </div>
      )
    default:
      return null
  }
}

export function ProductLineCard({ title, description, href, workflow, visualType, className }: ProductLineCardProps) {
  return (
    <Link href={href} className={cn("group flex flex-col rounded-xl border bg-background shadow-sm transition-all hover:border-primary/30 hover:shadow-lg", className)}>
      {/* Mini Visual Header */}
      <div className="border-b bg-muted/20 px-5 py-3">
        <MiniVisual type={visualType || "workflow"} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{title}</h3>
          <svg className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </div>
    </Link>
  )
}
