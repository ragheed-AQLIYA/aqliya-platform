'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, AlertTriangle, X, ArrowRight, Shield } from 'lucide-react'
import type { AuditRiskModel } from '@/lib/platform/audit-risk'
import { getRiskModelAction, createAssessmentAction } from '../actions'

export default function RiskModelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const modelId = params.id as string

  const [model, setModel] = useState<AuditRiskModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [assessOpen, setAssessOpen] = useState(false)
  const [assessTitle, setAssessTitle] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)

  const fetchModel = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getRiskModelAction(modelId)
    if (res.ok) {
      setModel(res.data as AuditRiskModel)
      const initial: Record<string, string> = {}
      for (const cat of (res.data as AuditRiskModel).categories) {
        for (const q of cat.questions) {
          initial[q.id] = '0'
        }
      }
      setAnswers(initial)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }, [modelId])

  useEffect(() => { fetchModel() }, [fetchModel])

  async function handleCreateAssessment() {
    if (!assessTitle || !model) return
    setCreating(true)
    setError(null)
    const parsedAnswers: Record<string, { inherent: number }> = {}
    for (const [qId, val] of Object.entries(answers)) {
      parsedAnswers[qId] = { inherent: Number(val) || 0 }
    }
    const res = await createAssessmentAction(modelId, 'engagement-placeholder', {
      title: assessTitle,
      answers: parsedAnswers,
    })
    if (res.ok) {
      setAssessOpen(false)
      router.push(`/risk/assessments/${(res.data as any).id}`)
    } else {
      setError(res.error)
    }
    setCreating(false)
  }

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (!model) {
    return (
      <main className="p-8 max-w-4xl mx-auto" dir="rtl">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center text-red-600">النموذج غير موجود</CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/risk')}>
          <ArrowRight className="h-4 w-4 ml-1" /> العودة
        </Button>
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">{model.name}</h1>
        <Badge variant="outline">v{model.version}</Badge>
        <Badge variant={model.isActive ? 'default' : 'secondary'}>
          {model.isActive ? 'نشط' : 'غير نشط'}
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

      {model.description && (
        <p className="text-sm text-muted-foreground mb-6">{model.description}</p>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">الفئات والأسئلة</h2>
        <Button onClick={() => setAssessOpen(true)}>
          إنشاء تقييم
        </Button>
      </div>

      <div className="space-y-4">
        {model.categories.map((cat, ci) => (
          <Card key={ci}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <Badge variant="outline">{cat.weight}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">الأسئلة</p>
              {cat.questions.map((q, qi) => (
                <div key={qi} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <span className="flex-1">{q.text}</span>
                  <Badge variant="secondary" className="text-[10px]">الوزن: {q.weight}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={assessOpen} onOpenChange={setAssessOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تقييم مخاطر جديد</DialogTitle>
            <DialogDescription>أدخل قيم المخاطر الكامنة لكل سؤال (0-100)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان التقييم</Label>
              <Input value={assessTitle} onChange={e => setAssessTitle(e.target.value)} placeholder="مثال: تقييم المخاطر الأولي" />
            </div>
            {model.categories.map((cat, ci) => (
              <div key={ci}>
                <h4 className="text-sm font-medium mb-2">{cat.name} ({cat.weight}%)</h4>
                {cat.questions.map((q, qi) => (
                  <div key={qi} className="flex items-center gap-2 mb-2">
                    <span className="flex-1 text-sm">{q.text}</span>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={answers[q.id] || '0'}
                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessOpen(false)}>إلغاء</Button>
            <Button onClick={handleCreateAssessment} disabled={creating || !assessTitle}>
              {creating && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              إنشاء التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
