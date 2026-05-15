"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DraftOnlyBanner } from "./DraftOnlyBanner"
import { EvidenceStatusBadge } from "./EvidenceStatusBadge"
import { EscalationBadge } from "./EscalationBadge"
import { ReviewRequiredNotice } from "./ReviewRequiredNotice"
import type { EvidenceStatusBadgeProps, EscalationBadgeProps } from "./types"

interface ProvenanceSummaryProps {
  taskType?: string
  doctrineCount?: number
  governanceCount?: number
  evidenceStatus?: string
  reviewRequired?: boolean
  escalationLevel?: string
  confidence?: string
  className?: string
}

function ProvenanceSummary({
  taskType,
  doctrineCount,
  governanceCount,
  evidenceStatus,
  reviewRequired,
  escalationLevel,
  confidence,
  className,
}: ProvenanceSummaryProps) {
  const hasIndicators =
    doctrineCount !== undefined ||
    governanceCount !== undefined ||
    evidenceStatus !== undefined ||
    reviewRequired ||
    (escalationLevel && escalationLevel !== "none") ||
    confidence !== undefined

  return (
    <Card size="sm" className={cn("", className)}>
      <CardContent className="space-y-2 px-3 py-2">
        {taskType && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {taskType}
            </span>
            {confidence && (
              <span className="text-[10px] text-muted-foreground">
                {confidence}
              </span>
            )}
          </div>
        )}

        {hasIndicators && (
          <div className="flex flex-wrap items-center gap-1.5">
            {doctrineCount !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                المبادئ: {doctrineCount}
              </span>
            )}
            {governanceCount !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                الحوكمة: {governanceCount}
              </span>
            )}
            {evidenceStatus && (
              <EvidenceStatusBadge
                status={evidenceStatus as EvidenceStatusBadgeProps["status"]}
              />
            )}
            {escalationLevel && (
              <EscalationBadge
                level={escalationLevel as EscalationBadgeProps["level"]}
              />
            )}
            {reviewRequired && <ReviewRequiredNotice />}
          </div>
        )}

        {taskType && (
          <DraftOnlyBanner taskType={taskType} />
        )}
      </CardContent>
    </Card>
  )
}

export { ProvenanceSummary }
