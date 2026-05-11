import { cn } from "@/lib/utils"

interface CommandCenterPanelProps {
  title: string
  status?: "active" | "pending" | "completed"
  children: React.ReactNode
  className?: string
}

export function CommandCenterPanel({ title, status = "active", children, className }: CommandCenterPanelProps) {
  const statusColors = {
    active: "bg-primary",
    pending: "bg-muted-foreground",
    completed: "bg-emerald-500",
  }

  return (
    <div className={cn("rounded-xl border bg-background p-4 shadow-sm sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className={cn("h-2 w-2 rounded-full", statusColors[status])} />
      </div>
      {children}
    </div>
  )
}
