"use client"

import { CircleAlert, CircleCheck, CircleMinus, CircleHelp, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EvidenceStatusBadgeProps } from "./types"

export type { EvidenceStatusBadgeProps }

const statusStyles: Record<
  string,
  { container: string; icon: React.ElementType }
> = {
  sufficient: {
    container:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    icon: CircleCheck,
  },
  partial: {
    container:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    icon: CircleHelp,
  },
  missing: {
    container:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    icon: CircleAlert,
  },
  conflicting: {
    container:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
    icon: CircleMinus,
  },
  weak: {
    container:
      "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
    icon: Minus,
  },
}

const defaultLabels: Record<string, string> = {
  sufficient: "Sufficient",
  partial: "Partial",
  missing: "Missing",
  conflicting: "Conflicting",
  weak: "Weak",
}

function EvidenceStatusBadge({ status, label, className }: EvidenceStatusBadgeProps) {
  const style = statusStyles[status] ?? statusStyles.weak
  const Icon = style.icon

  return (
    <Badge
      variant="outline"
      className={cn(style.container, className)}
    >
      <Icon className="size-3" />
      <span>{label ?? defaultLabels[status]}</span>
    </Badge>
  )
}

export { EvidenceStatusBadge }
