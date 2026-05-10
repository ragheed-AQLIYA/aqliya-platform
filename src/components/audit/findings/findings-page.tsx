"use client"

import { Fragment, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertTriangle, Plus, Sparkles, ChevronDown, ChevronRight, FileText, User, Calendar, Filter, Flag, Share2, CheckCircle, XCircle, ListChecks, Bot, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { getTraceabilityAction, createFindingAction, updateFindingStatusAction, generateFindingDraftsAction, acceptFindingDraftAction, updateAIOutputStatusAction } from "@/actions/audit-actions"
import type { Finding, Engagement, EvidenceObject, Recommendation, AIAssistanceOutput } from "@/types/audit"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getFindingsAction, getEngagementAction, getEvidenceAction, getRecommendationsAction } from "@/actions/audit-read-actions"

const severityColors: Record<string, string> = { low: "bg-green-100 text-green-700 border-green-300", medium: "bg-amber-100 text-amber-700 border-amber-300", high: "bg-orange-100 text-orange-700 border-orange-300", critical: "bg-red-100 text-red-700 border-red-300" }
const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-600", open: "bg-blue-100 text-blue-700", in_review: "bg-purple-100 text-purple-700", accepted: "bg-green-100 text-green-700", resolved: "bg-teal-100 text-teal-700", dismissed: "bg-gray-100 text-gray-500" }
const typeColors: Record<string, string> = { material_misstatement: "bg-red-100 text-red-700", control_deficiency: "bg-amber-100 text-amber-700", disclosure_gap: "bg-purple-100 text-purple-700", observation: "bg-blue-100 text-blue-700" }

const severityValues: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }

export default function FindingsPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [findings, setFindings] = useState<Finding[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreate, setShowCreate] = useState(false)
  const [newFinding, setNewFinding] = useState({ title: "", findingType: "observation", severity: "low", description: "", rootCause: "", impact: "" })
  const [traceFinding, setTraceFinding] = useState<Finding | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [showLinkedEvidence, setShowLinkedEvidence] = useState<Finding | null>(null)
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceObject[]>([])
  const [loadingLinked, setLoadingLinked] = useState(false)
  const [showLinkedRecs, setShowLinkedRecs] = useState<Finding | null>(null)
  const [linkedRecs, setLinkedRecs] = useState<Recommendation[]>([])
  const [loadingLinkedRecs, setLoadingLinkedRecs] = useState(false)
  const [aiDrafts, setAiDrafts] = useState<AIAssistanceOutput[]>([])
  const [generatingFindingDrafts, setGeneratingFindingDrafts] = useState(false)
  const [acceptingFindingId, setAcceptingFindingId] = useState<string | null>(null)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getFindingsAction(engagementId), getEngagementAction(engagementId)]).then(([f, e]) => {
      setFindings(f); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  let filtered = findings
  if (statusFilter !== "all") filtered = filtered.filter(f => f.status === statusFilter)
  if (severityFilter !== "all") filtered = filtered.filter(f => f.severity === severityFilter)
  if (typeFilter !== "all") filtered = filtered.filter(f => f.findingType === typeFilter)

  const sorted = [...filtered].sort((a, b) => (severityValues[b.severity] || 0) - (severityValues[a.severity] || 0))

  const handleCreate = async () => {
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      const result = await createFindingAction({
        engagementId, title: newFinding.title, findingType: newFinding.findingType,
        severity: newFinding.severity, description: newFinding.description,
        rootCause: newFinding.rootCause, impact: newFinding.impact,
      })
      if (result.finding) setFindings(prev => [result.finding, ...prev])
      setShowCreate(false)
      setNewFinding({ title: "", findingType: "observation", severity: "low", description: "", rootCause: "", impact: "" })
    } catch { setCreateError('Failed to create finding') } finally { setCreateSubmitting(false) }
  }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Findings</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={generatingFindingDrafts} onClick={async () => { setGeneratingFindingDrafts(true); try { const r = await generateFindingDraftsAction(engagementId); setAiDrafts(prev => [...r, ...prev]) } catch {} finally { setGeneratingFindingDrafts(false) } }} className="gap-1.5">
            {generatingFindingDrafts ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />} Generate Draft Findings
          </Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="size-4 mr-1" />New Finding</Button>
        </div>
      </div>

      {aiDrafts.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              AI Draft Findings — Requires human review
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">Not final</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {aiDrafts.map(ai => {
              let parsed: Record<string, unknown> = {}
              try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { description: ai.outputContent } }
              return (
                <div key={ai.id} className="py-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 shrink-0">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{(parsed.title as string) ?? "Draft Finding"}</span>
                      {(parsed.severity != null && String(parsed.severity)) && (
                        <Badge variant="outline" className={(severityColors[String(parsed.severity)] ?? "") + " text-[10px]"}>{String(parsed.severity)}</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{Math.round((ai.confidence ?? 0) * 100)}% confidence</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(parsed.description ?? "")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => { setAcceptingFindingId(ai.id); try { const r = await acceptFindingDraftAction(ai.id, engagementId); if (r.finding) { setFindings(prev => [r.finding!, ...prev]); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) } } catch {} finally { setAcceptingFindingId(null) } }}
                      disabled={acceptingFindingId === ai.id} title="Accept">
                      {acceptingFindingId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => { updateAIOutputStatusAction(ai.id, 'rejected'); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) }} title="Reject">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { if (v !== null) { setStatusFilter(v) } }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { if (v !== null) { setSeverityFilter(v) } }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { if (v !== null) { setTypeFilter(v) } }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="material_misstatement">Material Misstatement</SelectItem>
            <SelectItem value="control_deficiency">Control Deficiency</SelectItem>
            <SelectItem value="disclosure_gap">Disclosure Gap</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI</TableHead>
                <TableHead>Related Account</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(finding => (
                <Fragment key={finding.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)}>
                    <TableCell className="font-medium">{finding.title}</TableCell>
                    <TableCell><Badge variant="outline" className={typeColors[finding.findingType]}>{finding.findingType.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={severityColors[finding.severity]}>{finding.severity}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[finding.status]}>{finding.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{finding.aiSuggested ? <Sparkles className="size-4 text-purple-500" /> : "-"}</TableCell>
                    <TableCell>{finding.relatedAccountIds.length > 0 ? finding.relatedAccountIds.map(id => <Badge key={id} variant="outline" className="text-[10px] mr-1">{id}</Badge>) : "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(finding.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                  </TableRow>
                  {expandedId === finding.id && (
                    <TableRow key={`${finding.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Description</div>
                            <p>{finding.description}</p>
                          </div>
                          {finding.rootCause && (
                            <div>
                              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Root Cause</div>
                              <p>{finding.rootCause}</p>
                            </div>
                          )}
                          {finding.impact && (
                            <div>
                              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Impact</div>
                              <p>{finding.impact}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Materiality: {finding.materiality}</span>
                            {finding.assignedTo && <span>Assigned to: {finding.assignedTo}</span>}
                            <span>Updated: {new Date(finding.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2 pt-1 flex-wrap">
                            {finding.status === 'draft' && <Button size="xs" variant="outline" className="text-green-600 border-green-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'open', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'open' } : f)) } catch {} }}><CheckCircle className="size-3 mr-1" />Accept</Button>}
                            {finding.status === 'open' && <Button size="xs" variant="outline" className="text-purple-600 border-purple-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'in_review', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'in_review' } : f)) } catch {} }}><CheckCircle className="size-3 mr-1" />Start Review</Button>}
                            {finding.status !== 'resolved' && finding.status !== 'dismissed' && <Button size="xs" variant="outline" className="text-red-600 border-red-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'dismissed', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'dismissed' } : f)) } catch {} }}><XCircle className="size-3 mr-1" />Dismiss</Button>}
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setLoadingLinked(true); try { const ev = await getEvidenceAction(engagementId); const linked = ev.filter(e => e.linkedEntities.some(le => le.targetId === finding.id || le.targetType === 'finding')); setLinkedEvidence(linked); setShowLinkedEvidence(finding) } catch {} finally { setLoadingLinked(false) } }}><FileText className="size-3 mr-1" />Evidence ({finding.relatedEvidenceIds?.length ?? 0})</Button>
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setLoadingLinkedRecs(true); try { const r = await getRecommendationsAction(engagementId); const recs = r.filter(re => re.findingId === finding.id); setLinkedRecs(recs); setShowLinkedRecs(finding) } catch {} finally { setLoadingLinkedRecs(false) } }}><ListChecks className="size-3 mr-1" />Recs</Button>
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setTraceFinding(finding); try { const trace = await getTraceabilityAction(engagementId, 'finding', finding.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }}>
                              <Share2 className="size-3 mr-1" />Traceability
                            </Button>
                            {finding.aiSuggested && <Badge variant="outline" className="bg-purple-100 text-purple-700"><Sparkles className="size-3 mr-1" />AI Suggested</Badge>}
                          </div>
                          {finding.aiSuggested && (
                            <div className="mt-2 rounded border border-purple-200 bg-purple-50 p-2 text-xs text-purple-700">
                              Requires human confirmation — this is an AI-generated candidate, not a finalized finding
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showLinkedEvidence} onOpenChange={() => setShowLinkedEvidence(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Linked Evidence</DialogTitle><DialogDescription>Evidence linked to: {showLinkedEvidence?.title}</DialogDescription></DialogHeader>
          {loadingLinked ? <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div> : linkedEvidence.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">No evidence linked to this finding.</div> : (
            <div className="space-y-2">{[...new Set(linkedEvidence.map(e => e.id))].map(id => { const ev = linkedEvidence.find(e => e.id === id)!; return <div key={ev.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><FileText className="size-4 shrink-0 text-muted-foreground" /><span>{ev.filename}</span><Badge variant="outline" className="ml-auto text-[10px]">{ev.state}</Badge></div> })}</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showLinkedRecs} onOpenChange={() => setShowLinkedRecs(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Linked Recommendations</DialogTitle><DialogDescription>Recommendations for: {showLinkedRecs?.title}</DialogDescription></DialogHeader>
          {loadingLinkedRecs ? <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div> : linkedRecs.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">No recommendations for this finding.</div> : (
            <div className="space-y-2">{linkedRecs.map(rec => <div key={rec.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><ListChecks className="size-4 shrink-0 text-muted-foreground" /><span>{rec.title}</span><Badge variant="outline" className="ml-auto text-[10px]">{rec.status}</Badge></div>)}</div>
          )}
        </DialogContent>
      </Dialog>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceFinding(null) }}
        entityType="finding"
        entityId={traceFinding?.id || ''}
        entityLabel={traceFinding?.title || ''}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Finding</DialogTitle>
            <DialogDescription>Enter the details of the new audit finding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={newFinding.title} onChange={e => setNewFinding({ ...newFinding, title: e.target.value })} placeholder="Finding title..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newFinding.findingType} onValueChange={v => { if (v !== null) { setNewFinding({ ...newFinding, findingType: v }) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material_misstatement">Material Misstatement</SelectItem>
                    <SelectItem value="control_deficiency">Control Deficiency</SelectItem>
                    <SelectItem value="disclosure_gap">Disclosure Gap</SelectItem>
                    <SelectItem value="observation">Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={newFinding.severity} onValueChange={v => { if (v !== null) { setNewFinding({ ...newFinding, severity: v }) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newFinding.description} onChange={e => setNewFinding({ ...newFinding, description: e.target.value })} placeholder="Describe the finding..." />
            </div>
            <div>
              <Label>Root Cause (optional)</Label>
              <Input value={newFinding.rootCause} onChange={e => setNewFinding({ ...newFinding, rootCause: e.target.value })} placeholder="Root cause..." />
            </div>
            <div>
              <Label>Impact (optional)</Label>
              <Input value={newFinding.impact} onChange={e => setNewFinding({ ...newFinding, impact: e.target.value })} placeholder="Impact assessment..." />
            </div>
          </div>
          {createError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="size-4 shrink-0" /><span>{createError}</span></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newFinding.title.trim() || createSubmitting}>{createSubmitting ? 'Creating...' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
