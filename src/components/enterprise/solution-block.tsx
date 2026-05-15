import Link from "next/link"
import { cn } from "@/lib/utils"

interface SolutionBlockProps {
  title: string
  problem: string
  system: string
  output: string
  flow: string[]
  href: string
  variant?: "light" | "dark"
  className?: string
}

export function SolutionBlock({ title, problem, system, output, flow, href, variant = "light", className }: SolutionBlockProps) {
  const isDark = variant === "dark"

  return (
    <section className={cn("border-t", isDark ? "bg-[#0B1728] border-white/5" : "bg-background", className)}>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className={cn("rounded-xl border p-6 sm:p-8", isDark ? "border-white/10 bg-white/[0.03]" : "border-border bg-muted/10")}>
          {/* Header */}
          <h2 className={cn("text-xl font-black sm:text-2xl", isDark ? "text-white" : "text-foreground")}>{title}</h2>

          {/* Content Grid */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Problem */}
            <div>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-red-400/70" : "text-destructive/70")}>المشكلة</span>
              <p className={cn("mt-2 text-sm leading-6", isDark ? "text-white/60" : "text-muted-foreground")}>{problem}</p>
            </div>

            {/* System */}
            <div>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-[#137dc5]" : "text-primary")}>النظام</span>
              <p className={cn("mt-2 text-sm leading-6", isDark ? "text-white/70" : "text-foreground")}>{system}</p>
            </div>

            {/* Output */}
            <div>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-emerald-400/70" : "text-emerald-600/70")}>المخرج</span>
              <p className={cn("mt-2 text-sm leading-6", isDark ? "text-white/70" : "text-foreground")}>{output}</p>
            </div>

            {/* Flow */}
            <div>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDark ? "text-white/40" : "text-muted-foreground")}>المسار</span>
              <div className="mt-2 flex flex-wrap gap-1">
                {flow.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", isDark ? "bg-white/5 text-white/50" : "bg-muted/60 text-muted-foreground")}>
                      {step}
                    </span>
                    {i < flow.length - 1 && (
                      <svg className={cn("h-2 w-2 rtl:rotate-180", isDark ? "text-white/20" : "text-muted-foreground/40")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 pt-4 border-t border-dashed">
            <Link
              href={href}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors",
                isDark
                  ? "bg-[#137dc5] text-white hover:bg-[#137dc5]/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              اطلب تخصيص هذا النظام
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
