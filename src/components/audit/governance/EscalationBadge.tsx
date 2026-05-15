"use client"

import {
  ArrowUp,
  Ban,
  Eye,
  ShieldX,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { EscalationBadgeProps } from "./types"

export type { EscalationBadgeProps }

const levelConfig: Record<
  string,
  { label: string; container: string; icon: React.ElementType } | null
> = {
  none: null,
  notice: {
    label: "تنبيه",
    container:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
    icon: Eye,
  },
  review_required: {
    label: "مراجعة مطلوبة",
    container:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    icon: ArrowUp,
  },
  senior_review_required: {
    label: "مراجعة أول مطلوبة",
    container:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
    icon: ShieldX,
  },
  blocked: {
    label: "محظور",
    container:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    icon: Ban,
  },
}

function EscalationBadge({ level, reason, className }: EscalationBadgeProps) {
  const config = levelConfig[level]

  if (!config) return null

  const Icon = config.icon

  const badge = (
    <Badge
      variant="outline"
      className={cn(config.container, className)}
    >
      <Icon className="size-3" />
      <span>{config.label}</span>
    </Badge>
  )

  if (!reason) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-64">
        <p className="text-xs">{reason}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export { EscalationBadge }
