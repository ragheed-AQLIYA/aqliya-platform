"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, Send, User, Filter, ChevronDown, ChevronRight, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getTraceabilityAction, createReviewCommentAction, updateReviewCommentStatusAction } from "@/actions/audit-actions"
import type { ReviewComment, Engagement, FinancialStatement, DisclosureNote, Finding, EvidenceObject, Recommendation } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getReviewCommentsAction, getEngagementAction, getFinancialStatementsAction, getDisclosureNotesAction, getFindingsAction, getEvidenceAction, getRecommendationsAction } from "@/actions/audit-read-actions"

const targetIcons: Record<string, React.ReactNode> = { statement: <MessageSquare className="size-4" />, note: <MessageSquare className="size-4" />, finding: <AlertTriangle className="size-4" />, recommendation: <CheckCircle className="size-4" />, evidence: <MessageSquare className="size-4" /> }

export default function ReviewPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all")
  const [newComment, setNewComment] = useState("")
  const [commentTargetType, setCommentTargetType] = useState("statement_line")
  const [commentTargetId, setCommentTargetId] = useState("")
  const [sending, setSending] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [traceComment, setTraceComment] = useState<ReviewComment | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [statements, setStatements] = useState<FinancialStatement[]>([])
  const [notes, setNotes] = useState<DisclosureNote[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [evidenceList, setEvidenceList] = useState<EvidenceObject[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    Promise.all([getReviewCommentsAction(engagementId), getEngagementAction(engagementId)]).then(([c, e]) => {
      setComments(c); setEngagement(e); setLoading(false)
    })
    loadEntities()
  }, [engagementId])

  const loadEntities = async () => {
    const [s, n, f, ev, r] = await Promise.all([
      getFinancialStatementsAction(engagementId), getDisclosureNotesAction(engagementId),
      getFindingsAction(engagementId), getEvidenceAction(engagementId), getRecommendationsAction(engagementId),
    ])
    setStatements(s); setNotes(n); setFindings(f); setEvidenceList(ev); setRecommendations(r)
  }

  const getTargetOptions = (): { id: string; label: string }[] => {
    switch (commentTargetType) {
      case 'statement_line':
        return statements.flatMap(s => (s.lines || []).map(l => ({ id: l.id, label: `${s.title} — ${l.label}` })))
      case 'note':
        return notes.map(n => ({ id: n.id, label: `Note ${n.noteNumber} — ${n.title}` }))
      case 'finding':
        return findings.map(f => ({ id: f.id, label: f.title }))
      case 'evidence':
        return evidenceList.map(e => ({ id: e.id, label: e.filename }))
      case 'recommendation':
        return recommendations.map(r => ({ id: r.id, label: r.title }))
      default:
        return []
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSending(true)
    setCommentError(null)
    try {
      const result = await createReviewCommentAction({
        engagementId, targetType: commentTargetType, targetId: commentTargetId,
        comment: newComment, requiredAction: 'revise',
      })
      if (result.comment) setComments(prev => [result.comment, ...prev])
      setNewComment("")
    } catch { setCommentError('Failed to add comment') } finally { setSending(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const openCount = comments.filter(c => c.status === "open").length
  let filtered = comments
  if (filter === "open") filtered = comments.filter(c => c.status === "open")
  if (filter === "resolved") filtered = comments.filter(c => c.status === "resolved")

  const getTargetLabel = (c: ReviewComment) => {
    const labels: Record<string, string> = { statement: "Statement of Profit or Loss", note: "Note 2 - PPE", finding: "Missing Inventory Evidence", recommendation: "Reclassify Loan", evidence: "Bank Confirmation" }
    return labels[c.targetType] || c.targetType
  }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "open", "resolved"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? `All (${comments.length})` : f === "open" ? `Open (${openCount})` : `Resolved (${comments.length - openCount})`}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Review Comment</CardTitle>
          <CardDescription>Submit a new review comment for this engagement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Target Type</Label>
                  <Select value={commentTargetType} onValueChange={(v) => { if (v !== null) { setCommentTargetType(v); setCommentTargetId('') } }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="statement_line">Statement Line</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="finding">Finding</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Target Entity</Label>
                  <Select value={commentTargetId} onValueChange={(v) => { if (v !== null) setCommentTargetId(v) }} disabled={getTargetOptions().length === 0}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={getTargetOptions().length === 0 ? "No entities found" : "Select target..."} /></SelectTrigger>
                    <SelectContent>
                      {getTargetOptions().map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Enter your review comment..."
                className="min-h-[60px]"
              />
            </div>
            <div className="flex flex-col gap-1 pt-5">
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim() || sending}>
                <Send className="size-4 mr-1" />{sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
          {commentError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="size-4 shrink-0" /><span>{commentError}</span></div>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map(comment => (
          <ReviewCommentCard key={comment.id} comment={comment} targetLabel={getTargetLabel(comment)} onTrace={async (c) => { setTraceComment(c); try { const trace = await getTraceabilityAction(engagementId, 'review_comment', c.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }} onResolve={async (c) => { try { const r = await updateReviewCommentStatusAction(c.id, 'resolved', 'Addressed'); if (r.comment) setComments(prev => prev.map(cc => cc.id === c.id ? { ...cc, status: 'resolved', resolution: 'Addressed', resolvedAt: new Date().toISOString() } : cc)) } catch {} }} />
        ))}
      </div>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceComment(null) }}
        entityType="review_comment"
        entityId={traceComment?.id || ''}
        entityLabel={traceComment?.comment?.substring(0, 60) || ''}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}

function ReviewCommentCard({ comment, targetLabel, onTrace, onResolve }: { comment: ReviewComment; targetLabel: string; onTrace: (c: ReviewComment) => void; onResolve?: (c: ReviewComment) => void }) {
  const [expanded, setExpanded] = useState(false)
  const statusColors: Record<string, string> = { open: "bg-blue-100 text-blue-700 border-blue-300", resolved: "bg-green-100 text-green-700 border-green-300", acknowledged: "bg-gray-100 text-gray-600 border-gray-300" }
  const targetIcons: Record<string, React.ReactNode> = { statement: <MessageSquare className="size-4" />, note: <MessageSquare className="size-4" />, finding: <AlertTriangle className="size-4" />, recommendation: <CheckCircle className="size-4" />, evidence: <MessageSquare className="size-4" /> }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{targetIcons[comment.targetType]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.reviewerName}</span>
              <Badge variant="outline" className="text-[10px]">{comment.targetType}</Badge>
              <Badge variant="outline" className={`text-[10px] ${statusColors[comment.status]}`}>{comment.status}</Badge>
              {comment.requiredAction && comment.requiredAction !== "none" && (
                <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700">{comment.requiredAction.replace(/_/g, " ")}</Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-sm mt-1">{comment.comment}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">on: {targetLabel}</span>
            </div>
            {comment.resolution && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                Resolved: {comment.resolution}
                {comment.resolvedAt && <span className="ml-1">({new Date(comment.resolvedAt).toLocaleDateString()})</span>}
              </div>
            )}
            {comment.status === "open" && (
              <div className="flex items-center gap-1 mt-2">
                <Button size="xs" variant="outline" className="text-green-600 border-green-300" onClick={(e) => { e.stopPropagation(); onResolve?.(comment) }}><CheckCircle className="size-3 mr-1" />Resolve</Button>
                <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); onTrace(comment) }}><Share2 className="size-3 mr-1" />Trace</Button>
              </div>
            )}
            {comment.status !== "open" && (
              <div className="flex items-center gap-1 mt-2">
                <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); onTrace(comment) }}><Share2 className="size-3 mr-1" />Trace</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
