"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertTriangle, CheckCircle, XCircle, Info, AlertOctagon, FileSearch, RotateCcw, ChevronDown, ChevronRight, Scale, MapPin, Activity, MinusCircle, FileSpreadsheet, TrendingUp, Bot, Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { ValidationRun, ValidationIssue, Engagement, AIAssistanceOutput } from "@/types/audit"
import { generateAnalyticalReviewAction } from "@/actions/audit-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getValidationRunAction, runValidationAction, getEngagementAction } from "@/actions/audit-read-actions"

const severityIcons: Record<string, React.ReactNode> = { error: <XCircle className="size-4 text-red-500" />, warning: <AlertTriangle className="size-4 text-amber-500" />, info: <Info className="size-4 text-blue-500" /> }
const checkIcons: Record<string, React.ReactNode> = {
  balance_equality: <Scale className="size-4" />, missing_mappings: <MapPin className="size-4" />,
  unusual_balance: <Activity className="size-4" />, negative_balance: <MinusCircle className="size-4" />,
  classification_conflict: <FileSpreadsheet className="size-4" />, prior_period_variance: <TrendingUp className="size-4" />,
  completeness: <CheckCircle className="size-4" />,
}

export default function ValidationPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [validation, setValidation] = useState<ValidationRun | null>(null)
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [disposeDialog, setDisposeDialog] = useState<{ issue: ValidationIssue; action: "accepted" | "dismissed" } | null>(null)
  const [disposeRationale, setDisposeRationale] = useState("")
  const [analyticalFlags, setAnalyticalFlags] = useState<AIAssistanceOutput[]>([])
  const [generatingReview, setGeneratingReview] = useState(false)

  useEffect(() => {
    Promise.all([getValidationRunAction(engagementId), getEngagementAction(engagementId)]).then(([v, e]) => {
      setValidation(v); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  const handleRunValidation = async () => {
    setRunning(true)
    const result = await runValidationAction(engagementId)
    setValidation(result)
    setRunning(false)
  }

  const handleDispose = () => {
    if (!disposeDialog) return
    setLoading(true)
    setTimeout(() => {
      setValidation(prev => {
        if (!prev) return prev
        return { ...prev, issues: prev.issues.map(i => i.id === disposeDialog.issue.id ? { ...i, status: disposeDialog.action, disposition: disposeRationale, disposedBy: "Current User", disposedAt: new Date().toISOString() } : i) }
      })
      setDisposeDialog(null)
      setDisposeRationale("")
      setLoading(false)
    }, 200)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!validation) return <Card><CardContent className="p-6 text-muted-foreground">No validation run found.</CardContent></Card>

  const errors = validation.issues.filter(i => i.severity === "error")
  const warnings = validation.issues.filter(i => i.severity === "warning")
  const infos = validation.issues.filter(i => i.severity === "info")

  const trustColors: Record<string, string> = { trusted: "bg-green-100 text-green-800 border-green-300", conditional: "bg-amber-100 text-amber-800 border-amber-300", blocked: "bg-red-100 text-red-800 border-red-300" }

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Validation</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={generatingReview} onClick={async () => { setGeneratingReview(true); try { const r = await generateAnalyticalReviewAction(engagementId); setAnalyticalFlags(prev => [...r, ...prev]) } catch {} finally { setGeneratingReview(false) } }} className="gap-1.5">
            {generatingReview ? <Loader2 className="size-3 animate-spin" /> : <Bot className="size-3" />} Analytical Review
          </Button>
          <Button variant="outline" onClick={handleRunValidation} disabled={running}>
            <RotateCcw className={`size-4 mr-1 ${running ? "animate-spin" : ""}`} />
            {running ? "Running..." : "Run Validation"}
          </Button>
        </div>
      </div>

      {analyticalFlags.length > 0 && (
        <Card className="border-violet-200">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              AI Analytical Review — Risk flags and observations
              <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">Requires human review</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {analyticalFlags.map(ai => {
              let parsed: Record<string, unknown> = {}
              try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { title: 'Analytical Flag', description: ai.outputContent } }
              const flagSeverity = String(parsed.severity ?? 'info')
              const sevColor = flagSeverity === 'warning' ? 'border-l-amber-400' : flagSeverity === 'error' ? 'border-l-red-400' : 'border-l-blue-400'
              const sevIcon = flagSeverity === 'warning' ? <AlertTriangle className="size-4 text-amber-500" /> : flagSeverity === 'error' ? <XCircle className="size-4 text-red-500" /> : <Info className="size-4 text-blue-500" />
              return (
                <div key={ai.id} className={`py-3 pl-4 border-l-4 ${sevColor}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{sevIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{String(parsed.title ?? '')}</span>
                        <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">{String(parsed.flagType ?? '')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{String(parsed.description ?? '')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{Math.round((ai.confidence ?? 0) * 100)}% confidence</span>
                        <Badge variant="outline" className={flagSeverity === 'warning' ? 'bg-amber-100 text-amber-700' : flagSeverity === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>{flagSeverity}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              <span className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={trustColors[validation.trustState]}>
                  <AlertTriangle className="size-3 mr-1" />Trust State: {validation.trustState}
                </Badge>
                <span className="text-sm">
                  {errors.length > 0 && <span className="text-red-600">{errors.length} errors</span>}
                  {errors.length > 0 && warnings.length > 0 && <span>, </span>}
                  {warnings.length > 0 && <span className="text-amber-600">{warnings.length} warnings</span>}
                  {(errors.length > 0 || warnings.length > 0) && <span> found</span>}
                  {errors.length === 0 && warnings.length === 0 && <span className="text-green-600">All checks passed</span>}
                </span>
              </span>
            </CardDescription>
          </div>
          <Badge variant="outline">{validation.validatedAt ? new Date(validation.validatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}</Badge>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {errors.map(issue => <IssueCard key={issue.id} issue={issue} onDispose={(issue, action) => setDisposeDialog({ issue, action })} />)}
        {warnings.map(issue => <IssueCard key={issue.id} issue={issue} onDispose={(issue, action) => setDisposeDialog({ issue, action })} />)}
        {infos.map(issue => <IssueCard key={issue.id} issue={issue} onDispose={(issue, action) => setDisposeDialog({ issue, action })} />)}
      </div>

      <Dialog open={!!disposeDialog} onOpenChange={() => { setDisposeDialog(null); setDisposeRationale("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{disposeDialog?.action === "accepted" ? "Accept" : "Dismiss"} Issue</DialogTitle>
            <DialogDescription>{disposeDialog?.issue.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="rationale">Rationale</Label>
            <Textarea id="rationale" placeholder="Provide reason for this disposition..." value={disposeRationale} onChange={e => setDisposeRationale(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDisposeDialog(null); setDisposeRationale("") }}>Cancel</Button>
            <Button onClick={handleDispose} disabled={!disposeRationale.trim()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IssueCard({ issue, onDispose }: { issue: ValidationIssue; onDispose: (issue: ValidationIssue, action: "accepted" | "dismissed") => void }) {
  const [expanded, setExpanded] = useState(false)
  const severityBg = issue.severity === "error" ? "border-l-red-500 bg-red-50/30" : issue.severity === "warning" ? "border-l-amber-500 bg-amber-50/30" : "border-l-blue-500 bg-blue-50/30"
  const statusColors: Record<string, string> = { open: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", dismissed: "bg-gray-100 text-gray-500", investigated: "bg-purple-100 text-purple-700" }

  return (
    <Card className={`border-l-4 ${severityBg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">{severityIcons[issue.severity]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{issue.description}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColors[issue.status]}`}>{issue.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">{checkIcons[issue.checkType]}{issue.checkType.replace(/_/g, " ")}</span>
                {issue.accountCode && <span className="font-mono">{issue.accountCode}</span>}
                {issue.accountName && <span>{issue.accountName}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{issue.message}</p>
              {issue.disposition && (
                <p className="text-xs mt-1 italic text-muted-foreground">Disposition: {issue.disposition}</p>
              )}
            </div>
          </div>
          {issue.status === "open" && (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button size="xs" variant="outline" className="text-green-600" onClick={() => onDispose(issue, "accepted")}>Accept</Button>
              <Button size="xs" variant="outline" className="text-muted-foreground" onClick={() => onDispose(issue, "dismissed")}>Dismiss</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
