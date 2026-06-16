'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Loader2, AlertTriangle, X, ClipboardCheck, Eye } from 'lucide-react'
import type { AuditRiskAssessment } from '@/lib/platform/audit-risk'
import { listAssessmentsAction } from '../actions'

const LEVEL_VARIANTS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  REVIEWED: 'تمت المراجعة',
  APPROVED: 'معتمد',
}

export default function AssessmentsListPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AuditRiskAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssessments = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await listAssessmentsAction()
    if (res.ok) setAssessments(res.data as AuditRiskAssessment[])
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAssessments() }, [fetchAssessments])

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
      <div className="flex items-center gap-3 mb-6">
        <ClipboardCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">تقييمات المخاطر</h1>
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
          <CardTitle className="text-lg">قائمة التقييمات</CardTitle>
          <CardDescription>{assessments.length} تقييم</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">لا توجد تقييمات مخاطر. اختر نموذج مخاطر لإنشاء تقييم جديد.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>المخاطر الكامنة</TableHead>
                  <TableHead>المخاطر المتبقية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>
                      <Badge className={LEVEL_VARIANTS[a.inherentLevel]} variant="outline">
                        {a.inherentScore} - {a.inherentLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.residualScore !== null ? (
                        <Badge className={LEVEL_VARIANTS[a.residualLevel ?? 'LOW']} variant="outline">
                          {a.residualScore} - {a.residualLevel}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'APPROVED' ? 'default' : a.status === 'REVIEWED' ? 'secondary' : 'outline'}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.assessedAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/risk/assessments/${a.id}`)}>
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
