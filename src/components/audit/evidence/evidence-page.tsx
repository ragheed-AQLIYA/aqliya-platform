"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FileText, FileSpreadsheet, File, Upload, User, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Link, ExternalLink, Search, Filter, Bot, Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { getTraceabilityAction, updateEvidenceStateAction, createEvidenceAction, linkEvidenceToEntityAction, generateEvidenceSuggestionsAction, acceptEvidenceSuggestionAction } from "@/actions/audit-actions"
import type { EvidenceObject, Engagement, Finding, AIAssistanceOutput } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getEvidenceAction, getEngagementAction, getFindingsAction } from "@/actions/audit-read-actions"

const stateColors: Record<string, string> = {
  missing: "bg-red-100 text-red-700 border-red-300", requested: "bg-blue-100 text-blue-700 border-blue-300",
  uploaded: "bg-gray-100 text-gray-700 border-gray-300", linked: "bg-purple-100 text-purple-700 border-purple-300",
  reviewed: "bg-amber-100 text-amber-700 border-amber-300", accepted: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
}
const stateIcons: Record<string, React.ReactNode> = {
  missing: <XCircle className="size-3" />, requested: <Clock className="size-3" />, uploaded: <Upload className="size-3" />,
  linked: <Link className="size-3" />, reviewed: <RefreshCw className="size-3" />, accepted: <CheckCircle className="size-3" />,
  rejected: <XCircle className="size-3" />,
}
const fileIcons: Record<string, React.ReactNode> = { xlsx: <FileSpreadsheet className="size-4" />, pdf: <FileText className="size-4" />, docx: <FileText className="size-4" /> }

export default function EvidencePage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [evidence, setEvidence] = useState<EvidenceObject[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEv, setSelectedEv] = useState<EvidenceObject | null>(null)
  const [traceEvOpen, setTraceEvOpen] = useState(false)
  const [traceEvData, setTraceEvData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [showRequest, setShowRequest] = useState(false)
  const [reqFilename, setReqFilename] = useState("")
  const [reqSubmitting, setReqSubmitting] = useState(false)
  const [reqFileType, setReqFileType] = useState("pdf")
  const [reqError, setReqError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkTargetType, setLinkTargetType] = useState("finding")
  const [linkTargetId, setLinkTargetId] = useState("")
  const [linkSubmitting, setLinkSubmitting] = useState(false)
  const [findingsList, setFindingsList] = useState<Finding[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<AIAssistanceOutput[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [acceptingSuggestionId, setAcceptingSuggestionId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getEvidenceAction(engagementId), getEngagementAction(engagementId)]).then(([e, eng]) => {
      setEvidence(e); setEngagement(eng); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (evidence.length === 0) return <Card><CardContent className="p-6 text-muted-foreground">No evidence found.</CardContent></Card>

  const missingCount = evidence.filter(e => e.state === "missing").length

  let filtered = evidence
  if (stateFilter !== "all") filtered = filtered.filter(e => e.state === stateFilter)
  if (search) filtered = filtered.filter(e => e.filename.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Evidence</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          {missingCount > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700">{missingCount} missing</Badge>
          )}
          <Button variant="outline" size="sm" onClick={async () => { setSuggesting(true); try { const result = await generateEvidenceSuggestionsAction(engagementId); setAiSuggestions(prev => [...result, ...prev]) } catch {} finally { setSuggesting(false) } }} disabled={suggesting} className="gap-1.5">
            {suggesting ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />} Suggest Evidence
          </Button>
          <Button onClick={() => setShowRequest(true)}><Upload className="size-4 mr-1" />Request Evidence</Button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              AI Evidence Suggestions — Requires human review
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">Not final</Badge>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              Suggested evidence items based on material balances and findings. Accept to create an evidence request, or reject to dismiss.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {aiSuggestions.map(ai => {
              let parsed: Record<string, unknown> = {}
              try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { reason: ai.outputContent } }
              return (
                <div key={ai.id} className="py-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{(parsed.filename as string) ?? "Evidence"}</span>
                      {ai.confidence !== null && (
                        <span className="text-[10px] text-muted-foreground">{Math.round(ai.confidence * 100)}% confidence</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{(parsed.reason as string) ?? ""}</p>
                    {(parsed.accountName as string | undefined) && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Related account: {String(parsed.accountName)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => { setAcceptingSuggestionId(ai.id); try { const r = await acceptEvidenceSuggestionAction(ai.id, engagementId); if (r.evidence) { setEvidence(prev => [r.evidence!, ...prev]); setAiSuggestions(prev => prev.filter(a => a.id !== ai.id)) } } catch {} finally { setAcceptingSuggestionId(null) } }}
                      disabled={acceptingSuggestionId === ai.id} title="Accept suggestion"
                    >
                      {acceptingSuggestionId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setAiSuggestions(prev => prev.filter(a => a.id !== ai.id))} title="Dismiss"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evidence Items</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search by filename..." className="w-56" value={search} onChange={e => setSearch(e.target.value)} />
              <Select value={stateFilter} onValueChange={(v) => { if (v !== null) { setStateFilter(v) } }}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Filter by state" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="linked">Linked</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Linked To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ev => (
                <TableRow key={ev.id} className="cursor-pointer" onClick={() => setSelectedEv(ev)}>
                  <TableCell className="flex items-center gap-2">
                    {fileIcons[ev.fileType] || <File className="size-4" />}
                    <span className="font-medium">{ev.filename}</span>
                    {ev.state === "missing" && <Badge variant="outline" className="bg-red-600 text-white border-red-600 text-[10px]">MISSING</Badge>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{ev.fileType.toUpperCase()}</Badge></TableCell>
                  <TableCell>{ev.uploadedBy || "-"}</TableCell>
                  <TableCell>{ev.uploadedAt ? new Date(ev.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${stateColors[ev.state] || ""} flex items-center gap-1 w-fit`}>
                      {stateIcons[ev.state]}{ev.state}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {ev.linkedEntities.map((le, i) => (
                      <Badge key={i} variant="outline" className="mr-1 text-[10px]">{le.targetLabel}</Badge>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showRequest} onOpenChange={(open) => { if (!open) { setShowRequest(false); setReqError(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request Evidence</DialogTitle><DialogDescription>Request a new evidence item from the client or team.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Label>Filename / Description</Label>
            <Input value={reqFilename} onChange={e => setReqFilename(e.target.value)} placeholder="e.g. inventory_count_sheet.pdf" />
            <Label>File Type</Label>
            <Select value={reqFileType} onValueChange={(v) => { if (v !== null) setReqFileType(v) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="docx">Word (DOCX)</SelectItem>
                <SelectItem value="jpg">Image (JPG)</SelectItem>
                <SelectItem value="png">Image (PNG)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            {reqError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle className="size-3 shrink-0" />{reqError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRequest(false); setReqError(null) }}>Cancel</Button>
            <Button disabled={!reqFilename.trim() || reqSubmitting} onClick={async () => {
              setReqSubmitting(true); setReqError(null)
              try {
                const result = await createEvidenceAction({ engagementId, filename: reqFilename.trim(), fileType: reqFileType, state: 'missing' })
                if (result.evidence) setEvidence(prev => [result.evidence, ...prev])
                setShowRequest(false); setReqFilename('')
              } catch (e: unknown) { setReqError(e instanceof Error ? e.message : 'Failed to create evidence request') } finally { setReqSubmitting(false) }
            }}>{reqSubmitting ? 'Requesting...' : 'Request Evidence'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Link Evidence</DialogTitle><DialogDescription>Link this evidence to a finding or other entity.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Target Type</Label>
              <Select value={linkTargetType} onValueChange={(v) => { if (v !== null) { setLinkTargetType(v); setLinkTargetId('') } }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="finding">Finding</SelectItem>
                  <SelectItem value="statement">Statement</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {linkTargetType === 'finding' && findingsList.length > 0 && (
              <div><Label>Select Finding</Label>
                <Select value={linkTargetId} onValueChange={(v) => { if (v !== null) setLinkTargetId(v) }}>
                  <SelectTrigger><SelectValue placeholder="Choose a finding..." /></SelectTrigger>
                  <SelectContent>
                    {findingsList.map(f => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {linkTargetType !== 'finding' && (
              <div><Label>Target ID</Label><Input value={linkTargetId} onChange={e => setLinkTargetId(e.target.value)} placeholder="Enter target ID" /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button disabled={!linkTargetId || linkSubmitting} onClick={async () => {
              setLinkSubmitting(true)
              try {
                await linkEvidenceToEntityAction({ engagementId, evidenceId: selectedEv!.id, targetType: linkTargetType, targetId: linkTargetId, context: 'User linked' })
                const updated = await getEvidenceAction(engagementId)
                setEvidence(updated)
                if (selectedEv) setSelectedEv(updated.find(e => e.id === selectedEv.id) ?? null)
                setShowLinkDialog(false)
              } catch {} finally { setLinkSubmitting(false) }
            }}>{linkSubmitting ? 'Linking...' : 'Link'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedEv && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setSelectedEv(null)}>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-background shadow-xl border-l p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Evidence Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEv(null)}><XCircle className="size-4" /></Button>
            </div>
            <div className="space-y-4 text-sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={async () => {
                  try {
                    const trace = await getTraceabilityAction(engagementId, 'evidence', selectedEv.id)
                    setTraceEvData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] })
                  } catch {
                    setTraceEvData({ forward: [], backward: [] })
                  }
                  setTraceEvOpen(true)
                }}
              >
                <ExternalLink className="size-3 mr-1" /> View Traceability
              </Button>
              <TraceabilityDrawer
                open={traceEvOpen}
                onClose={() => setTraceEvOpen(false)}
                entityType="evidence"
                entityId={selectedEv.id}
                entityLabel={selectedEv.filename}
                forwardTrace={traceEvData.forward}
                backwardTrace={traceEvData.backward}
              />
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Filename</div>
                <div className="font-medium flex items-center gap-2">{fileIcons[selectedEv.fileType]}{selectedEv.filename}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">Type</div>
                  <div>{selectedEv.fileType.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">Size</div>
                  <div>{selectedEv.fileSize > 0 ? `${(selectedEv.fileSize / 1024).toFixed(0)} KB` : "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">Uploaded By</div>
                  <div>{selectedEv.uploadedBy || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">Uploaded At</div>
                  <div>{selectedEv.uploadedAt ? new Date(selectedEv.uploadedAt).toLocaleDateString() : "-"}</div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">File Hash</div>
                <div className="font-mono text-xs">{selectedEv.fileHash || "N/A"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">State</div>
                <Badge variant="outline" className={`${stateColors[selectedEv.state]} flex items-center gap-1 w-fit`}>
                  {stateIcons[selectedEv.state]}{selectedEv.state}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Linked Entities</div>
                {selectedEv.linkedEntities.length > 0 ? selectedEv.linkedEntities.map((le, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                    <Badge variant="outline" className="text-[10px]">{le.linkType}</Badge>
                    <span className="text-xs">{le.targetLabel}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{le.targetType}</Badge>
                  </div>
                )) : <div className="text-xs text-muted-foreground italic">No linked entities</div>}
              </div>
              {actionError && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle className="size-3 shrink-0" /><span>{actionError}</span></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={async () => { setLinkTargetId(''); setLinkTargetType('finding'); try { const f = await getFindingsAction(engagementId); setFindingsList(f) } catch {} setShowLinkDialog(true) }}>
                  <Link className="size-4 mr-1" />Link to Finding
                </Button>
                <Button size="sm" variant="outline" className="flex-1" disabled={selectedEv.state === 'accepted' || selectedEv.state === 'rejected'} onClick={async () => {
                  setActionError(null)
                  try { const result = await updateEvidenceStateAction(selectedEv.id, 'accepted'); if (result.evidence) { setEvidence(prev => prev.map(e => e.id === selectedEv.id ? { ...e, state: 'accepted' } : e)); setSelectedEv({ ...selectedEv, state: 'accepted' }) } } catch { setActionError('Failed to verify evidence') } }}>
                  <CheckCircle className="size-4 mr-1" />Verify
                </Button>
                <Button size="sm" variant="outline" className="flex-1" disabled={selectedEv.state === 'accepted' || selectedEv.state === 'rejected'} onClick={async () => {
                  setActionError(null)
                  try { const result = await updateEvidenceStateAction(selectedEv.id, 'reviewed'); if (result.evidence) { setEvidence(prev => prev.map(e => e.id === selectedEv.id ? { ...e, state: 'reviewed' } : e)); setSelectedEv({ ...selectedEv, state: 'reviewed' }) } } catch { setActionError('Failed to update evidence') } }}>
                  <Link className="size-4 mr-1" />Mark Reviewed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
