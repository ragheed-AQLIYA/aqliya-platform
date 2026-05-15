"use client"

import { useTranslations } from "next-intl"
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

import PilotDemoFlow from "@/components/audit/pilot/pilot-demo-flow"

export default function PilotPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PilotDemoFlow />
      <PilotPageContent />
    </div>
  )
}

function PilotPageContent() {
  const t = useTranslations("audit.pilot")
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
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">{t("title")}</h1>
        <p className="text-sm text-muted-foreground break-words">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card className={openBlockers === 0 ? "border-emerald-300" : "border-amber-300"}>
          <CardContent className="p-3 sm:p-4 text-center">
            <Rocket className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-base sm:text-lg font-bold break-words">{openBlockers === 0 ? t("ready") : `${openBlockers} ${t("blockers")}`}</div>
            <div className="text-[10px] text-muted-foreground break-words">{t("productionReadiness")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <MessageSquare className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-base sm:text-lg font-bold">{feedback.length}</div>
            <div className="text-[10px] text-muted-foreground break-words">{t("feedbackItems")} {openFeedbacks > 0 ? `(${openFeedbacks} ${t("open")})` : ""}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Bug className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-base sm:text-lg font-bold">{blockers.length}</div>
            <div className="text-[10px] text-muted-foreground break-words">{t("blockersTitle")} ({openBlockers} {t("open")})</div>
          </CardContent>
        </Card>
        <Card className={allApproved ? "border-emerald-300" : ""}>
          <CardContent className="p-3 sm:p-4 text-center">
            <ListChecks className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
            <div className="text-base sm:text-lg font-bold">{signoffs.filter(s => s.status === "approved").length}/{signoffItems.length}</div>
            <div className="text-[10px] text-muted-foreground break-words">{t("signoffChecklist")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sign-off Checklist */}
      <Card>
        <CardHeader className="border-b px-3 sm:px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold break-words">
            <ListChecks className="size-4 shrink-0" />
            {t("signoffChecklist")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-3 sm:px-4">
          <div className="space-y-2">
            {signoffItems.map(item => {
              const signoff = signoffs.find(s => s.checklistItem === item)
              const isApproved = signoff?.status === "approved"
              return (
                <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {isApproved ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm break-words">{item}</span>
                    {signoff?.signedBy && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{t("by")} {signoff.signedBy}</span>
                    )}
                  </div>
                  <Button variant={isApproved ? "outline" : "default"} size="sm" className="self-start sm:self-auto" onClick={() => handleToggleSignoff(item)}>
                    {isApproved ? t("undo") : t("approve")}
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="mt-3 p-2 rounded border text-center text-sm">
            {allApproved ? (
              <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1 break-words">
                <CheckCircle2 className="size-4 shrink-0" /> {t("allComplete")}
              </span>
            ) : (
              <span className="text-amber-600 flex items-center justify-center gap-1 break-words">
                <AlertTriangle className="size-4 shrink-0" /> {signoffItems.length - signoffs.filter(s => s.status === "approved").length} {t("itemsRemaining")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Board */}
      <Card>
        <CardHeader className="border-b px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold break-words">
            <MessageSquare className="size-4 shrink-0" />
            {t("feedbackBoard")}
          </CardTitle>
          <Button size="sm" className="self-start sm:self-auto" onClick={() => setShowFeedbackDialog(true)}><Plus className="size-3 ml-1" />{t("addFeedback")}</Button>
        </CardHeader>
        <CardContent className="pt-3 px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Select value={fbFilterCat} onValueChange={(v) => { if (v !== null) setFbFilterCat(v) }}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder={t("categoryField")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {feedbackCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fbFilterStatus} onValueChange={(v) => { if (v !== null) setFbFilterStatus(v) }}>
              <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder={t("statusField")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="open">{t("statusOpen")}</SelectItem>
                <SelectItem value="in_review">{t("statusInReview")}</SelectItem>
                <SelectItem value="accepted">{t("statusAccepted")}</SelectItem>
                <SelectItem value="resolved">{t("statusResolved")}</SelectItem>
                <SelectItem value="dismissed">{t("statusDismissed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {feedback.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground break-words">{t("noFeedback")}</div>
          ) : (
            <div className="divide-y">
              {feedback
                .filter(f => fbFilterCat === "all" || f.category === fbFilterCat)
                .filter(f => fbFilterStatus === "all" || f.status === fbFilterStatus)
                .map(f => (
                <div key={f.id} className="py-2.5">
                  <div className="flex items-start justify-between cursor-pointer gap-2" onClick={() => setFbExpanded(fbExpanded === f.id ? null : f.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium break-words">{f.title}</span>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${severityColors[f.severity] ?? ""}`}>{f.severity}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-gray-50 shrink-0">{f.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[f.status] ?? ""}`}>{f.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">{t("source")} {f.source} — {new Date(f.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div className="shrink-0">{fbExpanded === f.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</div>
                  </div>
                  {fbExpanded === f.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm break-words">{f.description}</p>
                      {f.decision && <p className="text-xs break-words"><span className="font-medium">{t("decision")}</span> {f.decision}</p>}
                      {f.owner && <p className="text-xs break-words"><span className="font-medium">{t("owner")}</span> {f.owner}</p>}
                      {f.nextAction && <p className="text-xs break-words"><span className="font-medium">{t("nextAction")}</span> {f.nextAction}</p>}
                      <div className="flex flex-wrap items-center gap-1">
                        {f.status === "open" && <Button size="xs" variant="outline" onClick={() => handleUpdateFeedbackStatus(f.id, "in_review")} className="text-[10px]">{t("markInReview")}</Button>}
                        {f.status === "in_review" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "accepted")}>{t("accept")}</Button>}
                        {(f.status === "open" || f.status === "in_review") && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "dismissed")}>{t("dismiss")}</Button>}
                        {f.status === "accepted" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateFeedbackStatus(f.id, "resolved")}>{t("markResolved")}</Button>}
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
        <CardHeader className="border-b px-3 sm:px-4 py-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold break-words">
            <Bug className="size-4 shrink-0" />
            {t("productionBlockers")}
            {openBlockers > 0 && <Badge variant="outline" className="bg-red-100 text-red-700 text-[10px] shrink-0">{openBlockers} {t("open")}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-3 sm:px-4">
          {blockers.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground break-words">{t("noBlockers")}</div>
          ) : (
            <div className="divide-y">
              {blockers.map(b => (
                <div key={b.id} className="py-2.5">
                  <div className="flex items-start justify-between cursor-pointer gap-2" onClick={() => setBlockerExpanded(blockerExpanded === b.id ? null : b.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium break-words">{b.title}</span>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${severityColors[b.severity] ?? ""}`}>{b.severity}</Badge>
                        <Badge variant="outline" className="text-[10px] bg-gray-50 shrink-0">{b.category}</Badge>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[b.status] ?? ""}`}>{b.status}</Badge>
                        <Badge variant="outline" className="text-[10px] shrink-0">{t("before")} {b.requiredBefore}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0">{blockerExpanded === b.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</div>
                  </div>
                  {blockerExpanded === b.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm break-words">{b.description}</p>
                      {b.owner && <p className="text-xs break-words"><span className="font-medium">{t("owner")}</span> {b.owner}</p>}
                      {b.resolutionPlan && <p className="text-xs break-words"><span className="font-medium">{t("plan")}</span> {b.resolutionPlan}</p>}
                      <div className="flex flex-wrap items-center gap-1">
                        {b.status === "open" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateBlockerStatus(b.id, "in_progress")}>{t("inProgress")}</Button>}
                        {b.status === "in_progress" && <Button size="xs" variant="outline" className="text-[10px]" onClick={() => handleUpdateBlockerStatus(b.id, "resolved")}>{t("resolve")}</Button>}
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("dialogTitle")}</DialogTitle><DialogDescription>{t("dialogDescription")}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>{t("titleField")}</Label><Input value={newFeedback.title} onChange={e => setNewFeedback({ ...newFeedback, title: e.target.value })} placeholder={t("titlePlaceholder")} /></div>
            <div><Label>{t("descriptionField")}</Label><Textarea value={newFeedback.description} onChange={e => setNewFeedback({ ...newFeedback, description: e.target.value })} placeholder={t("descriptionPlaceholder")} /></div>
            <div><Label>{t("sourceField")}</Label><Input value={newFeedback.source} onChange={e => setNewFeedback({ ...newFeedback, source: e.target.value })} placeholder={t("sourcePlaceholder")} /></div>
            <div><Label>{t("categoryField")}</Label>
              <Select value={newFeedback.category} onValueChange={(v) => { if (v !== null) setNewFeedback({ ...newFeedback, category: v }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t("severityField")}</Label>
              <Select value={newFeedback.severity} onValueChange={(v) => { if (v !== null) setNewFeedback({ ...newFeedback, severity: v }) }}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>{t("cancel")}</Button>
            <Button disabled={!newFeedback.title.trim() || fbSubmitting} onClick={handleCreateFeedback}>{fbSubmitting ? t("saving") : t("saveFeedback")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
