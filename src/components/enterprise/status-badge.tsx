import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Circle,
  ShieldCheck,
  Lock,
} from "lucide-react"

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  draft: { color: "neutral", icon: Circle },
  setup: { color: "info", icon: Clock },
  in_progress: { color: "info", icon: Clock },
  under_review: { color: "warning", icon: Clock },
  awaiting_client: { color: "warning", icon: Clock },
  ready_for_approval: { color: "info", icon: CheckCircle2 },
  approved: { color: "success", icon: CheckCircle2 },
  published: { color: "success", icon: CheckCircle2 },
  archived: { color: "neutral", icon: Circle },
  missing: { color: "error", icon: XCircle },
  requested: { color: "warning", icon: Clock },
  uploaded: { color: "info", icon: Circle },
  linked: { color: "info", icon: Circle },
  reviewed: { color: "info", icon: CheckCircle2 },
  accepted: { color: "success", icon: CheckCircle2 },
  rejected: { color: "error", icon: XCircle },
  open: { color: "info", icon: AlertCircle },
  in_review: { color: "warning", icon: Clock },
  resolved: { color: "success", icon: CheckCircle2 },
  dismissed: { color: "neutral", icon: XCircle },
  suggested: { color: "info", icon: Clock },
  implemented: { color: "success", icon: CheckCircle2 },
  not_ready: { color: "neutral", icon: Circle },
  ready: { color: "info", icon: CheckCircle2 },
  pending_approval: { color: "warning", icon: Clock },
  blocked: { color: "error", icon: Lock },
  locked: { color: "error", icon: Lock },
  not_started: { color: "neutral", icon: Circle },
  changes_requested: { color: "warning", icon: AlertCircle },
  active: { color: "success", icon: CheckCircle2 },
  inactive: { color: "neutral", icon: Circle },
  completed: { color: "success", icon: ShieldCheck },
  failed: { color: "error", icon: XCircle },
  pending: { color: "warning", icon: Clock },
}

const colorClasses: Record<string, string> = {
  error: "text-status-error bg-status-error/10 border-status-error/20",
  warning: "text-status-warning bg-status-warning/10 border-status-warning/20",
  success: "text-status-success bg-status-success/10 border-status-success/20",
  info: "text-aqliya-blue bg-aqliya-blue/10 border-aqliya-blue/20",
  neutral: "text-muted-foreground bg-muted border-border",
}

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      size: {
        sm: "px-1.5 py-0.5 text-[10px] leading-none [&_svg]:size-2.5",
        md: "px-2.5 py-1 text-xs leading-none [&_svg]:size-3",
        lg: "px-3 py-1.5 text-sm leading-none [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: string
  className?: string
  showIcon?: boolean
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: "In Progress",
    under_review: "Under Review",
    awaiting_client: "Awaiting Client",
    ready_for_approval: "Ready for Approval",
    pending_approval: "Pending Approval",
    not_started: "Not Started",
    changes_requested: "Changes Requested",
  }
  return labels[status] ?? status.replace(/_/g, " ")
}

function StatusBadge({ status, size, className, showIcon = true }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() ?? ""
  const config = statusConfig[normalizedStatus] ?? { color: "neutral", icon: Circle }
  const colorClass = colorClasses[config.color]
  const Icon = config.icon

  return (
    <span className={cn(statusBadgeVariants({ size }), colorClass, className)}>
      {showIcon && <Icon className="shrink-0" />}
      <span className="capitalize">{getStatusLabel(normalizedStatus)}</span>
    </span>
  )
}

export { StatusBadge, statusConfig, colorClasses, getStatusLabel }
