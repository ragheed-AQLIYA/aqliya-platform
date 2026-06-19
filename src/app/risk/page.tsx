'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle, Loader2, Plus, Shield, Trash2, X, Eye,
  BarChart3, FileText, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AuditRiskModel, RiskCategory } from '@/lib/platform/audit-risk'
import { listRiskModelsAction, createRiskModelAction, getRiskDashboardStatsAction } from './actions'
import type { DashboardStats } from './actions'

const RISK_LEVEL_VARIANTS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  reviewed: 'تمت المراجعة',
  approved: 'معتمد',
}

export default function RiskDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [models, setModels] = useState<AuditRiskModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [categories, setCategories] = useState<RiskCategory[]>([])
  const [lowThreshold, setLowThreshold] = useState(30)
  const [mediumThreshold, setMediumThreshold] = useState(60)
  const [highThreshold, setHighThreshold] = useState(80)
  const [creating, setCreating] = useState(false)
  const [showModels, setShowModels] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    const [statsRes, modelsRes] = await Promise.all([
      getRiskDashboardStatsAction(),
      listRiskModelsAction(),
    ])
    if (statsRes.ok) setStats(statsRes.data as DashboardStats)
    if (modelsRes.ok) setModels(modelsRes.data as AuditRiskModel[])
    if (!statsRes.ok) setError(statsRes.error)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function addCategory() {
    setCategories([...categories, { name: '', weight: 0, questions: [{ id: crypto.randomUUID(), text: '', weight: 0, type: 'scale' }] }])
  }
  function removeCategory(index: number) { setCategories(categories.filter((_, i) => i !== index)) }
  function updateCategory(index: number, field: keyof RiskCategory, value: string | number) {
    const updated = [...categories]; (updated[index] as any)[field] = value; setCategories(updated)
  }
  function addQuestion(catIndex: number) {
    const updated = [...categories]
    updated[catIndex].questions.push({ id: crypto.randomUUID(), text: '', weight: 0, type: 'scale' })
    setCategories(updated)
  }
  function removeQuestion(catIndex: number, qIndex: number) {
    const updated = [...categories]
    updated[catIndex].questions = updated[catIndex].questions.filter((_, i) => i !== qIndex)
    setCategories(updated)
  }
  function updateQuestion(catIndex: number, qIndex: number, field: string, value: string | number) {
    const updated = [...categories]; (updated[catIndex].questions[qIndex] as any)[field] = value; setCategories(updated)
  }
  async function handleCreate() {
    if (!createName || categories.length === 0) return
    setCreating(true); setError(null)
    const res = await createRiskModelAction({
      name: createName, description: createDesc || undefined,
      categories: categories.map(c => ({ ...c, questions: c.questions.map(q => ({ ...q, type: 'scale' as const })) })),
      thresholds: { low: lowThreshold, medium: mediumThreshold, high: highThreshold },
    })
    setCreating(false)
    if (res.ok) {
      setCreateOpen(false); setCreateName(''); setCreateDesc(''); setCategories([])
      setLowThreshold(30); setMediumThreshold(60); setHighThreshold(80)
      fetchData()
    } else { setError(res.error) }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">مخاطر المنشأة</h1>
            <p className="text-sm text-muted-foreground">RiskOS — إدارة المخاطر المؤسسية</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showModels ? 'default' : 'outline'} size="sm" onClick={() => setShowModels(!showModels)}>
            <BarChart3 className="h-4 w-4 ml-1" />
            {showModels ? 'لوحة المعلومات' : 'إدارة النماذج'}
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-1" />
                إنشاء نموذج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء نموذج مخاطر جديد</DialogTitle>
                <DialogDescription>حدد فئات المخاطر والأسئلة والحدود</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>اسم النموذج</Label><Input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="مثال: نموذج مخاطر التدقيق الأساسي" /></div>
                <div><Label>الوصف</Label><Input value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="وصف النموذج" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">حد منخفض</Label><Input type="number" min={0} max={100} value={lowThreshold} onChange={e => setLowThreshold(Number(e.target.value))} /></div>
                  <div><Label className="text-xs">حد متوسط</Label><Input type="number" min={0} max={100} value={mediumThreshold} onChange={e => setMediumThreshold(Number(e.target.value))} /></div>
                  <div><Label className="text-xs">حد مرتفع</Label><Input type="number" min={0} max={100} value={highThreshold} onChange={e => setHighThreshold(Number(e.target.value))} /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2"><Label>الفئات</Label><Button variant="outline" size="sm" onClick={addCategory}><Plus className="h-3 w-3 ml-1" /> إضافة فئة</Button></div>
                  {categories.map((cat, ci) => (
                    <Card key={ci} className="mb-3">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Input placeholder="اسم الفئة" value={cat.name} onChange={e => updateCategory(ci, 'name', e.target.value)} className="flex-1" />
                          <div className="w-24"><Input type="number" placeholder="الوزن" value={cat.weight || ''} onChange={e => updateCategory(ci, 'weight', Number(e.target.value))} /></div>
                          <Button variant="ghost" size="sm" onClick={() => removeCategory(ci)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                        <div className="space-y-2 pr-4">
                          {cat.questions.map((q, qi) => (
                            <div key={qi} className="flex items-center gap-2">
                              <Input placeholder="نص السؤال" value={q.text} onChange={e => updateQuestion(ci, qi, 'text', e.target.value)} className="flex-1" />
                              <div className="w-20"><Input type="number" placeholder="الوزن" value={q.weight || ''} onChange={e => updateQuestion(ci, qi, 'weight', Number(e.target.value))} /></div>
                              <Button variant="ghost" size="sm" onClick={() => removeQuestion(ci, qi)}><X className="h-3 w-3" /></Button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => addQuestion(ci)}><Plus className="h-3 w-3 ml-1" /> سؤال</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
                <Button onClick={handleCreate} disabled={creating || !createName || categories.length === 0}>
                  {creating && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
                  إنشاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}><X className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && showModels && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">قائمة نماذج المخاطر</CardTitle>
            <CardDescription>{models.length} نموذج مخاطر</CardDescription>
          </CardHeader>
          <CardContent>
            {models.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">لا توجد نماذج مخاطر. أنشئ أول نموذج للبدء.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الإصدار</TableHead>
                    <TableHead>الفئات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>v{m.version}</TableCell>
                      <TableCell>{m.categories.length}</TableCell>
                      <TableCell><Badge variant={m.isActive ? 'default' : 'secondary'}>{m.isActive ? 'نشط' : 'غير نشط'}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(m.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => router.push(`/risk/${m.id}`)}><Eye className="h-4 w-4 ml-1" /> عرض</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !showModels && stats && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalModels}</p>
                  <p className="text-xs text-muted-foreground">نموذج مخاطر</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAssessments}</p>
                  <p className="text-xs text-muted-foreground">تقييم مخاطر</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingReview}</p>
                  <p className="text-xs text-muted-foreground">بانتظار المراجعة</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.highCritical}</p>
                  <p className="text-xs text-muted-foreground">مخاطر عالية/حرجة</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk distribution + status summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">توزيع مستويات المخاطر</CardTitle></CardHeader>
              <CardContent>
                {stats.assessmentsByLevel.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4 text-center">لا توجد تقييمات بعد</p>
                ) : (
                  <div className="space-y-3">
                    {stats.assessmentsByLevel.map(({ level, count }) => {
                      const pct = stats.totalAssessments > 0 ? (count / stats.totalAssessments) * 100 : 0
                      const barColor = level === 'CRITICAL' ? '#ef4444' : level === 'HIGH' ? '#f97316' : level === 'MEDIUM' ? '#eab308' : '#22c55e'
                      return (
                        <div key={level}>
                          <div className="flex justify-between text-xs mb-1">
                            <Badge variant="outline" className={RISK_LEVEL_VARIANTS[level] ?? ''}>{level}</Badge>
                            <span className="text-muted-foreground">{count} ({Math.round(pct)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">حالة التقييمات</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /><span className="text-sm">بانتظار المراجعة</span></div>
                  <span className="text-lg font-bold">{stats.pendingReview}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="text-sm">معتمد</span></div>
                  <span className="text-lg font-bold">{stats.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /><span className="text-sm">عالٍ / حرج</span></div>
                  <span className="text-lg font-bold">{stats.highCritical}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /><span className="text-sm">منخفض / متوسط</span></div>
                  <span className="text-lg font-bold">{stats.lowMedium}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent assessments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">آخر التقييمات</CardTitle>
                <CardDescription>أحدث 10 تقييمات مخاطر</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/risk/assessments')}>
                <Eye className="h-4 w-4 ml-1" /> عرض الكل
              </Button>
            </CardHeader>
            <CardContent>
              {stats.recentAssessments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 text-center">لا توجد تقييمات بعد. أنشئ نموذج مخاطر وابدأ التقييم.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>المستوى</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentAssessments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell><Badge variant={a.status === 'approved' ? 'default' : a.status === 'reviewed' ? 'secondary' : 'outline'}>{STATUS_LABELS[a.status] ?? a.status}</Badge></TableCell>
                        <TableCell>{a.inherentLevel ? <Badge variant="outline" className={RISK_LEVEL_VARIANTS[a.inherentLevel] ?? ''}>{a.inherentLevel}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={() => router.push(`/risk/assessments/${a.id}`)}><Eye className="h-4 w-4 ml-1" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
