"use client"

import { ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewRequiredNoticeProps {
  reviewerRequired?: boolean
  message?: string
  className?: string
}

function ReviewRequiredNotice({
  reviewerRequired,
  message,
  className,
}: ReviewRequiredNoticeProps) {
  if (reviewerRequired === false) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] leading-tight text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
        className
      )}
    >
      <ShieldAlert className="size-3 shrink-0" />
      <span>
        {message ?? "AI cannot approve. Human accountability remains mandatory."}
      </span>
    </div>
  )
}

export { ReviewRequiredNotice }
