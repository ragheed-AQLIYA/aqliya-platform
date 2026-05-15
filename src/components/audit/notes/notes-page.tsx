"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { FileText, Sparkles, MessageSquare, AlertTriangle, ChevronDown, ChevronRight, Filter, Search, Share2, Bot, CheckCircle2, XCircle, Loader2, ShieldCheck, Link2, Send, Eye, ThumbsDown, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { getTraceabilityAction, generateDraftNotesAction, acceptDraftNoteAction, rejectDraftNoteAction, updateNoteStatusAction } from "@/actions/audit-actions"
import type { DisclosureNote, Engagement, AIAssistanceOutput } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getDisclosureNotesAction, getEngagementAction } from "@/actions/audit-read-actions"
import { getEvidenceForNoteType } from "@/lib/audit/notes"

const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700 border-gray-300", needs_info: "bg-amber-100 text-amber-700 border-amber-300", reviewed: "bg-blue-100 text-blue-700 border-blue-300", approved: "bg-green-100 text-green-700 border-green-300", rejected: "bg-red-100 text-red-700 border-red-300" }

const accountTypeLabels: Record<string, string> = { asset: "أصول متداولة", liability: "خصوم متداولة", equity: "حقوق ملكية", revenue: "إيرادات", expense: "مصروفات", "non-current-asset": "أصول غير متداولة" }

export default function NotesPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [notes, setNotes] = useState<DisclosureNote[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showMissing, setShowMissing] = useState(false)
  const [traceNote, setTraceNote] = useState<DisclosureNote | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([])
  const [generating, setGenerating] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const loadNotes = useCallback(() => {
    Promise.all([getDisclosureNotesAction(engagementId), getEngagementAction(engagementId)]).then(([n, e]) => {
      setNotes(n); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  useEffect(() => { loadNotes() }, [loadNotes])

  const handleGenerateDrafts = async () => {
    setGenerating(true)
    try {
      const result = await generateDraftNotesAction(engagementId)
      setAiDrafts(prev => [...result, ...prev])
    } catch (e) {
      console.error("Failed to generate draft notes", e)
    } finally {
      setGenerating(false)
    }
  }

  const handleAcceptDraft = async (ai: AIAssistanceOutput) => {
    setAcceptingId(ai.id)
    try {
      const result = await acceptDraftNoteAction(ai.id, ai.outputContent, engagementId)
      if (result.note) {
        setAiDrafts(prev => prev.filter(a => a.id !== ai.id))
        loadNotes()
      }
    } catch (e) {
      console.error("Failed to accept draft", e)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleRejectDraft = async (ai: AIAssistanceOutput) => {
    setAcceptingId(ai.id)
    try {
      await rejectDraftNoteAction(ai.id, engagementId)
      setAiDrafts(prev => prev.filter(a => a.id !== ai.id))
    } catch (e) {
      console.error("Failed to reject draft", e)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleNoteStatusChange = async (noteId: string, status: string, comment?: string) => {
    try {
      const result = await updateNoteStatusAction(noteId, status, engagementId, comment)
      if (result.note) {
        setNotes(prev => prev.map(n => n.id === noteId ? result.note! : n))
        loadNotes()
      }
    } catch (e) {
      console.error("Failed to update note status", e)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (notes.length === 0 && aiDrafts.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">لم يتم العثور على إيضاحات.</CardContent></Card>

  let filtered = notes
  if (statusFilter !== "all") filtered = filtered.filter(n => n.status === statusFilter)
  if (showMissing) filtered = filtered.filter(n => n.missingInformation.length > 0)

  const statuses = ["all", ...new Set(notes.map(n => n.status))]
  const draftCount = notes.filter(n => n.status === "draft").length
  const needsInfoCount = notes.filter(n => n.status === "needs_info").length
  const reviewedCount = notes.filter(n => n.status === "reviewed").length
  const approvedCount = notes.filter(n => n.status === "approved").length
  const rejectedCount = notes.filter(n => n.status === "rejected").length

  const statusCounts: Record<string, number> = { all: notes.length, draft: draftCount, needs_info: needsInfoCount, reviewed: reviewedCount, approved: approvedCount, rejected: rejectedCount }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إيضاحات القوائم المالية</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} — {engagement?.fiscalPeriod}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s === "all" ? `الكل (${notes.length})` : `${s.replace("_", " ")} (${statusCounts[s] ?? 0})`}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button variant={showMissing ? "default" : "outline"} size="sm" onClick={() => setShowMissing(!showMissing)}>
            <AlertTriangle className="size-3 ml-1" />معلومات ناقصة
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateDrafts} disabled={generating} className="gap-1.5">
            {generating ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />}
            إنشاء مسودات الإيضاحات
          </Button>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="px-4 py-2.5 flex items-start gap-2">
          <ShieldCheck className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800">جميع الإيضاحات مسودة — تتطلب مراجعة بشرية</p>
            <p className="text-[11px] text-amber-700/80 mt-0.5">يتم إنشاء الإيضاحات تلقائياً من الحسابات المصنّفة. كل إيضاح يتطلب التحقق من المبالغ وربط الأدلة والتخصيص قبل الاعتماد.</p>
          </div>
        </CardContent>
      </Card>

      {aiDrafts.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              مسودات إيضاحات الذكاء الاصطناعي — تتطلب مراجعة بشرية
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">غير نهائية</Badge>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              مسودات إيضاحات مولّدة بالذكاء الاصطناعي. راجع واقبل أو ارفض كل مسودة. المسودات المقبولة ستظهر كإيضاحات بحالة مسودة.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {aiDrafts.map(ai => {
              let parsed: Record<string, unknown> = {}
              try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { content: ai.outputContent } }
              return (
                <div key={ai.id} className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{(parsed.title as string) ?? "مسودة إيضاح"}</span>
                        <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">إيضاح {(parsed.noteNumber as string) ?? "?"}</Badge>
                        {ai.confidence !== null && (
                            <span className="text-[10px] text-muted-foreground">{Math.round(ai.confidence * 100)}% ثقة</span>
                        )}
                      </div>
                      <div className="rounded-md bg-violet-50/50 border border-violet-100 p-3 mt-2">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{(parsed.content as string) ?? ai.outputContent}</p>
                      </div>
                      {Array.isArray(parsed.missingInformation) && (parsed.missingInformation as string[]).length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-amber-700">معلومات ناقصة مطلوبة:</span>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {(parsed.missingInformation as string[]).map((mi: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                <AlertTriangle className="size-2.5 ml-0.5" />{mi}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(parsed.linkedStatementLine as string | undefined) && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          المصدر: {String(parsed.linkedStatementLine)}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        تم الإنشاء {new Date(ai.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleAcceptDraft(ai)}
                        disabled={acceptingId === ai.id}
                        title="قبول المسودة"
                      >
                        {acceptingId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectDraft(ai)}
                        disabled={acceptingId === ai.id}
                        title="رفض المسودة"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            expanded={expandedId === note.id}
            onToggle={() => setExpandedId(expandedId === note.id ? null : note.id)}
            onTrace={async (n) => {
              setTraceNote(n)
              try {
                const trace = await getTraceabilityAction(engagementId, 'note', n.id)
                setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] })
              } catch {
                setTraceData({ forward: [], backward: [] })
              }
              setTraceabilityOpen(true)
            }}
            onStatusChange={handleNoteStatusChange}
          />
        ))}
      </div>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceNote(null) }}
        entityType="disclosure_note"
        entityId={traceNote?.id || ''}
        entityLabel={`إيضاح ${traceNote?.noteNumber} — ${traceNote?.title || ''}`}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}

function NoteCard({ note, expanded, onToggle, onTrace, onStatusChange }: { note: DisclosureNote; expanded: boolean; onToggle: () => void; onTrace: (note: DisclosureNote) => void; onStatusChange: (noteId: string, status: string, comment?: string) => void }) {
  const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700 border-gray-300", needs_info: "bg-amber-100 text-amber-700 border-amber-300", reviewed: "bg-blue-100 text-blue-700 border-blue-300", approved: "bg-green-100 text-green-700 border-green-300", rejected: "bg-red-100 text-red-700 border-red-300" }
  const evidenceReq = getEvidenceForNoteType(note.noteType as any)
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
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">إيضاح {note.noteNumber}</span>
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
            {note.missingInformation.length > 0 && !expanded && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {note.missingInformation.slice(0, 2).map((mi, i) => (
                  <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    <AlertTriangle className="size-2.5 ml-0.5" />{mi}
                  </Badge>
                ))}
                {note.missingInformation.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">+{note.missingInformation.length - 2} المزيد</Badge>
                )}
              </div>
            )}
          </div>
          <div className="ml-2">{expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}</div>
        </div>
        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {note.status === "approved" ? (
              <div className="rounded border border-green-200 bg-green-50/60 p-2 text-xs text-green-800">
                <CheckCircle2 className="inline size-3 ml-1" />تم الاعتماد — تمت مراجعة هذه الإيضاح وقبولها
              </div>
            ) : note.status === "rejected" ? (
              <div className="rounded border border-red-200 bg-red-50/60 p-2 text-xs text-red-800">
                <XCircle className="inline size-3 ml-1" />مرفوض — هذه الإيضاح تتطلب مراجعة
              </div>
            ) : note.status === "reviewed" ? (
              <div className="rounded border border-blue-200 bg-blue-50/60 p-2 text-xs text-blue-800">
                <Eye className="inline size-3 ml-1" />تمت المراجعة — بانتظار الاعتماد النهائي
              </div>
            ) : (
              <div className="rounded border border-amber-200 bg-amber-50/60 p-2 text-xs text-amber-800">
                <ShieldCheck className="inline size-3 ml-1" />مسودة إيضاح — تتطلب مراجعة بشرية والتحقق من المبالغ وربط الأدلة قبل الاستخدام
              </div>
            )}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</div>
            {note.missingInformation.length > 0 && (
              <div>
                <div className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="size-3" />معلومات ناقصة
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {note.missingInformation.map((mi, i) => (
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
                  <ShieldCheck className="size-3" />الأدلة المطلوبة
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
                <div className="text-xs font-medium text-slate-700">إجراءات المراجع</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {note.status !== "reviewed" && (
                    <Button size="xs" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("reviewed") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "reviewed" ? <Loader2 className="size-3 ml-1 animate-spin" /> : <Eye className="size-3 ml-1" />}تحديد كمراجَع
                    </Button>
                  )}
                  <Button size="xs" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("approved") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "approved" ? <Loader2 className="size-3 ml-1 animate-spin" /> : <CheckCircle2 className="size-3 ml-1" />}اعتماد
                  </Button>
                  <Button size="xs" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("rejected") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "rejected" ? <Loader2 className="size-3 ml-1 animate-spin" /> : <ThumbsDown className="size-3 ml-1" />}رفض
                  </Button>
                  <Button size="xs" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); handleStatusAction("needs_info") }} disabled={submittingStatus !== null}>
                      {submittingStatus === "needs_info" ? <Loader2 className="size-3 ml-1 animate-spin" /> : <Info className="size-3 ml-1" />}طلب معلومات
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="أضف تعليق مراجعة (اختياري — سيتم إرفاقه بتغيير الحالة)..."
                    className="min-h-[50px] text-xs"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {note.reviewComments.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <MessageSquare className="size-3" />تعليقات المراجعة ({note.reviewComments.length})
                </div>
                {note.reviewComments.map(rc => (
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
                    {rc.resolution && <p className="text-green-700 mt-1">تم الحل: {rc.resolution}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); onTrace(note) }}>
                <Share2 className="size-3 ml-1" />التتبع
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">آخر تحديث: {new Date(note.updatedAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
