'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2, AlertTriangle, X, ArrowRight, ClipboardList, Download, CheckCircle2, Circle, History,
} from 'lucide-react'
import type { AuditRiskAssessment, AuditRiskProcedure, UpdateProcedureData, ProcedureStep } from '@/lib/platform/audit-risk'
import {
  getAssessmentAction,
  updateProcedureAction,
  transitionAssessmentAction,
  getAssessmentAuditTrailAction,
  exportAssessmentAction,
  type AuditTrailEntry,
} from '../../actions'

const LEVEL_VARIANTS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  REVIEWED: 'تمت المراجعة',
  APPROVED: 'معتمد',
}

const PROCEDURE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
}

function ScoreBar({ score, level }: { score: number; level: string }) {
  const colorMap: Record<string, string> = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorMap[level] ?? 'bg-gray-500'}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium w-20 text-left">{score} - {level}</span>
    </div>
  )
}

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<AuditRiskAssessment | null>(null)
  const [procedures, setProcedures] = useState<AuditRiskProcedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [editProc, setEditProc] = useState<AuditRiskProcedure | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([])
  const [showAuditTrail, setShowAuditTrail] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [stepStates, setStepStates] = useState<Record<string, boolean[]>>({})
  const [stepLoading, setStepLoading] = useState<Record<string, boolean>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getAssessmentAction(assessmentId)
    if (res.ok) {
      const data = res.data as { assessment: AuditRiskAssessment; procedures: AuditRiskProcedure[] }
      setAssessment(data.assessment)
      setProcedures(data.procedures)
      // Initialize step states from procedure step data
      const initial: Record<string, boolean[]> = {}
      for (const p of data.procedures) {
        initial[p.id] = p.procedureSteps.map((s: ProcedureStep) => (s as any).completed ?? false)
      }
      setStepStates(initial)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }, [assessmentId])

  const loadAuditTrail = useCallback(async () => {
    const res = await getAssessmentAuditTrailAction(assessmentId)
    if (res.ok) setAuditTrail(res.data as AuditTrailEntry[])
  }, [assessmentId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleTransition(targetStatus: string) {
    setActionLoading(true)
    const res = await transitionAssessmentAction(assessmentId, targetStatus)
    if (res.ok) {
      setAssessment(res.data as AuditRiskAssessment)
    } else {
      setError(res.error)
    }
    setActionLoading(false)
  }

  async function handleExport() {
    setExporting(true)
    const res = await exportAssessmentAction(assessmentId)
    if (res.ok) {
      const data = res.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `risk-assessment-${assessmentId.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      setError(res.error)
    }
    setExporting(false)
  }

  async function handleToggleStep(procId: string, stepIndex: number) {
    setStepLoading(prev => ({ ...prev, [`${procId}-${stepIndex}`]: true }))
    const current = [...(stepStates[procId] ?? [])]
    current[stepIndex] = !current[stepIndex]
    const proc = procedures.find(p => p.id === procId)
    if (!proc) return
    const updatedSteps = proc.procedureSteps.map((s: ProcedureStep, i: number) => ({
      ...s,
      completed: current[i] ?? false,
    }))
    const res = await updateProcedureAction(procId, { procedureSteps: updatedSteps as any })
    if (res.ok) {
      setStepStates(prev => ({ ...prev, [procId]: current }))
    } else {
      setError(res.error)
    }
    setStepLoading(prev => ({ ...prev, [`${procId}-${stepIndex}`]: false }))
  }

  async function handleUpdateProcedure() {
    if (!editProc) return
    setActionLoading(true)
    const data: UpdateProcedureData = {}
    if (editDesc !== editProc.description) data.description = editDesc
    if (editStatus !== editProc.status) data.status = editStatus
    if (Object.keys(data).length > 0) {
      const res = await updateProcedureAction(editProc.id, data)
      if (res.ok) {
        setProcedures(procedures.map(p => p.id === editProc.id ? res.data as AuditRiskProcedure : p))
      } else {
        setError(res.error)
      }
    }
    setEditProc(null)
    setActionLoading(false)
  }

  if (loading) {
    return (
      <main className="p-8 max-w-5xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (!assessment) {
    return (
      <main className="p-8 max-w-5xl mx-auto" dir="rtl">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center text-red-600">التقييم غير موجود</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/risk/assessments')}>
          <ArrowRight className="h-4 w-4 ml-1" /> العودة
        </Button>
        <ClipboardList className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{assessment.title}</h1>
        <Badge variant={assessment.status === 'APPROVED' ? 'default' : assessment.status === 'REVIEWED' ? 'secondary' : 'outline'}>
          {STATUS_LABELS[assessment.status] ?? assessment.status}
        </Badge>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">المخاطر الكامنة</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBar score={assessment.inherentScore} level={assessment.inherentLevel} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">المخاطر المتبقية</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment.residualScore !== null ? (
              <ScoreBar score={assessment.residualScore} level={assessment.residualLevel ?? 'LOW'} />
            ) : (
              <p className="text-sm text-muted-foreground">لم يتم التقييم</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">تفصيل الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.categoryScores.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {assessment.categoryScores.map((cs, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{cs.name}</span>
                    <Badge className={LEVEL_VARIANTS[cs.level]} variant="outline">
                      {cs.score} - {cs.level}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${LEVEL_VARIANTS[cs.level].split(' ')[0]}`}
                      style={{ width: `${Math.min(cs.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Status Actions */}
        {assessment.status === 'DRAFT' && (
          <Button onClick={() => handleTransition('REVIEWED')} disabled={actionLoading}>
            {actionLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
            تقديم للمراجعة
          </Button>
        )}
        {assessment.status === 'REVIEWED' && (
          <Button onClick={() => handleTransition('APPROVED')} disabled={actionLoading}>
            {actionLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
            اعتماد التقييم
          </Button>
        )}
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <Download className="h-4 w-4 ml-1" />}
          تصدير JSON
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (!showAuditTrail) loadAuditTrail()
            setShowAuditTrail(v => !v)
          }}
        >
          <History className="h-4 w-4 ml-1" />
          سجل التدقيق
        </Button>
      </div>

      {/* Audit Trail Panel */}
      {showAuditTrail && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" /> سجل التدقيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditTrail.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">لا توجد أحداث</p>
            ) : (
              <div className="space-y-2">
                {auditTrail.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium">{e.action}</span>
                      {(e.metadata as Record<string, string> | null)?.fromStatus && (e.metadata as Record<string, string> | null)?.toStatus && (
                        <span className="text-muted-foreground">
                          {' '}({(e.metadata as Record<string, string>).fromStatus} → {(e.metadata as Record<string, string>).toStatus})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Procedures */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">إجراءات المخاطر</CardTitle>
          <CardDescription>{procedures.length} إجراء</CardDescription>
        </CardHeader>
        <CardContent>
          {procedures.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">لا توجد إجراءات</p>
          ) : (
            <div className="space-y-4">
              {procedures.map(p => {
                const completedSteps = (stepStates[p.id] ?? []).filter(Boolean).length
                const totalSteps = p.procedureSteps.length
                const stepProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
                return (
                  <Card key={p.id} className="border-l-4" style={{
                    borderLeftColor: p.status === 'COMPLETED' ? '#22c55e' : p.status === 'IN_PROGRESS' ? '#eab308' : '#6b7280',
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{p.procedureCode}</span>
                          <span className="font-medium">{p.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{PROCEDURE_STATUS_LABELS[p.status] ?? p.status}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditProc(p)
                              setEditDesc(p.description)
                              setEditStatus(p.status)
                            }}
                          >
                            تعديل
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="bg-muted px-2 py-0.5 rounded">{p.riskCategory}</span>
                        <span className="bg-muted px-2 py-0.5 rounded">
                          {p.evidenceRequired ? 'أدلة مطلوبة' : 'أدلة اختيارية'}
                        </span>
                        {totalSteps > 0 && (
                          <span className="bg-muted px-2 py-0.5 rounded">
                            {completedSteps}/{totalSteps} خطوات ({stepProgress}%)
                          </span>
                        )}
                      </div>
                      {/* Step Checklist */}
                      {totalSteps > 0 && (
                        <div className="space-y-1 pr-2 border-r-2 border-muted mr-2">
                          {p.procedureSteps.map((step: ProcedureStep, si: number) => {
                            const done = (stepStates[p.id] ?? [])[si] ?? false
                            const loadingKey = `${p.id}-${si}`
                            const isStepLoading = stepLoading[loadingKey]
                            return (
                              <div key={si} className="flex items-center gap-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStep(p.id, si)}
                                  disabled={isStepLoading}
                                  className="shrink-0"
                                >
                                  {isStepLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  ) : done ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                                <span className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>
                                  {(step as ProcedureStep).instruction}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Procedure Dialog */}
      <Dialog open={!!editProc} onOpenChange={o => { if (!o) setEditProc(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الإجراء {editProc?.procedureCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الوصف</Label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">مسودة</SelectItem>
                  <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                  <SelectItem value="COMPLETED">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProc(null)}>إلغاء</Button>
            <Button onClick={handleUpdateProcedure} disabled={actionLoading}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
