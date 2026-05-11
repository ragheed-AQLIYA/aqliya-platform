import { cn } from "@/lib/utils"

interface InsightCalloutProps {
  text: string
  type?: "info" | "success" | "warning"
  className?: string
}

export function InsightCallout({ text, type = "info", className }: InsightCalloutProps) {
  const colors = {
    info: "border-primary/20 bg-primary/5 text-primary",
    success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-700",
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-700",
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium", colors[type], className)}>
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </svg>
      {text}
    </div>
  )
}
