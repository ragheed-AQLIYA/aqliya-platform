"use client"

import { Fragment, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { AlertTriangle, Plus, Sparkles, ChevronDown, ChevronRight, FileText, User, Calendar, Filter, Flag, Share2, CheckCircle, XCircle, ListChecks, Bot, Loader2, RefreshCw } from "lucide-react"
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
import { getFindingsPaginatedAction, getEngagementAction, getEvidenceAction, getRecommendationsAction } from "@/actions/audit-read-actions"

const severityColors: Record<string, string> = { low: "bg-green-100 text-green-700 border-green-300", medium: "bg-amber-100 text-amber-700 border-amber-300", high: "bg-orange-100 text-orange-700 border-orange-300", critical: "bg-red-100 text-red-700 border-red-300" }
const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-600", open: "bg-blue-100 text-blue-700", in_review: "bg-purple-100 text-purple-700", accepted: "bg-green-100 text-green-700", resolved: "bg-teal-100 text-teal-700", dismissed: "bg-gray-100 text-gray-500" }
const typeColors: Record<string, string> = { material_misstatement: "bg-red-100 text-red-700", control_deficiency: "bg-amber-100 text-amber-700", disclosure_gap: "bg-purple-100 text-purple-700", observation: "bg-blue-100 text-blue-700" }

const severityValues: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 }

export default function FindingsPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const t = useTranslations("audit.findings")
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
  const [findPage, setFindPage] = useState(1)
  const [findHasMore, setFindHasMore] = useState(false)
  const [findTotal, setFindTotal] = useState(0)
  const [loadingFindMore, setLoadingFindMore] = useState(false)
  const FINDINGS_PAGE_SIZE = 20
  const statusLabel: Record<string, string> = {
    draft: t("draft"), open: t("open"), in_review: t("inReview"),
    accepted: t("accepted"), resolved: t("resolved"), dismissed: t("dismissed"),
  }
  const severityLabel: Record<string, string> = {
    low: t("low"), medium: t("medium"), high: t("high"), critical: t("critical"),
  }
  const evStateLabel: Record<string, string> = {
    missing: t("missingState"), requested: t("requestedState"), uploaded: t("uploadedState"),
    linked: t("linkedState"), reviewed: t("reviewedState"), accepted: t("acceptedState"), rejected: t("rejectedState"),
  }
  const typeLabel: Record<string, string> = {
    material_misstatement: t("materialMisstatement"),
    control_deficiency: t("controlDeficiency"),
    disclosure_gap: t("disclosureGap"),
    observation: t("observation"),
  }

  useEffect(() => {
    Promise.all([getFindingsPaginatedAction(engagementId, 1, FINDINGS_PAGE_SIZE), getEngagementAction(engagementId)]).then(([r, e]) => {
      setFindings(r.items); setFindTotal(r.total); setFindHasMore(r.hasMore); setFindPage(1); setEngagement(e); setLoading(false)
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
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={generatingFindingDrafts} onClick={async () => { setGeneratingFindingDrafts(true); try { const r = await generateFindingDraftsAction(engagementId); setAiDrafts(prev => [...r, ...prev]) } catch {} finally { setGeneratingFindingDrafts(false) } }} className="gap-1.5">
            {generatingFindingDrafts ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />} {t("generateDrafts")}
          </Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="size-4 me-1" />{t("createFinding")}</Button>
        </div>
      </div>

      {aiDrafts.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              {t("aiDraftTitle")}
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">{t("notFinal")}</Badge>
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
                      <span className="text-sm font-medium">{(parsed.title as string) ?? t("draftFinding")}</span>
                      {(parsed.severity != null && String(parsed.severity)) && (
                        <Badge variant="outline" className={(severityColors[String(parsed.severity)] ?? "") + " text-[10px]"}>{severityLabel[String(parsed.severity)] || String(parsed.severity)}</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{t("confidence", { pct: Math.round((ai.confidence ?? 0) * 100) })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(parsed.description ?? "")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => { setAcceptingFindingId(ai.id); try { const r = await acceptFindingDraftAction(ai.id, engagementId); if (r.finding) { setFindings(prev => [r.finding!, ...prev]); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) } } catch {} finally { setAcceptingFindingId(null) } }}
                      disabled={acceptingFindingId === ai.id} title={t("accept")}>
                      {acceptingFindingId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => { updateAIOutputStatusAction(ai.id, 'rejected'); setAiDrafts(prev => prev.filter(a => a.id !== ai.id)) }} title={t("reject")}>
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
          <SelectTrigger className="w-32"><SelectValue placeholder={t("filterStatus")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("draft")}</SelectItem>
            <SelectItem value="open">{t("open")}</SelectItem>
            <SelectItem value="in_review">{t("inReview")}</SelectItem>
            <SelectItem value="accepted">{t("accepted")}</SelectItem>
            <SelectItem value="resolved">{t("resolved")}</SelectItem>
            <SelectItem value="dismissed">{t("dismissed")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { if (v !== null) { setSeverityFilter(v) } }}>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("filterSeverity")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allSeverities")}</SelectItem>
            <SelectItem value="low">{t("low")}</SelectItem>
            <SelectItem value="medium">{t("medium")}</SelectItem>
            <SelectItem value="high">{t("high")}</SelectItem>
            <SelectItem value="critical">{t("critical")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { if (v !== null) { setTypeFilter(v) } }}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("filterType")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="material_misstatement">{t("materialMisstatement")}</SelectItem>
            <SelectItem value="control_deficiency">{t("controlDeficiency")}</SelectItem>
            <SelectItem value="disclosure_gap">{t("disclosureGap")}</SelectItem>
            <SelectItem value="observation">{t("observation")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("titleCol")}</TableHead>
                <TableHead>{t("typeCol")}</TableHead>
                <TableHead>{t("severityCol")}</TableHead>
                <TableHead>{t("statusCol")}</TableHead>
                <TableHead>{t("ai")}</TableHead>
                <TableHead>{t("relatedAccount")}</TableHead>
                <TableHead>{t("created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(finding => (
                <Fragment key={finding.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)}>
                    <TableCell className="font-medium">{finding.title}</TableCell>
                    <TableCell><Badge variant="outline" className={typeColors[finding.findingType]}>{typeLabel[finding.findingType] || t("observation")}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={severityColors[finding.severity]}>{severityLabel[finding.severity] || t("critical")}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[finding.status]}>{statusLabel[finding.status] || t("dismissed")}</Badge></TableCell>
                    <TableCell>{finding.aiSuggested ? <Sparkles className="size-4 text-purple-500" /> : "-"}</TableCell>
                    <TableCell>{finding.relatedAccountIds.length > 0 ? finding.relatedAccountIds.map(id => <Badge key={id} variant="outline" className="text-[10px] mr-1">{id}</Badge>) : "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(finding.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</TableCell>
                  </TableRow>
                  {expandedId === finding.id && (
                    <TableRow key={`${finding.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-3 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{t("description")}</div>
                            <p>{finding.description}</p>
                          </div>
                          {finding.rootCause && (
                            <div>
                              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{t("rootCause")}</div>
                              <p>{finding.rootCause}</p>
                            </div>
                          )}
                          {finding.impact && (
                            <div>
                              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{t("impact")}</div>
                              <p>{finding.impact}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{t("materiality", { value: finding.materiality ?? "" })}</span>
                            {finding.assignedTo && <span>{t("assignedTo", { name: finding.assignedTo ?? "" })}</span>}
                            <span>{t("updated", { date: new Date(finding.updatedAt).toLocaleDateString() })}</span>
                          </div>
                          <div className="flex gap-2 pt-1 flex-wrap">
                            {finding.status === 'draft' && <Button size="xs" variant="outline" className="text-green-600 border-green-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'open', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'open' } : f)) } catch {} }}><CheckCircle className="size-3 me-1" />{t("acceptFinding")}</Button>}
                            {finding.status === 'open' && <Button size="xs" variant="outline" className="text-purple-600 border-purple-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'in_review', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'in_review' } : f)) } catch {} }}><CheckCircle className="size-3 me-1" />{t("startReview")}</Button>}
                            {finding.status !== 'resolved' && finding.status !== 'dismissed' && <Button size="xs" variant="outline" className="text-red-600 border-red-300" onClick={async (e) => { e.stopPropagation(); try { const r = await updateFindingStatusAction(finding.id, 'dismissed', engagementId); if (r.finding) setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, status: 'dismissed' } : f)) } catch {} }}><XCircle className="size-3 me-1" />{t("dismissFinding")}</Button>}
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setLoadingLinked(true); try { const ev = await getEvidenceAction(engagementId); const linked = ev.filter(e => e.linkedEntities.some(le => le.targetId === finding.id || le.targetType === 'finding')); setLinkedEvidence(linked); setShowLinkedEvidence(finding) } catch {} finally { setLoadingLinked(false) } }}><FileText className="size-3 me-1" />{t("evidenceCount", { count: finding.relatedEvidenceIds?.length ?? 0 })}</Button>
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setLoadingLinkedRecs(true); try { const r = await getRecommendationsAction(engagementId); const recs = r.filter(re => re.findingId === finding.id); setLinkedRecs(recs); setShowLinkedRecs(finding) } catch {} finally { setLoadingLinkedRecs(false) } }}><ListChecks className="size-3 me-1" />{t("recommendations")}</Button>
                            <Button size="xs" variant="outline" onClick={async (e) => { e.stopPropagation(); setTraceFinding(finding); try { const trace = await getTraceabilityAction(engagementId, 'finding', finding.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }}>
                              <Share2 className="size-3 me-1" />{t("traceability")}
                            </Button>
                            {finding.aiSuggested && <Badge variant="outline" className="bg-purple-100 text-purple-700"><Sparkles className="size-3 me-1" />{t("aiSuggested")}</Badge>}
                          </div>
                          {finding.aiSuggested && (
                            <div className="mt-2 rounded border border-purple-200 bg-purple-50 p-2 text-xs text-purple-700">
                              {t("requiresHumanConfirmation")}
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
        {findHasMore && (
          <div className="flex justify-center py-3 border-t">
            <Button variant="outline" size="sm" disabled={loadingFindMore || generatingFindingDrafts} onClick={async () => {
              setLoadingFindMore(true)
              try {
                const nextPage = findPage + 1
                const r = await getFindingsPaginatedAction(engagementId, nextPage, FINDINGS_PAGE_SIZE)
                setFindings(prev => [...prev, ...r.items])
                setFindPage(nextPage)
                setFindHasMore(r.hasMore)
              } catch {} finally { setLoadingFindMore(false) }
            }}>
              {loadingFindMore ? <Loader2 className="size-4 me-1 animate-spin" /> : <RefreshCw className="size-4 me-1" />}
              {t("loadMore", { remaining: findTotal - findings.length })}
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={!!showLinkedEvidence} onOpenChange={() => setShowLinkedEvidence(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("linkedEvidenceTitle")}</DialogTitle><DialogDescription>{t("linkedEvidenceDescription", { title: showLinkedEvidence?.title ?? "" })}</DialogDescription></DialogHeader>
          {loadingLinked ? <div className="p-4 text-center text-sm text-muted-foreground">{t("loading")}</div> : linkedEvidence.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">{t("noLinkedEvidence")}</div> : (
            <div className="space-y-2">{[...new Set(linkedEvidence.map(e => e.id))].map(id => { const ev = linkedEvidence.find(e => e.id === id)!; return <div key={ev.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><FileText className="size-4 shrink-0 text-muted-foreground" /><span>{ev.filename}</span><Badge variant="outline" className="mr-auto text-[10px]">{evStateLabel[ev.state] || t("rejectedState")}</Badge></div> })}</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showLinkedRecs} onOpenChange={() => setShowLinkedRecs(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("linkedRecommendationsTitle")}</DialogTitle><DialogDescription>{t("linkedRecommendationsDescription", { title: showLinkedRecs?.title ?? "" })}</DialogDescription></DialogHeader>
          {loadingLinkedRecs ? <div className="p-4 text-center text-sm text-muted-foreground">{t("loading")}</div> : linkedRecs.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">{t("noLinkedRecs")}</div> : (
            <div className="space-y-2">{linkedRecs.map(rec => <div key={rec.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><ListChecks className="size-4 shrink-0 text-muted-foreground" /><span>{rec.title}</span><Badge variant="outline" className="mr-auto text-[10px]">{(rec.status as string) === "draft" ? t("recDraft") : (rec.status as string) === "approved" ? t("recApproved") : (rec.status as string) === "rejected" ? t("recRejected") : rec.status}</Badge></div>)}</div>
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
            <DialogTitle>{t("createDialogTitle")}</DialogTitle>
            <DialogDescription>{t("createDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("titleField")}</Label>
              <Input value={newFinding.title} onChange={e => setNewFinding({ ...newFinding, title: e.target.value })} placeholder={t("titlePlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("typeField")}</Label>
                <Select value={newFinding.findingType} onValueChange={v => { if (v !== null) { setNewFinding({ ...newFinding, findingType: v }) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material_misstatement">{t("materialMisstatement")}</SelectItem>
                    <SelectItem value="control_deficiency">{t("controlDeficiency")}</SelectItem>
                    <SelectItem value="disclosure_gap">{t("disclosureGap")}</SelectItem>
                    <SelectItem value="observation">{t("observation")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("severityField")}</Label>
                <Select value={newFinding.severity} onValueChange={v => { if (v !== null) { setNewFinding({ ...newFinding, severity: v }) } }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("low")}</SelectItem>
                    <SelectItem value="medium">{t("medium")}</SelectItem>
                    <SelectItem value="high">{t("high")}</SelectItem>
                    <SelectItem value="critical">{t("critical")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("descriptionField")}</Label>
              <Textarea value={newFinding.description} onChange={e => setNewFinding({ ...newFinding, description: e.target.value })} placeholder={t("descriptionPlaceholder")} />
            </div>
            <div>
              <Label>{t("rootCauseField")}</Label>
              <Input value={newFinding.rootCause} onChange={e => setNewFinding({ ...newFinding, rootCause: e.target.value })} placeholder={t("rootCausePlaceholder")} />
            </div>
            <div>
              <Label>{t("impactField")}</Label>
              <Input value={newFinding.impact} onChange={e => setNewFinding({ ...newFinding, impact: e.target.value })} placeholder={t("impactPlaceholder")} />
            </div>
          </div>
          {createError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="size-4 shrink-0" /><span>{createError}</span></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate} disabled={!newFinding.title.trim() || createSubmitting}>{createSubmitting ? t("creating") : t("create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
