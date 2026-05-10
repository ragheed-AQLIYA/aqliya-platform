"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { FileText, Sparkles, MessageSquare, AlertTriangle, ChevronDown, ChevronRight, Filter, Search, Share2, Bot, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { getTraceabilityAction, generateDraftNotesAction, acceptDraftNoteAction, rejectDraftNoteAction } from "@/actions/audit-actions"
import type { DisclosureNote, Engagement, AIAssistanceOutput } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getDisclosureNotesAction, getEngagementAction } from "@/actions/audit-read-actions"

const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700 border-gray-300", needs_info: "bg-amber-100 text-amber-700 border-amber-300", reviewed: "bg-blue-100 text-blue-700 border-blue-300", approved: "bg-green-100 text-green-700 border-green-300" }

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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (notes.length === 0 && aiDrafts.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">No disclosure notes found.</CardContent></Card>

  let filtered = notes
  if (statusFilter !== "all") filtered = filtered.filter(n => n.status === statusFilter)
  if (showMissing) filtered = filtered.filter(n => n.missingInformation.length > 0)

  const statuses = ["all", ...new Set(notes.map(n => n.status))]

  return (
    <div className="space-y-6" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disclosure Notes</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statuses.map(s => (
          <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
            {s === "all" ? "All" : s.replace("_", " ")}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button variant={showMissing ? "default" : "outline"} size="sm" onClick={() => setShowMissing(!showMissing)}>
            <AlertTriangle className="size-3 mr-1" />Missing Information
          </Button>
          <Button variant="outline" size="sm" onClick={handleGenerateDrafts} disabled={generating} className="gap-1.5">
            {generating ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />}
            Generate Draft Notes
          </Button>
        </div>
      </div>

      {aiDrafts.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              AI Draft Notes — Requires human review
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">Not final</Badge>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              AI-generated draft notes. Review, accept, or reject each draft. Accepted drafts will appear as disclosure notes with draft status.
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
                        <span className="text-sm font-medium">{(parsed.title as string) ?? "Draft Note"}</span>
                        <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">Note {(parsed.noteNumber as string) ?? "?"}</Badge>
                        {ai.confidence !== null && (
                          <span className="text-[10px] text-muted-foreground">{Math.round(ai.confidence * 100)}% confidence</span>
                        )}
                      </div>
                      <div className="rounded-md bg-violet-50/50 border border-violet-100 p-3 mt-2">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{(parsed.content as string) ?? ai.outputContent}</p>
                      </div>
                      {Array.isArray(parsed.missingInformation) && (parsed.missingInformation as string[]).length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-amber-700">Missing information needed:</span>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {(parsed.missingInformation as string[]).map((mi: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                <AlertTriangle className="size-2.5 mr-0.5" />{mi}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {(parsed.linkedStatementLine as string | undefined) && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Source: {String(parsed.linkedStatementLine)}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Generated {new Date(ai.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleAcceptDraft(ai)}
                        disabled={acceptingId === ai.id}
                        title="Accept draft"
                      >
                        {acceptingId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectDraft(ai)}
                        disabled={acceptingId === ai.id}
                        title="Reject draft"
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
          />
        ))}
      </div>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceNote(null) }}
        entityType="disclosure_note"
        entityId={traceNote?.id || ''}
        entityLabel={`Note ${traceNote?.noteNumber} - ${traceNote?.title || ''}`}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}

function NoteCard({ note, expanded, onToggle, onTrace }: { note: DisclosureNote; expanded: boolean; onToggle: () => void; onTrace: (note: DisclosureNote) => void }) {
  const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700 border-gray-300", needs_info: "bg-amber-100 text-amber-700 border-amber-300", reviewed: "bg-blue-100 text-blue-700 border-blue-300", approved: "bg-green-100 text-green-700 border-green-300" }

  return (
    <Card className="cursor-pointer" onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Note {note.noteNumber}</span>
              <span className="font-medium text-sm">{note.title}</span>
              {note.aiDrafted && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 flex items-center gap-1">
                  <Sparkles className="size-3" />AI Drafted
                </Badge>
              )}
              <Badge variant="outline" className={statusColors[note.status]}>{note.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="bg-muted px-1.5 py-0.5 rounded">{note.noteType.replace("_", " ")}</span>
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
                    <AlertTriangle className="size-2.5 mr-0.5" />{mi}
                  </Badge>
                ))}
                {note.missingInformation.length > 2 && (
                  <Badge variant="outline" className="text-[10px]">+{note.missingInformation.length - 2} more</Badge>
                )}
              </div>
            )}
          </div>
          <div className="ml-2">{expanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}</div>
        </div>
        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</div>
            {note.missingInformation.length > 0 && (
              <div>
                <div className="text-xs font-medium text-amber-700 mb-1">Missing Information</div>
                <div className="flex items-center gap-1 flex-wrap">
                  {note.missingInformation.map((mi, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTriangle className="size-2.5 mr-0.5" />{mi}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {note.aiDrafted && (
              <div className="rounded border border-purple-200 bg-purple-50 p-2 text-xs text-purple-700">
                <Sparkles className="inline size-3 mr-1" />AI-drafted draft — requires human review and confirmation before use
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); onTrace(note) }}>
                <Share2 className="size-3 mr-1" />Traceability
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Updated: {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
