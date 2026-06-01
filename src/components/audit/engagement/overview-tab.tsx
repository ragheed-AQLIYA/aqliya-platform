"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getTrialBalanceAction, getMappingsAction, getEvidenceAction, getMissingEvidenceAction,
  getFindingsAction, getReviewCommentsAction, getOpenReviewCountAction, getApprovalStatusAction,
  getAuditEventsAction, getWorkflowReadinessAction,
} from "@/actions/audit-read-actions"
import type { Engagement, TrialBalance, AuditEvent } from "@/types/audit"
import type { WorkflowContext } from "@/lib/audit/workflow-gating"
import { evaluateTabGate } from "@/lib/audit/workflow-gating"
import {
  getNextWorkflowAction,
  getApprovalStatusLabel,
} from "@/lib/audit/workflow-next-action"
import { RecentActivity } from "@/components/audit/dashboard/recent-activity"
import {
  FileSpreadsheet, Network, FileSearch, FileText, Scale, MessageSquare,
  CheckCircle, Users, ArrowRight, Lock, Compass,
} from "lucide-react"
import Link from "next/link"

function engagementHref(engagementId: string, step: string) {
  return `/audit/engagements/${engagementId}/${step}`
}

const workflowSteps = [
  { key: "trial-balance", label: "ميزان المراجعة", icon: FileSpreadsheet },
  { key: "mapping", label: "تعيين الحسابات", icon: Network },
  { key: "validation", label: "التحقق", icon: Network },
  { key: "statements", label: "القوائم المالية", icon: FileText },
  { key: "notes", label: "الإيضاحات", icon: FileText },
  { key: "evidence", label: "الأدلة", icon: FileSearch },
  { key: "findings", label: "النتائج", icon: Scale },
  { key: "recommendations", label: "التوصيات", icon: FileText },
  { key: "review", label: "المراجعة", icon: MessageSquare },
  { key: "approval", label: "الاعتماد", icon: CheckCircle },
  { key: "publication", label: "النشر", icon: FileText },
]

const sarFormatter = new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 0, maximumFractionDigits: 0 })

interface OverviewTabProps {
  engagementId: string
  engagement: Engagement
}

export function OverviewTab({ engagementId, engagement }: OverviewTabProps) {
  const [tb, setTb] = useState<TrialBalance | null>(null)
  const [mappings, setMappings] = useState<{ total: number; confirmed: number }>({ total: 0, confirmed: 0 })
  const [evidence, setEvidence] = useState<{ uploaded: number; missing: number }>({ uploaded: 0, missing: 0 })
  const [findings, setFindings] = useState<{ total: number; open: number }>({ total: 0, open: 0 })
  const [openReviews, setOpenReviews] = useState(0)
  const [approvalStatus, setApprovalStatus] = useState<{ status: string; blockingIssues: string[] }>({ status: "not_ready", blockingIssues: [] })
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null)
  const [blockingIssues, setBlockingIssues] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const [tbData, mappingsData, evidenceData, missingData, findingsData, reviews, approval, auditEvents, readiness] = await Promise.all([
        getTrialBalanceAction(engagementId),
        getMappingsAction(engagementId),
        getEvidenceAction(engagementId),
        getMissingEvidenceAction(engagementId),
        getFindingsAction(engagementId),
        getOpenReviewCountAction(engagementId),
        getApprovalStatusAction(engagementId),
        getAuditEventsAction(engagementId),
        getWorkflowReadinessAction(engagementId).catch(() => null),
      ])

      if (tbData) setTb(tbData)
      setMappings({ total: mappingsData.length, confirmed: mappingsData.filter((m) => m.status === "confirmed").length })
      setEvidence({ uploaded: evidenceData.filter((e) => e.state !== "missing").length, missing: missingData.length })
      setFindings({ total: findingsData.length, open: findingsData.filter((f) => f.status === "open" || f.status === "in_review").length })
      setOpenReviews(reviews)
      setApprovalStatus({ status: approval.status, blockingIssues: [...approval.blockingIssues] })
      setEvents(auditEvents.slice(-3).reverse())
      if (readiness) {
        setWorkflowContext(readiness.context)
        setBlockingIssues([...readiness.workflowStatus.blockingIssues])
      }
    }
    load()
  }, [engagementId])

  const nextAction = workflowContext
    ? getNextWorkflowAction(engagementId, workflowContext, blockingIssues)
    : null

  const metrics = [
    {
      label: "ميزان المراجعة",
      icon: FileSpreadsheet,
      content: tb ? (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">إجمالي الديون:</span><span className="font-medium">{sarFormatter.format(tb.totalDebits)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">إجمالي الدائنين:</span><span className="font-medium">{sarFormatter.format(tb.totalCredits)}</span></div>
          <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">الفرق:</span><span className={`font-medium ${tb.variance !== 0 ? "text-destructive" : "text-emerald-600"}`}>{sarFormatter.format(tb.variance)}</span></div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">غير مستورد</span>
      ),
    },
    {
      label: "تقدم التعيين",
      icon: Network,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{mappings.confirmed}<span className="text-sm font-normal text-muted-foreground"> / {mappings.total}</span></div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: mappings.total > 0 ? `${(mappings.confirmed / mappings.total) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">حسابات معينة</span>
        </div>
      ),
    },
    {
      label: "الأدلة",
      icon: FileSearch,
      content: (
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-emerald-600">{evidence.uploaded}</span>
            <span className="text-sm text-muted-foreground">مرفوع</span>
          </div>
          {evidence.missing > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-destructive">{evidence.missing}</span>
              <span className="text-sm text-muted-foreground">مفقود</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "النتائج",
      icon: Scale,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{findings.total}</div>
          <span className="text-xs text-muted-foreground">{findings.open} مفتوحة</span>
        </div>
      ),
    },
    {
      label: "حالة المراجعة",
      icon: MessageSquare,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{openReviews}</div>
          <span className="text-xs text-muted-foreground">{openReviews === 1 ? "تعليق مفتوح" : "تعليقات مفتوحة"}</span>
        </div>
      ),
    },
    {
      label: "حالة الاعتماد",
      icon: CheckCircle,
      content: (
        <div className="space-y-1">
          <Badge variant={approvalStatus.status === "ready" ? "default" : approvalStatus.status === "blocked" ? "destructive" : "secondary"}>
            {getApprovalStatusLabel(approvalStatus.status)}
          </Badge>
          {approvalStatus.blockingIssues.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {approvalStatus.blockingIssues.slice(0, 2).map((issue) => (
                <li key={issue} className="text-xs text-destructive">{issue}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {nextAction && (
        <Card className={nextAction.urgent ? "border-destructive/50 bg-destructive/5" : "border-primary/30 bg-primary/5"}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Compass className="h-4 w-4 text-primary" />
              الخطوة التالية
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{nextAction.label}</p>
              {nextAction.reason && (
                <p className="text-xs text-muted-foreground">{nextAction.reason}</p>
              )}
            </div>
            <Link
              href={nextAction.href}
              className={cn(
                buttonVariants({
                  size: "sm",
                  variant: nextAction.urgent ? "destructive" : "default",
                }),
              )}
            >
              متابعة
              <ArrowRight className="mr-1 h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metric.content}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              أعضاء الفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagement.team.length > 0 ? (
              <div className="space-y-3">
                {engagement.team.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {member.userName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.userName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لم يتم تعيين أعضاء فريق</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity events={events} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            خطوات سير العمل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-11">
            {workflowSteps.map((step) => {
              const gate = workflowContext
                ? evaluateTabGate(step.key, workflowContext)
                : { locked: false as const }
              const locked = gate.locked

              if (locked) {
                return (
                  <div
                    key={step.key}
                    title={gate.reason}
                    className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center opacity-60 cursor-not-allowed"
                  >
                    <Lock className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs font-medium">{step.label}</span>
                    {gate.reason && (
                      <span className="text-[10px] text-muted-foreground line-clamp-2">{gate.reason}</span>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={step.key}
                  href={engagementHref(engagementId, step.key)}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-accent"
                >
                  <step.icon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium">{step.label}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
