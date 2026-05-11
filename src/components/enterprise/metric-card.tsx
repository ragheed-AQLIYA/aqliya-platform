import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  suffix?: string
  className?: string
}

export function MetricCard({ label, value, suffix, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border bg-background p-4 text-center shadow-sm", className)}>
      <div className="text-2xl font-black tracking-tight text-primary">
        {value}{suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  )
}
