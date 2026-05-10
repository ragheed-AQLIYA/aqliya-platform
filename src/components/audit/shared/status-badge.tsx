"use client"

import { cva, type VariantProps } from "class-variance-authority"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  FileText,
  ShieldCheck,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  draft: { color: "neutral", icon: Circle },
  setup: { color: "info", icon: Clock },
  in_progress: { color: "info", icon: Clock },
  under_review: { color: "warning", icon: Clock },
  awaiting_client: { color: "warning", icon: Clock },
  ready_for_approval: { color: "info", icon: CheckCircle2 },
  approved: { color: "success", icon: CheckCircle2 },
  published: { color: "success", icon: CheckCircle2 },
  archived: { color: "neutral", icon: FileText },
  missing: { color: "error", icon: XCircle },
  requested: { color: "warning", icon: Clock },
  uploaded: { color: "info", icon: FileText },
  linked: { color: "info", icon: FileText },
  reviewed: { color: "info", icon: FileText },
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
}

const colorClasses: Record<string, string> = {
  error: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
  warning: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
  success: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  info: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
  neutral: "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-700",
}

const typeMaps: Record<string, string[]> = {
  engagement: ["draft", "setup", "in_progress", "under_review", "awaiting_client", "ready_for_approval", "approved", "published", "archived"],
  evidence: ["missing", "requested", "uploaded", "linked", "reviewed", "accepted", "rejected"],
  finding: ["draft", "open", "in_review", "accepted", "resolved", "dismissed"],
  recommendation: ["suggested", "under_review", "accepted", "rejected", "implemented"],
  approval: ["not_ready", "ready", "pending_approval", "approved", "blocked"],
  publication: ["draft", "ready", "published", "locked"],
  generic: [],
}

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      size: {
        sm: "px-1.5 py-0.5 text-[10px] leading-none [&_svg]:size-2.5",
        md: "px-2 py-0.5 text-xs leading-none [&_svg]:size-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: string
  type?: keyof typeof typeMaps
  className?: string
}

function getStatusLabel(status: string): string {
  return status.replace(/_/g, " ")
}

function StatusBadge({ status, type = "generic", size, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() ?? ""
  const config = statusConfig[normalizedStatus] ?? { color: "neutral", icon: Circle }
  const colorClass = colorClasses[config.color]
  const Icon = type === "generic" ? Circle : config.icon

  return (
    <span className={cn(statusBadgeVariants({ size }), colorClass, className)}>
      <Icon className="shrink-0" />
      <span className="capitalize">{getStatusLabel(normalizedStatus)}</span>
    </span>
  )
}

export { StatusBadge, statusConfig, colorClasses, getStatusLabel }
