"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Rocket, CheckCircle2, XCircle, AlertTriangle, Plus, Loader2, MessageSquare, Bug, Target, ListChecks, ExternalLink, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getEngagementAction } from "@/actions/audit-read-actions"
import {
  createPilotFeedbackAction, updatePilotFeedbackStatusAction, getPilotFeedbackAction,
  createProductionBlockerAction, updateProductionBlockerStatusAction, getProductionBlockersAction,
  createOrUpdatePilotSignoffAction, getPilotSignoffChecklistAction,
} from "@/actions/audit-actions"
import type { Engagement, PilotFeedback, ProductionBlocker, PilotSignoff } from "@/types/audit"

const feedbackCategories = ["Workflow", "Audit methodology", "AI output", "Traceability", "UX", "Export", "Security", "Performance", "Client request", "Bug"]
const severityColors: Record<string, string> = { low: "bg-green-100 text-green-700", medium: "bg-amber-100 text-amber-700", high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" }
const statusColors: Record<string, string> = { open: "bg-blue-100 text-blue-700", in_review: "bg-purple-100 text-purple-700", resolved: "bg-green-100 text-green-700", dismissed: "bg-gray-100 text-gray-600", accepted: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700" }
const blockerCategories = ["Security", "Infrastructure", "Auth", "Export", "Performance", "Compliance", "Integration", "Other"]
const signoffItems = ["Internal demo completed", "Client walkthrough completed", "Limitations acknowledged", "Pilot scope approved", "Pilot data approved", "Pilot users assigned", "Pilot start approved"]

export default function PilotPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<PilotFeedback[]>([])
  const [blockers, setBlockers] = useState<ProductionBlocker[]>([])
  const [signoffs, setSignoffs] = useState<PilotSignoff[]>([])

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [newFeedback, setNewFeedback] = useState({ title: "", description: "", source: "", category: "Workflow", severity: "medium" })
  const [fbExpanded, setFbExpanded] = useState<string | null>(null)
  const [fbFilterCat, setFbFilterCat] = useState("all")
  const [fbFilterStatus, setFbFilterStatus] = useState("all")
  const [fbSubmitting, setFbSubmitting] = useState(false)
  const [blockerExpanded, setBlockerExpanded] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [eng, fb, bl, si] = await Promise.all([
      getEngagementAction(engagementId),
      getPilotFeedbackAction(engagementId),
      getProductionBlockersAction(),
      getPilotSignoffChecklistAction(engagementId),
    ])
    setEngagement(eng)
    setFeedback(fb)
    setBlockers(bl)
    setSignoffs(si)
    setLoading(false)
  }, [engagementId])

  useEffect(() => { loadData() }, [loadData])

  const handleCreateFeedback = async () => {
    if (!newFeedback.title.trim()) return
    setFbSubmitting(true)
    try {
      const result = await createPilotFeedbackAction({ engagementId, ...newFeedback })
      setFeedback(prev => [result, ...prev])
      setShowFeedbackDialog(false)
      setNewFeedback({ title: "", description: "", source: "", category: "Workflow", severity: "medium" })
    } catch {} finally { setFbSubmitting(false) }
  }

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    await updatePilotFeedbackStatusAction(id, engagementId, status)
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f))
  }

  const handleUpdateBlockerStatus = async (id: string, status: string) => {
    await updateProductionBlockerStatusAction(id, status)
    setBlockers(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const handleToggleSignoff = async (item: string) => {
    const current = signoffs.find(s => s.checklistItem === item)
    const newStatus = current?.status === "approved" ? "pending" : "approved"
    const result = await createOrUpdatePilotSignoffAction({ engagementId, checklistItem: item, status: newStatus })
    setSignoffs(prev => prev.filter(s => s.checklistItem !== item).concat(result))
  }

  const allApproved = signoffItems.every(item => signoffs.find(s => s.checklistItem === item)?.status === "approved")
  const openFeedbacks = feedback.filter(f => f.status === "open").length
  const openBlockers = blockers.filter(b => b.status === "open").length

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6" dir="ltr">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pilot Readiness</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className={openBlockers === 0 ? "border-emerald-300" : "border-amber-300"}>
          <CardContent className="p-4 text-center">
            <Rocket className="size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{openBlockers === 0 ? "Ready" : `${openBlockers} blockers`}</div>
            <div className="text-[10px] text-muted-foreground">Production Readiness</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{feedback.length}</div>
            <div className="text-[10px] text-muted-foreground">Feedback Items {openFeedbacks > 0 ? `(${openFeedbacks} open)` : ""}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bug className="size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{blockers.length}</div>
            <div className="text-[10px] text-muted-foreground">Blockers ({openBlockers} open)</div>
          </CardContent>
        </Card>
        <Card className={allApproved ? "border-emerald-300" : ""}>
          <CardContent className="p-4 text-center">
            <ListChecks className="size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{signoffs.filter(s => s.status === "approved").length}/{signoffItems.length}</div>
            <div className="text-[10px] text-muted-foreground">Sign-off Checklist</div>
          </CardContent>
        </Card>
      </div>

      {/* Sign-off Checklist */}
      <Card>
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="size-4" />
            Pilot Sign-off Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            {signoffItems.map(item => {
              const signoff = signoffs.find(s => s.checklistItem === item)
              const isApproved = signoff?.status === "approved"
              return (
                <div key={item} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{item}</span>
                    {signoff?.signedBy && (
                      <span className="text-[10px] text-muted-foreground">by {signoff.signedBy}</span>
                    )}
                  </div>
                  <Button variant={isApproved ? "outline" : "default"} size="sm" onClick={() => handleToggleSignoff(item)}>
                    {isApproved ? "Undo" : "Approve"}
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="mt-3 p-2 rounded border text-center text-sm">
            {allApproved ? (
              <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="size-4" /> All sign-off items complete — Ready for pilot
              </span>
            ) : (
              <span className="text-amber-600 flex items-center justify-center gap-1">
                <AlertTriangle className="size-4" /> {signoffItems.length - signoffs.filter(s => s.status === "approved").length} items remaining
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Board */}
      <Card>
        <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="size-4" />
            Pilot Feedback Board
          </CardTitle>
          <Button size="sm" onClick={() => setShowFeedbackDialog(true)}><Plus className="size-3 mr-1" />Add Feedback</Button>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Select value={fbFilterCat} onValueChange={(v) => { if (v !== null) setFbFilterCat(v) }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {feedbackCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fbFilterStatus} onValueChange={(v) => { if (v !== null) setFbFilterStatus(v) }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {feedback.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No feedback recorded yet. Click &quot;Add Feedback&quot; to start.</div>
          ) : (
            <div className="divide-y">
              {feedback
                .filter(f => fbFilterCat === "all" || f.category === fbFilterCat)
                .filter(f => fbFilterStatus === "all" || f.status === fbFilterStatus)
                .map(f => (
                <div key={f.id} className="py-2.5">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setFbExpanded(fbExpanded === f.id ? null : f.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{f.title}</span>
                        <Badge variant="outline" className={`text-[10px] ${severityColors[f.severity] ?? ""}`}>{f.severity}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-gray-50">{f.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[f.status] ?? ""}`}>{f.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Source: {f.source} — {new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-2">{fbExpanded === f.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</div>
                  </div>
                  {fbExpanded === f.id && (
                    <div className="mt-2 ml-4 space-y-2">
                      <p className="text-sm">{f.description}</p>
                      {f.decision && <p className="text-xs"><span className="font-medium">Decision:</span> {f.decision}</p>}
                      {f.owner && <p className="text-xs"><span className="font-medium">Owner:</span> {f.owner}</p>}
                      {f.nextAction && <p className="text-xs"><span className="font-medium">Next action:</span> {f.nextAction}</p>}
                      <div className="flex items-center gap-1 flex-wrap">
                        {f.status === "open" && <Button size="xs" variant="outline" onClick={() => handleUpdateFeedbackStatus(f.id, "in_review")} className="text-[10px]">Mark In Review</Button>}
                        {f.status === "in_review" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "accepted")}>Accept</Button>}
                        {(f.status === "open" || f.status === "in_review") && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "dismissed")}>Dismiss</Button>}
                        {f.status === "accepted" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "resolved")}>Mark Resolved</Button>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Blockers */}
      <Card>
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bug className="size-4" />
            Production Blockers
            {openBlockers > 0 && <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px]">{openBlockers} open</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {blockers.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">No production blockers defined.</div>
          ) : (
            <div className="divide-y">
              {blockers.map(b => (
                <div key={b.id} className="py-2.5">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setBlockerExpanded(blockerExpanded === b.id ? null : b.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{b.title}</span>
                        <Badge variant="outline" className={`text-[10px] ${severityColors[b.severity] ?? ""}`}>{b.severity}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-gray-50">{b.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[b.status] ?? ""}`}>{b.status}</Badge>
                        <Badge variant="outline" className="text-[10px]">Before: {b.requiredBefore}</Badge>
                      </div>
                    </div>
                    <div>{blockerExpanded === b.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</div>
                  </div>
                  {blockerExpanded === b.id && (
                    <div className="mt-2 ml-4 space-y-2">
                      <p className="text-sm">{b.description}</p>
                      {b.owner && <p className="text-xs"><span className="font-medium">Owner:</span> {b.owner}</p>}
                      {b.resolutionPlan && <p className="text-xs"><span className="font-medium">Plan:</span> {b.resolutionPlan}</p>}
                      <div className="flex items-center gap-1">
                        {b.status === "open" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateBlockerStatus(b.id, "in_progress")}>In Progress</Button>}
                        {b.status === "in_progress" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateBlockerStatus(b.id, "resolved")}>Resolve</Button>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Pilot Feedback</DialogTitle><DialogDescription>Record feedback from demo or pilot sessions.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={newFeedback.title} onChange={e => setNewFeedback({ ...newFeedback, title: e.target.value })} placeholder="Brief title" /></div>
            <div><Label>Description</Label><Textarea value={newFeedback.description} onChange={e => setNewFeedback({ ...newFeedback, description: e.target.value })} placeholder="Describe the feedback..." /></div>
            <div><Label>Source</Label><Input value={newFeedback.source} onChange={e => setNewFeedback({ ...newFeedback, source: e.target.value })} placeholder="e.g. Client, Internal team" /></div>
            <div><Label>Category</Label>
              <Select value={newFeedback.category} onValueChange={(v) => { if (v !== null) setNewFeedback({ ...newFeedback, category: v }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Severity</Label>
              <Select value={newFeedback.severity} onValueChange={(v) => { if (v !== null) setNewFeedback({ ...newFeedback, severity: v }) }}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button disabled={!newFeedback.title.trim() || fbSubmitting} onClick={handleCreateFeedback}>{fbSubmitting ? "Saving..." : "Save Feedback"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
