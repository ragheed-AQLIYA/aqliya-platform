"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  CheckCircle2, Circle, ArrowRight, ShieldCheck, Eye, FileText,
  FileSpreadsheet, Link2, AlertTriangle, FolderOpen, SearchCheck,
  ListChecks, ClipboardCheck, ExternalLink, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDisclosureNotesAction, getEvidenceAction, getFindingsAction, getMappingsAction, getTrialBalanceAction, getFinancialStatementsAction, getEngagementAction } from "@/actions/audit-read-actions"
import { getApprovalStatusAction } from "@/actions/audit-read-actions"

interface DemoStep {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  trustCheckpoint: string
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: "engagement",
    label: "Engagement",
    href: "",
    icon: ClipboardCheck,
    description: "Review engagement overview, team, and alerts.",
    trustCheckpoint: "Engagement scope and team assignment confirmed.",
  },
  {
    id: "trial-balance",
    label: "Trial Balance",
    href: "/trial-balance",
    icon: FileSpreadsheet,
    description: "Verify imported trial balance — debits equal credits.",
    trustCheckpoint: "TB variance = SAR 0. Data integrity confirmed.",
  },
  {
    id: "mapping",
    label: "Mapping",
    href: "/mapping",
    icon: Link2,
    description: "Review account mappings to canonical chart of accounts.",
    trustCheckpoint: "All accounts mapped and confirmed by human reviewer.",
  },
  {
    id: "statements",
    label: "Financial Statements",
    href: "/statements",
    icon: FileText,
    description: "Review draft income statement, balance sheet, and equity.",
    trustCheckpoint: "Statements auto-generated from confirmed mappings.",
  },
  {
    id: "notes",
    label: "Disclosure Notes",
    href: "/notes",
    icon: FileText,
    description: "Review 14 auto-generated disclosure notes with evidence requirements.",
    trustCheckpoint: "Notes are draft — human review and evidence linkage required.",
  },
  {
    id: "evidence",
    label: "Evidence",
    href: "/evidence",
    icon: FolderOpen,
    description: "Check evidence collection status and missing items.",
    trustCheckpoint: "Evidence governs — no note approved without supporting evidence.",
  },
  {
    id: "findings",
    label: "Findings",
    href: "/findings",
    icon: SearchCheck,
    description: "Review audit findings and their severity.",
    trustCheckpoint: "All findings require human assessment and resolution.",
  },
  {
    id: "review",
    label: "Review",
    href: "/review",
    icon: Eye,
    description: "Review comments queue and unresolved items.",
    trustCheckpoint: "AI assists. Humans decide. Every review action is human-triggered.",
  },
  {
    id: "approval",
    label: "Approval",
    href: "/approval",
    icon: ShieldCheck,
    description: "Check approval readiness and blocking issues.",
    trustCheckpoint: "No AI auto-approval. Final sign-off is human-only.",
  },
]

export default function PilotDemoFlow() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [loading, setLoading] = useState(true)
  const [stepStatus, setStepStatus] = useState<Record<string, "complete" | "partial" | "pending">>({})
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    try {
      const [engagement, tb, mappings, statements, notes, evidence, findings, approval] = await Promise.allSettled([
        getEngagementAction(engagementId),
        getTrialBalanceAction(engagementId),
        getMappingsAction(engagementId),
        getFinancialStatementsAction(engagementId),
        getDisclosureNotesAction(engagementId),
        getEvidenceAction(engagementId),
        getFindingsAction(engagementId),
        getApprovalStatusAction(engagementId),
      ])

      const status: Record<string, "complete" | "partial" | "pending"> = {}

      // Engagement
      if (engagement.status === "fulfilled" && engagement.value) status.engagement = "complete"
      else status.engagement = "pending"

      // Trial Balance
      if (tb.status === "fulfilled" && tb.value && tb.value.variance === 0) status["trial-balance"] = "complete"
      else if (tb.status === "fulfilled" && tb.value) status["trial-balance"] = "partial"
      else status["trial-balance"] = "pending"

      // Mapping
      if (mappings.status === "fulfilled") {
        const confirmed = mappings.value.filter(m => m.status === "confirmed").length
        const total = mappings.value.length
        if (total > 0 && confirmed === total) status.mapping = "complete"
        else if (confirmed > 0) status.mapping = "partial"
        else status.mapping = "pending"
      } else status.mapping = "pending"

      // Statements
      if (statements.status === "fulfilled" && statements.value.length > 0) status.statements = "complete"
      else status.statements = "pending"

      // Notes
      if (notes.status === "fulfilled") {
        const reviewed = notes.value.filter(n => n.status === "reviewed" || n.status === "approved").length
        if (notes.value.length >= 14 && reviewed > 0) status.notes = "partial"
        else if (notes.value.length >= 14) status.notes = "complete"
        else status.notes = "pending"
      } else status.notes = "pending"

      // Evidence
      if (evidence.status === "fulfilled") {
        const missing = evidence.value.filter(e => e.state === "missing").length
        if (missing === 0 && evidence.value.length > 0) status.evidence = "complete"
        else if (evidence.value.length > 0) status.evidence = "partial"
        else status.evidence = "pending"
      } else status.evidence = "pending"

      // Findings
      if (findings.status === "fulfilled" && findings.value.length > 0) status.findings = "complete"
      else status.findings = "pending"

      // Review
      if (approval.status === "fulfilled") {
        const blocking = approval.value.blockingIssues.length
        if (blocking === 0) status.review = "complete"
        else status.review = "partial"
      } else status.review = "pending"

      // Approval
      if (approval.status === "fulfilled" && approval.value.status === "ready") status.approval = "complete"
      else if (approval.status === "fulfilled") status.approval = "partial"
      else status.approval = "pending"

      setStepStatus(status)
    } catch {
      const fallbackStatus: Record<string, "complete" | "partial" | "pending"> = {}
      DEMO_STEPS.forEach(s => { fallbackStatus[s.id] = "pending" })
      setStepStatus(fallbackStatus)
    } finally {
      setLoading(false)
    }
  }, [engagementId])

  useEffect(() => { loadStatus() }, [loadStatus])

  const completedCount = Object.values(stepStatus).filter(s => s === "complete").length
  const totalCount = DEMO_STEPS.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />Loading demo flow...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <ShieldCheck className="size-4 sm:size-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-emerald-800 break-words">Pilot Demo Flow</h2>
              <p className="text-xs text-emerald-700/80 mt-0.5 break-words">
                Walk through the audit workflow step by step. Each step links to the relevant page for live demonstration.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-[10px] font-medium text-emerald-700 whitespace-nowrap">{completedCount}/{totalCount} steps</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core principle banner */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2">
          <ShieldCheck className="size-4 text-amber-600 shrink-0" />
          <p className="text-xs font-medium text-amber-800 break-words">AI assists. Humans decide. Evidence governs.</p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-2">
        {DEMO_STEPS.map((step, index) => {
          const status = stepStatus[step.id] ?? "pending"
          const isExpanded = expandedStep === step.id
          const isLast = index === DEMO_STEPS.length - 1
          const stepHref = `/audit/engagements/${engagementId}${step.href}`

          return (
            <div key={step.id}>
              <Card
                className={`cursor-pointer transition-colors ${
                  status === "complete" ? "border-emerald-200" : status === "partial" ? "border-amber-200" : "border-slate-200"
                } ${isExpanded ? "ring-1 ring-primary/10" : ""}`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                    {/* Step number / status icon */}
                    <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 sm:mt-0">
                      {status === "complete" ? (
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      ) : status === "partial" ? (
                        <div className="size-5 rounded-full border-2 border-amber-400 bg-amber-100 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-amber-600">{index + 1}</span>
                        </div>
                      ) : (
                        <div className="size-5 rounded-full border-2 border-slate-300 bg-slate-50 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-slate-500">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Step info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <step.icon className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium break-words">{step.label}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] shrink-0 ${
                            status === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            status === "partial" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {status === "complete" ? "Complete" : status === "partial" ? "In Progress" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{step.description}</p>
                    </div>

                    {/* Navigate button */}
                    <Button
                      size="xs"
                      variant="outline"
                      className="shrink-0 mt-1 sm:mt-0"
                      onClick={(e) => { e.stopPropagation(); window.location.href = stepHref }}
                    >
                      <ExternalLink className="size-3 mr-1" />Open
                    </Button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="rounded border border-blue-100 bg-blue-50/60 p-2">
                        <p className="text-[11px] text-blue-800 break-words">
                          <ShieldCheck className="inline size-3 mr-1" />
                          <span className="font-medium">Trust checkpoint:</span> {step.trustCheckpoint}
                        </p>
                      </div>
                      {status !== "complete" && (
                        <p className="text-[11px] text-amber-700 flex items-center gap-1 break-words">
                          <AlertTriangle className="size-3 shrink-0" />
                          This step requires human review before proceeding.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connector arrow */}
              {!isLast && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="size-3 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer reminder */}
      <Card className="border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-start sm:items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 mt-0.5 sm:mt-0" />
            <span className="break-words">All draft content requires explicit human approval. AI-generated outputs cannot be final without human review.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
