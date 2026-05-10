"use client"

import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiBadgeProps {
  type?: "suggested" | "assisted" | "generated"
  size?: "sm" | "md"
  showDetails?: boolean
  modelVersion?: string
  confidence?: number
  className?: string
}

function AiBadge({
  type = "suggested",
  size = "md",
  showDetails = false,
  modelVersion,
  confidence,
  className,
}: AiBadgeProps) {
  const labels: Record<string, string> = {
    suggested: "AI Suggested",
    assisted: "AI Assisted",
    generated: "AI Generated",
  }

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 [&_svg]:size-2.5",
    md: "text-xs px-2 py-0.5 gap-1.5 [&_svg]:size-3",
  }

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-purple-200 bg-purple-50 font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
          sizeClasses[size]
        )}
      >
        <Bot className="shrink-0" />
        <span>{labels[type]}</span>
      </span>
      {showDetails && (modelVersion || confidence !== undefined) && (
        <span
          className={cn(
            "absolute top-full left-0 mt-1 z-10 rounded-md border border-purple-200 bg-white px-2 py-1 text-[10px] text-purple-600 shadow-sm dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
            "whitespace-nowrap"
          )}
        >
          {modelVersion && <span className="mr-1.5 font-mono">v{modelVersion}</span>}
          {confidence !== undefined && (
            <span className={cn(confidence > 0.9 ? "text-emerald-600" : confidence > 0.7 ? "text-amber-600" : "text-red-600")}>
              {Math.round(confidence * 100)}%
            </span>
          )}
        </span>
      )}
    </div>
  )
}

export { AiBadge }
