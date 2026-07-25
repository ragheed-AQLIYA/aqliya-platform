"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  ChevronDown, ChevronRight, AlertTriangle, MessageSquare, Eye,
  CheckCircle2, XCircle, Loader2, ShieldCheck, Link2, Share2, Info, ThumbsDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { DisclosureNote } from "@/types/audit"
import { getEvidenceForNoteType, type NoteCategory } from "@/lib/audit/notes"
import { extractRuleCitations, RULE_CITATION_PREFIX } from "@/lib/audit/notes/disclosure-types"
import { NoteReviewComments } from "@/components/audit/notes/components/note-review-comments"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  needs_info: "bg-amber-100 text-amber-700 border-amber-300",
  reviewed: "bg-blue-100 text-blue-700 border-blue-300",
  approved: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
}

const accountTypeLabels: Record<string, string> = {
  asset: "أصول متداولة",
  liability: "خصوم متداولة",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
  "non-current-asset": "أصول غير متداولة",
}

interface NoteCardProps {
  note: DisclosureNote
  expanded: boolean
  onToggle: () => void
  onTrace: (note: DisclosureNote) => void
  onStatusChange: (noteId: string, status: string, comment?: string) => void
}

export function NoteCard({ note, expanded, onToggle, onTrace, onStatusChange }: NoteCardProps) {
  const t = useTranslations("audit.notes")
  const evidenceReq = getEvidenceForNoteType(note.noteType as NoteCategory)
  const ruleCitations = extractRuleCitations(note.missingInformation)
  const displayMissing = note.missingInformation.filter((m) => !m.startsWith(RULE_CITATION_PREFIX))
  const linkedLabel = note.linkedStatementLine ? (accountTypeLabels[note.linkedStatementLine] ?? note.linkedStatementLine) : null
  const [reviewComment, setReviewComment] = useState("")
  const [submittingStatus, setSubmittingStatus] = useState<string | null>(null)

  const handleStatusAction = async (status: string) => {
    setSubmittingStatus(status)
    const comment = reviewComment.trim() || undefined
    await onStatusChange(note.id, status, comment)
    setReviewComment("")
    setSubmittingStatus(null)
  }

  const isFinal = note.status === "approved" || note.status === "rejected"

  return (
    <Card className={isFinal ? "opacity-80" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{t("note")} {note.noteNumber}</span>
              <span className="font-medium text-sm">{note.title}</span>
              <Badge variant="outline" className={statusColors[note.status]}>{note.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="bg-muted px-1.5 py-0.5 rounded">{note.noteType.replace("_", " ")}</span>
              {linkedLabel && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Link2 className="size-2.5" />{linkedLabel}
                </span>
              )}
              {note.reviewComments.length > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <MessageSquare className="size-3" />{note.reviewComments.length}
                </span>
              )}
            </div>
            {!expanded && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{note.content}</p>
            )}
            {displayMissing.length > 0 && !expanded && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {displayMissing.slice(0, 2).map((mi, i) => (
                  <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    <AlertTriangle className="size-2.5 me-0.5" />{mi}
                  </Badge>
                ))}
                {displayMissing.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">+{displayMissing.length - 2} {t("more")}</Badge>
                )}
              </div>
            )}
            {ruleCitations.length > 0 && !expanded && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {ruleCitations.map((c) => (
                  <Badge key={`${c.source}-${c.ruleId}`} variant="outline" className="text-[10px] bg-violet-50">
                    {c.source.toUpperCase()} {c.standardCode}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="ml-2">{expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}</div>
        </div>
        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {note.status === "approved" ? (
              <div className="rounded border border-green-200 bg-green-50/60 p-2 text-xs text-green-800">
                <CheckCircle2 className="inline size-3 me-1" />{t("approvedMessage")}
              </div>
            ) : note.status === "rejected" ? (
              <div className="rounded border border-red-200 bg-red-50/60 p-2 text-xs text-red-800">
                <XCircle className="inline size-3 me-1" />{t("rejectedMessage")}
              </div>
            ) : note.status === "reviewed" ? (
              <div className="rounded border border-blue-200 bg-blue-50/60 p-2 text-xs text-blue-800">
                <Eye className="inline size-3 me-1" />{t("reviewedMessage")}
              </div>
            ) : (
              <div className="rounded border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-800">
                <ShieldCheck className="inline size-3 me-1" />{t("draftMessage")}
              </div>
            )}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</div>
            {displayMissing.length > 0 && (
              <div>
                <div className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="size-3" />{t("missingInfo")}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {displayMissing.map((mi, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {mi}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {evidenceReq && evidenceReq.requiredDocuments.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <ShieldCheck className="size-3" />{t("evidenceRequired")}
                  {evidenceReq.standardReference && (
                    <span className="font-normal text-muted-foreground text-[10px]">({evidenceReq.standardReference})</span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {evidenceReq.requiredDocuments.map((doc, i) => (
                    <Badge key={i} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[11px]">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!isFinal && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-medium text-slate-700">{t("reviewerActions")}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {note.status !== "reviewed" && (
                    <Button size="xs" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("reviewed") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "reviewed" ? <Loader2 className="size-3 me-1 animate-spin" /> : <Eye className="size-3 me-1" />}{t("markReviewed")}
                    </Button>
                  )}
                  <Button size="xs" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("approved") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "approved" ? <Loader2 className="size-3 me-1 animate-spin" /> : <CheckCircle2 className="size-3 me-1" />}{t("approve")}
                  </Button>
                  <Button size="xs" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("rejected") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "rejected" ? <Loader2 className="size-3 me-1 animate-spin" /> : <ThumbsDown className="size-3 me-1" />}{t("reject")}
                  </Button>
                  <Button size="xs" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("needs_info") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "needs_info" ? <Loader2 className="size-3 me-1 animate-spin" /> : <Info className="size-3 me-1" />}{t("requestInfo")}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder={t("reviewCommentPlaceholder")}
                    className="min-h-[50px] text-xs"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <NoteReviewComments comments={note.reviewComments} />

            <div className="flex items-center gap-2 mt-2">
              <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); onTrace(note) }}>
                <Share2 className="size-3 me-1" />{t("traceability")}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">{t("updated")} {new Date(note.updatedAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
