import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, TrendingUp, Brain } from "lucide-react"

interface WorkspaceStatusProps {
  module: "audit" | "sales" | "decision" | "platform"
  status: "healthy" | "warning" | "degraded" | "blocked"
  message?: string
  className?: string
}

const moduleIcons: Record<string, React.ElementType> = {
  audit: ShieldCheck,
  sales: TrendingUp,
  decision: Brain,
  platform: CheckCircle2,
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  healthy: {
    color: "text-status-success",
    bg: "bg-status-success/10",
    icon: CheckCircle2,
    label: "Operational",
  },
  warning: {
    color: "text-status-warning",
    bg: "bg-status-warning/10",
    icon: AlertCircle,
    label: "Attention Needed",
  },
  degraded: {
    color: "text-status-error",
    bg: "bg-status-error/10",
    icon: AlertCircle,
    label: "Degraded",
  },
  blocked: {
    color: "text-status-error",
    bg: "bg-status-error/20",
    icon: Clock,
    label: "Blocked",
  },
}

export function WorkspaceStatus({ module, status, message, className }: WorkspaceStatusProps) {
  const config = statusConfig[status]
  const ModuleIcon = moduleIcons[module]
  const StatusIcon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-2.5",
        config.bg,
        className
      )}
    >
      <ModuleIcon className={cn("h-4 w-4", config.color)} />
      <div className="flex items-center gap-2">
        <StatusIcon className={cn("h-3.5 w-3.5", config.color)} />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      {message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
    </div>
  )
}
