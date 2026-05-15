"use client"

import type { ReactNode } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GovernanceTooltipProps {
  content: string
  children: ReactNode
}

function GovernanceTooltip({ content, children }: GovernanceTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-72">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export { GovernanceTooltip }
