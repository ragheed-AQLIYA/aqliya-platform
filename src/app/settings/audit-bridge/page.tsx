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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, Loader2, Plus, Link2, Trash2, X, RefreshCw,
} from 'lucide-react'
import type { AuditBridgeRule } from '@/lib/platform/audit-bridge'
import {
  listBridgeRulesAction, createBridgeRuleAction, updateBridgeRuleAction, deleteBridgeRuleAction,
} from './actions'

const SOURCE_LABELS: Record<string, string> = {
  auditos: 'AuditOS',
  decisionos: 'DecisionOS',
  generic: 'عام',
}

export default function AuditBridgePage() {
  const router = useRouter()
  const [rules, setRules] = useState<AuditBridgeRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editRule, setEditRule] = useState<AuditBridgeRule | null>(null)

  const [formName, setFormName] = useState('')
  const [formSource, setFormSource] = useState('auditos')
  const [formEventFilter, setFormEventFilter] = useState('*')
  const [formMaxRetries, setFormMaxRetries] = useState(3)
  const [formRetryInterval, setFormRetryInterval] = useState(60000)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await listBridgeRulesAction()
    if (res.ok) setRules(res.data as AuditBridgeRule[])
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  function resetForm() {
    setFormName('')
    setFormSource('auditos')
    setFormEventFilter('*')
    setFormMaxRetries(3)
    setFormRetryInterval(60000)
  }

  function openCreate() {
    resetForm()
    setEditRule(null)
    setCreateOpen(true)
  }

  function openEdit(rule: AuditBridgeRule) {
    setFormName(rule.name)
    setFormSource(rule.source)
    setFormEventFilter(rule.eventTypeFilter)
    setFormMaxRetries(rule.maxRetries)
    setFormRetryInterval(rule.retryIntervalMs)
    setEditRule(rule)
    setCreateOpen(true)
  }

  async function handleSave() {
    if (!formName) return
    setActionLoading(true)
    setError(null)
    const payload = {
      name: formName,
      source: formSource,
      eventTypeFilter: formEventFilter,
      maxRetries: formMaxRetries,
      retryIntervalMs: formRetryInterval,
    }
    const res = editRule
      ? await updateBridgeRuleAction(editRule.id, payload)
      : await createBridgeRuleAction(payload)
    if (res.ok) {
      setCreateOpen(false)
      resetForm()
      await fetchRules()
    } else {
      setError(res.error)
    }
    setActionLoading(false)
  }

  async function handleDelete(ruleId: string) {
    setActionLoading(true)
    const res = await deleteBridgeRuleAction(ruleId)
    if (res.ok) {
      await fetchRules()
    } else {
      setError(res.error)
    }
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

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">قواعد ربط التدقيق</h1>
          <Badge variant="outline">Bridge</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/settings/audit-bridge/logs')}>
            <RefreshCw className="h-4 w-4 ml-1" /> سجل العمليات
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 ml-1" /> قاعدة جديدة
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        إدارة قواعد ربط أحداث التدقيق من المنتجات المختلفة إلى سجل المنصة الموحد.
      </p>

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
          <CardTitle className="text-lg">قواعد الربط</CardTitle>
          <CardDescription>{rules.length} قاعدة ربط</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              لا توجد قواعد ربط. أنشئ قاعدة لبدء ربط أحداث التدقيق.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المصدر</TableHead>
                  <TableHead>مرشح الأحداث</TableHead>
                  <TableHead>أقصى إعادة محاولة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{SOURCE_LABELS[r.source] ?? r.source}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{r.eventTypeFilter}</code>
                    </TableCell>
                    <TableCell>{r.maxRetries}</TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? 'default' : 'secondary'}>
                        {r.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>تعديل</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRule ? 'تعديل قاعدة الربط' : 'قاعدة ربط جديدة'}</DialogTitle>
            <DialogDescription>
              {editRule ? 'تحديث إعدادات قاعدة الربط' : 'إنشاء قاعدة جديدة لربط أحداث التدقيق'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اسم القاعدة</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="مثال: ربط أحداث AuditOS" />
            </div>
            <div>
              <Label>المصدر</Label>
              <Select value={formSource} onValueChange={setFormSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auditos">AuditOS</SelectItem>
                  <SelectItem value="decisionos">DecisionOS</SelectItem>
                  <SelectItem value="generic">عام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>مرشح نوع الحدث</Label>
              <Input
                value={formEventFilter}
                onChange={e => setFormEventFilter(e.target.value)}
                placeholder="* (جميع الأحداث) أو event1,event2"
              />
              <p className="text-xs text-muted-foreground mt-1">استخدم * لجميع الأحداث، أو قائمة مفصولة بفواصل</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>أقصى إعادة محاولة</Label>
                <Input type="number" min={0} value={formMaxRetries} onChange={e => setFormMaxRetries(Number(e.target.value))} />
              </div>
              <div>
                <Label>فترة إعادة المحاولة (مللي)</Label>
                <Input type="number" min={1000} value={formRetryInterval} onChange={e => setFormRetryInterval(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={actionLoading || !formName}>
              {actionLoading && <Loader2 className="h-4 w-4 ml-1 animate-spin" />}
              {editRule ? 'حفظ التغييرات' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
