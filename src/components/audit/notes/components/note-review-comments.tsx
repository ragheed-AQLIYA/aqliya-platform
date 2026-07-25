"use client"

import { MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import type { ReviewComment } from "@/types/audit"

interface NoteReviewCommentsProps {
  comments: ReviewComment[]
}

export function NoteReviewComments({ comments }: NoteReviewCommentsProps) {
  const t = useTranslations("audit.notes")

  if (comments.length === 0) return null

  return (
    <div className="space-y-2 pt-2 border-t">
      <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
        <MessageSquare className="size-3" />{t("reviewComments")} ({comments.length})
      </div>
      {comments.map(rc => (
        <div key={rc.id} className="rounded bg-slate-50 border border-slate-200 p-2 text-xs">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium">{rc.reviewerName}</span>
            <Badge variant="outline" className="text-[9px]">{rc.status}</Badge>
            {rc.requiredAction && rc.requiredAction !== "none" && (
              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700">{rc.requiredAction.replace(/_/g, " ")}</Badge>
            )}
            <span className="text-[10px] text-muted-foreground mr-auto">{new Date(rc.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</span>
          </div>
          <p className="text-slate-700">{rc.comment}</p>
          {rc.resolution && <p className="text-green-700 mt-1">{t("resolved")} {rc.resolution}</p>}
        </div>
      ))}
    </div>
  )
}
