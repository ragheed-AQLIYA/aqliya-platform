"use client"

import { FileWarning } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DraftOnlyBannerProps {
  taskType?: string
  className?: string
}

const contextualMessages: Record<string, string> = {
  evidence: "Evidence is in draft state and must be reviewed before use in final reporting.",
  finding: "This finding is draft-only and requires human approval before it becomes final.",
  recommendation: "Recommendation is marked as draft and needs human review before adoption.",
  approval: "Approval workflow is in draft mode. Final approval requires human sign-off.",
  publication: "Publication content is draft-only and must be approved before release.",
}

function DraftOnlyBanner({ taskType, className }: DraftOnlyBannerProps) {
  const contextMsg = taskType ? contextualMessages[taskType.toLowerCase()] : undefined

  return (
    <Card
      size="sm"
      className={cn("border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40", className)}
    >
      <CardContent className="flex items-start gap-2 px-3 py-2">
        <FileWarning className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Draft Only — Human review and approval required
          </p>
          {contextMsg && (
            <p className="text-[11px] leading-snug text-amber-700/80 dark:text-amber-400/70">
              {contextMsg}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { DraftOnlyBanner }
