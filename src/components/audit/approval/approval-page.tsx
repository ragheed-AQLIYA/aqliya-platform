"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, AlertTriangle, Clock, User, Shield, ArrowRight, ChevronDown, ChevronRight, ListChecks, History, Ban, Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

import { getTraceabilityAction, createApprovalRecordAction } from "@/actions/audit-actions"
import type { ApprovalRecord, Engagement } from "@/types/audit"
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer"
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer"
import { getApprovalRecordsAction, getApprovalStatusAction, getEngagementAction } from "@/actions/audit-read-actions"

const statusColors: Record<string, string> = { not_ready: "bg-gray-100 text-gray-600", ready: "bg-green-100 text-green-700", pending_approval: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", blocked: "bg-red-100 text-red-700" }
const actionIcons: Record<string, React.ReactNode> = { approved: <CheckCircle className="size-4 text-green-600" />, rejected: <XCircle className="size-4 text-red-600" />, modifications_requested: <AlertTriangle className="size-4 text-amber-600" /> }

export default function ApprovalPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [records, setRecords] = useState<ApprovalRecord[]>([])
  const [approvalInfo, setApprovalInfo] = useState<{ status: string; blockingIssues: readonly string[]; checklist: Array<{ label: string; passed: boolean; detail: string }> }>({ status: "not_ready", blockingIssues: [], checklist: [] })
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [approveError, setApproveError] = useState<string | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [traceApproval, setTraceApproval] = useState<ApprovalRecord | null>(null)
  const [traceabilityOpen, setTraceabilityOpen] = useState(false)
  const [traceData, setTraceData] = useState<{ forward: TraceabilityNode[]; backward: TraceabilityNode[] }>({ forward: [], backward: [] })

  useEffect(() => {
    Promise.all([getApprovalRecordsAction(engagementId), getApprovalStatusAction(engagementId), getEngagementAction(engagementId)]).then(([r, a, e]) => {
      setRecords(r); setApprovalInfo({ status: a.status, blockingIssues: a.blockingIssues, checklist: a.checklist }); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const canApprove = approvalInfo.status === "ready"
  const isBlocked = approvalInfo.status === "blocked"
  const isApproved = approvalInfo.status === "approved"

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الاعتماد</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>حالة الاعتماد</CardTitle>
            <Badge variant="outline" className={`${statusColors[approvalInfo.status]} text-sm px-3 py-1`}>
              {approvalInfo.status === "not_ready" ? "غير جاهز" : approvalInfo.status === "pending_approval" ? "بانتظار الاعتماد" : approvalInfo.status === "approved" ? "معتمد" : approvalInfo.status === "blocked" ? "محظور" : "جاهز"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {canApprove && (
              <>
                <Button variant="outline" className="text-red-600 border-red-300" onClick={() => setShowRejectDialog(true)} disabled={approving}><XCircle className="size-4 ml-1" />رفض</Button>
                <Button disabled={approving} onClick={async () => {
                  setApproving(true); setApproveError(null)
                  try {
                    const result = await createApprovalRecordAction({ engagementId, action: 'approved', targetType: 'engagement', targetId: engagementId })
                    if (result.record) setRecords(prev => [...prev, result.record])
                    setApprovalInfo({ status: 'approved', blockingIssues: [], checklist: approvalInfo.checklist.map(c => ({ ...c, passed: true })) })
                  } catch { setApproveError('فشل الاعتماد') } finally { setApproving(false) }
                }}>{approving ? 'جارٍ الاعتماد...' : <><CheckCircle className="size-4 ml-1" />اعتماد</>}</Button>
              </>
            )}
            {isApproved && <Badge variant="outline" className="bg-green-100 text-green-700"><CheckCircle className="size-3 ml-1" />معتمد</Badge>}
          </div>
          {approveError && <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="size-4 shrink-0" /><span>{approveError}</span></div>}
        </CardHeader>
        <CardContent>
          {approvalInfo.blockingIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1"><Ban className="size-4" />مشكلات مانعة</div>
              <ul className="text-xs text-red-600 space-y-1">
                {approvalInfo.blockingIssues.map((issue, i) => <li key={i} className="flex items-center gap-1"><XCircle className="size-3" />{issue}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="size-4" />قائمة التحقق</CardTitle>
          <CardDescription>القوائم المالية حالياً في حالة <strong>مسودة</strong>. الاعتماد سيؤدي إلى إنهاء الارتباط. يجب حل جميع المشكلات المانعة قبل الاعتماد.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {approvalInfo.checklist.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">تعذر تحميل فحوصات الجاهزية.</div>
            ) : (
              approvalInfo.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  {item.passed ? <CheckCircle className="size-5 text-green-600 shrink-0" /> : <XCircle className="size-5 text-red-600 shrink-0" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.detail}</div>
                  </div>
                  <Badge variant="outline" className={item.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {item.passed ? "ناجح" : "مانع"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="size-4" />سجل الاعتماد</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">لا توجد إجراءات اعتماد بعد.</div>
          ) : (
            <div className="relative">
              <div className="absolute right-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {records.map(rec => (
                  <div key={rec.id} className="relative pr-10">
                    <div className="absolute right-2.5 top-1 bg-background p-0.5">{actionIcons[rec.action]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{rec.approverName}</span>
                        <Badge variant="outline" className="text-[10px]">{rec.approverRole}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{rec.action.replace(/_/g, " ")} على {rec.targetType === 'engagement' ? 'الارتباط' : rec.targetType}</div>
                      {rec.rationale && <p className="text-xs text-muted-foreground mt-0.5">&ldquo;{rec.rationale}&rdquo;</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs text-muted-foreground">{new Date(rec.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <Button size="xs" variant="ghost" onClick={async () => { setTraceApproval(rec); try { const trace = await getTraceabilityAction(engagementId, 'approval', rec.id); setTraceData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] }) } catch { setTraceData({ forward: [], backward: [] }) }; setTraceabilityOpen(true) }}><Share2 className="size-3" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="size-4" />الصلاحية</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4 text-muted-foreground" />
                <span>المعتمِد المطلوب: <strong>شريك</strong>{engagement?.team?.find(t => t.role === 'partner')?.userName ? ` (${engagement.team.find(t => t.role === 'partner')!.userName})` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                <span>مستوى المخاطر: <strong>{(engagement?.engagementType as string) === 'full_audit' ? 'قياسي' : 'محدود'}</strong> - {engagement?.engagementType?.replace('_', ' ') ?? 'ارتباط تدقيق'}</span>
              </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>رفض الارتباط</DialogTitle><DialogDescription>قدّم سبب الرفض.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Label>سبب الرفض</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="صِف سبب رفض هذا الارتباط..." className="min-h-[80px]" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>إلغاء</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || rejecting} onClick={async () => {
              setRejecting(true); setRejectError(null)
              try {
                const result = await createApprovalRecordAction({ engagementId, action: 'rejected', rationale: rejectReason.trim(), targetType: 'engagement', targetId: engagementId })
                if (result.record) setRecords(prev => [...prev, result.record])
                getApprovalStatusAction(engagementId).then(a => setApprovalInfo({ status: a.status, blockingIssues: a.blockingIssues, checklist: a.checklist }))
                setShowRejectDialog(false); setRejectReason('')
              } catch { setRejectError('فشل الرفض') } finally { setRejecting(false) }
            }}>{rejecting ? 'جارٍ الرفض...' : 'رفض'}</Button>
            {rejectError && <p className="text-xs text-red-600">{rejectError}</p>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={() => { setTraceabilityOpen(false); setTraceApproval(null) }}
        entityType="approval_record"
        entityId={traceApproval?.id || ''}
        entityLabel={`اعتماد بواسطة ${traceApproval?.approverName || ''}`}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  )
}
