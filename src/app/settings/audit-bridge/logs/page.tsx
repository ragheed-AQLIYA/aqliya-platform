'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, X, RefreshCw, History } from 'lucide-react'
import type { BridgeLogEntry } from '@/lib/platform/audit-bridge'
import { getBridgeLogsAction, retryFailedAction } from '../actions'

const STATUS_VARIANTS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: 'نجاح',
  FAILED: 'فشل',
  PENDING: 'قيد الانتظار',
}

const SOURCE_LABELS: Record<string, string> = {
  auditos: 'AuditOS',
  decisionos: 'DecisionOS',
  generic: 'عام',
}

export default function BridgeLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<BridgeLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterSource, setFilterSource] = useState<string>('')
  const [retrying, setRetrying] = useState(false)
  const [retryResult, setRetryResult] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getBridgeLogsAction(filterStatus || undefined, filterSource || undefined)
    if (res.ok) setLogs(res.data as BridgeLogEntry[])
    else setError(res.error)
    setLoading(false)
  }, [filterStatus, filterSource])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  async function handleRetryAll() {
    setRetrying(true)
    setRetryResult(null)
    const failedRules = new Set(logs.filter(l => l.status === 'FAILED').map(l => l.ruleId))
    let total = 0
    for (const ruleId of failedRules) {
      const res = await retryFailedAction(ruleId)
      if (res.ok) total += (res.data as { retriedCount: number }).retriedCount
    }
    setRetryResult(`تمت إعادة محاولة ${total} إجراءات فاشلة`)
    await fetchLogs()
    setRetrying(false)
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
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">سجل عمليات الربط</h1>
          <Badge variant="outline">Bridge Logs</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/settings/audit-bridge')}>
            <RefreshCw className="h-4 w-4 ml-1" /> القواعد
          </Button>
          <Button variant="outline" onClick={handleRetryAll} disabled={retrying}>
            {retrying ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 ml-1" />
            )}
            إعادة المحاولة للفاشلة
          </Button>
        </div>
      </div>

      {retryResult && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-green-800 dark:text-green-200">
            {retryResult}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setRetryResult(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حسب الحالة</label>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="SUCCESS">نجاح</SelectItem>
                  <SelectItem value="FAILED">فشل</SelectItem>
                  <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حسب المصدر</label>
              <Select value={filterSource} onValueChange={v => setFilterSource(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="auditos">AuditOS</SelectItem>
                  <SelectItem value="decisionos">DecisionOS</SelectItem>
                  <SelectItem value="generic">عام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل العمليات</CardTitle>
          <CardDescription>{logs.length} عملية ربط</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">لا توجد عمليات ربط بعد</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المصدر</TableHead>
                  <TableHead>نوع الحدث</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>محاولات</TableHead>
                  <TableHead>رسالة الخطأ</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{SOURCE_LABELS[l.source] ?? l.source}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{l.eventType}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_VARIANTS[l.status] ?? ''} variant="outline">
                        {STATUS_LABELS[l.status] ?? l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{l.retryCount}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {l.errorMessage ?? '--'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString('ar-SA')}
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
