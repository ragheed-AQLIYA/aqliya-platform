import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductProofCardProps {
  title: string
  problem: string
  system: string
  output: string
  flow: string[]
  href: string
  note?: string
  className?: string
}

export function ProductProofCard({ title, problem, system, output, flow, href, note, className }: ProductProofCardProps) {
  return (
    <Link href={href} className={cn("group flex flex-col rounded-xl border border-border bg-background shadow-sm transition-all hover:border-primary/30 hover:shadow-lg", className)}>
      {/* Header */}
      <div className="border-b bg-muted/20 px-5 py-4">
        <h3 className="text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary">{title}</h3>
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
        {/* Problem */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/70">المشكلة</span>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{problem}</p>
        </div>

        {/* System */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">النظام</span>
          <p className="mt-1 text-sm leading-6 text-foreground">{system}</p>
        </div>

        {/* Output */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">المخرج</span>
          <p className="mt-1 text-sm leading-6 text-foreground">{output}</p>
        </div>

        {/* Flow */}
        <div className="mt-auto flex flex-wrap items-center gap-1 border-t pt-3">
          {flow.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {step}
              </span>
              {i < flow.length - 1 && (
                <svg className="h-2 w-2 text-muted-foreground/40 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Optional Note */}
        {note && (
          <p className="border-t pt-3 text-xs leading-6 text-muted-foreground/80">{note}</p>
        )}
      </div>
    </Link>
  )
}
