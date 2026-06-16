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
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { AuditRiskModel, RiskCategory } from '@/lib/platform/audit-risk'
import { listRiskModelsAction, createRiskModelAction } from './actions'

const RISK_LEVEL_VARIANTS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function RiskModelsPage() {
  const router = useRouter()
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

  const fetchModels = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await listRiskModelsAction()
    if (res.ok) setModels(res.data as AuditRiskModel[])
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { fetchModels() }, [fetchModels])

  function addCategory() {
    setCategories([...categories, { name: '', weight: 0, questions: [{ id: crypto.randomUUID(), text: '', weight: 0, type: 'scale' }] }])
  }

  function removeCategory(index: number) {
    setCategories(categories.filter((_, i) => i !== index))
  }

  function updateCategory(index: number, field: keyof RiskCategory, value: string | number) {
    const updated = [...categories]
    ;(updated[index] as any)[field] = value
    setCategories(updated)
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
    const updated = [...categories]
    ;(updated[catIndex].questions[qIndex] as any)[field] = value
    setCategories(updated)
  }

  async function handleCreate() {
    if (!createName || categories.length === 0) return
    setCreating(true)
    setError(null)
    const totalWeight = categories.reduce((s, c) => s + c.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError('يجب أن مجموع أوزان الفئات يساوي 100')
      setCreating(false)
      return
    }
    const res = await createRiskModelAction({
      name: createName,
      description: createDesc || undefined,
      categories,
      thresholds: { low: lowThreshold, medium: mediumThreshold, high: highThreshold, critical: 100 },
    })
    if (res.ok) {
      setCreateOpen(false)
      setCreateName('')
      setCreateDesc('')
      setCategories([])
      setLowThreshold(30)
      setMediumThreshold(60)
      setHighThreshold(80)
      await fetchModels()
    } else {
      setError(res.error)
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <main className="p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">نماذج المخاطر</h1>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <div>
                <Label>اسم النموذج</Label>
                <Input value={createName} onChange={e => setCreateName(e.target.value)} placeholder="مثال: نموذج مخاطر التدقيق الأساسي" />
              </div>
              <div>
                <Label>الوصف</Label>
                <Input value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="وصف النموذج" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">حد منخفض</Label>
                  <Input type="number" min={0} max={100} value={lowThreshold} onChange={e => setLowThreshold(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">حد متوسط</Label>
                  <Input type="number" min={0} max={100} value={mediumThreshold} onChange={e => setMediumThreshold(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">حد مرتفع</Label>
                  <Input type="number" min={0} max={100} value={highThreshold} onChange={e => setHighThreshold(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>الفئات</Label>
                  <Button variant="outline" size="sm" onClick={addCategory}>
                    <Plus className="h-3 w-3 ml-1" /> إضافة فئة
                  </Button>
                </div>
                {categories.map((cat, ci) => (
                  <Card key={ci} className="mb-3">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="اسم الفئة"
                          value={cat.name}
                          onChange={e => updateCategory(ci, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <div className="w-24">
                          <Input
                            type="number"
                            placeholder="الوزن"
                            value={cat.weight || ''}
                            onChange={e => updateCategory(ci, 'weight', Number(e.target.value))}
                          />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeCategory(ci)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="space-y-2 pr-4">
                        {cat.questions.map((q, qi) => (
                          <div key={qi} className="flex items-center gap-2">
                            <Input
                              placeholder="نص السؤال"
                              value={q.text}
                              onChange={e => updateQuestion(ci, qi, 'text', e.target.value)}
                              className="flex-1"
                            />
                            <div className="w-20">
                              <Input
                                type="number"
                                placeholder="الوزن"
                                value={q.weight || ''}
                                onChange={e => updateQuestion(ci, qi, 'weight', Number(e.target.value))}
                              />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeQuestion(ci, qi)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => addQuestion(ci)}>
                          <Plus className="h-3 w-3 ml-1" /> سؤال
                        </Button>
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

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">قائمة النماذج</CardTitle>
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
                    <TableCell>
                      <Badge variant={m.isActive ? 'default' : 'secondary'}>
                        {m.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/risk/${m.id}`)}>
                        <Eye className="h-4 w-4 ml-1" /> عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
