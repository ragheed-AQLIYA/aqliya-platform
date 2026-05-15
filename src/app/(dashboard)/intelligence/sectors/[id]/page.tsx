"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSectorAction, getSectorBenchmarksAction, createBenchmarkAction } from "@/actions/decision-sector"
import { getSectorPatternsAction } from "@/actions/decision-learning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Sector = {
  id: string
  name: string
  description: string | null
  code: string
  isActive: boolean
  benchmarks: SectorBenchmark[]
}

type SectorBenchmark = {
  id: string
  metricName: string
  value: number
  unit: string
  benchmarkType: string
  sourceType: string
  confidence: number
}

type SectorPattern = {
  id: string
  patternType: string
  patternKey: string
  occurrenceCount: number
  lastObservedAt: Date | string
  confidenceScore: number
}

export default function SectorDetailPage() {
  const params = useParams()
  const sectorId = params.id as string
  
  const [sector, setSector] = useState<Sector | null>(null)
  const [benchmarks, setBenchmarks] = useState<SectorBenchmark[]>([])
  const [sectorPatterns, setSectorPatterns] = useState<SectorPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [sectorResult, benchmarksResult, patternsResult] = await Promise.all([
          getSectorAction(sectorId),
          getSectorBenchmarksAction(sectorId),
          getSectorPatternsAction(sectorId),
        ])

        if (sectorResult.error) {
          setError(sectorResult.error)
        } else if (sectorResult.data) {
          setSector(sectorResult.data as Sector)
        }

        if (benchmarksResult.error) {
          setError(benchmarksResult.error)
        } else if (benchmarksResult.data) {
          setBenchmarks(benchmarksResult.data as SectorBenchmark[])
        }

        if (patternsResult.error) {
          setError(patternsResult.error)
        } else if (patternsResult.data) {
          setSectorPatterns(patternsResult.data as SectorPattern[])
        }
      } catch {
        setError("فشل في تحميل البيانات")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sectorId])

  async function handleSubmit(formData: FormData) {
    formData.append("sectorId", sectorId)
    const result = await createBenchmarkAction(formData)
    if (result.success) {
      setShowForm(false)
      // Reload benchmarks
      const benchmarksResult = await getSectorBenchmarksAction(sectorId)
      if (benchmarksResult.data) {
        setBenchmarks(benchmarksResult.data as SectorBenchmark[])
      }
    }
  }

  if (loading) return <div className="p-6">جارٍ التحميل...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!sector) return <div className="p-6">القطاع غير موجود</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{sector.name}</h1>
        <p className="text-sm text-muted-foreground">
          الرمز: {sector.code} | الحالة: {sector.isActive ? "نشط" : "غير نشط"}
        </p>
        {sector.description && (
          <p className="mt-2 text-sm">{sector.description}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المعايير</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "إلغاء" : "إضافة معيار"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة معيار</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="metricName">اسم المقياس</Label>
                <Input id="metricName" name="metricName" required />
              </div>
              <div>
                <Label htmlFor="value">القيمة</Label>
                <Input id="value" name="value" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="unit">الوحدة</Label>
                <Input id="unit" name="unit" required />
              </div>
              <div>
                <Label htmlFor="benchmarkType">نوع المعيار</Label>
                <Input id="benchmarkType" name="benchmarkType" required />
              </div>
              <div>
                <Label htmlFor="sourceType">نوع المصدر</Label>
                <Input id="sourceType" name="sourceType" defaultValue="manual" />
              </div>
              <Button type="submit">إضافة معيار</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الأنماط المستخلصة</CardTitle>
        </CardHeader>
        <CardContent>
          {sectorPatterns.length === 0 ? (
            <p className="text-muted-foreground">لا توجد أنماط مستخلصة بعد.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع النمط</TableHead>
                  <TableHead>مفتاح النمط</TableHead>
                  <TableHead>التكرارات</TableHead>
                  <TableHead>آخر ملاحظة</TableHead>
                  <TableHead>الثقة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectorPatterns.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.patternType}</TableCell>
                    <TableCell>{p.patternKey}</TableCell>
                    <TableCell>{p.occurrenceCount}</TableCell>
                    <TableCell>{new Date(p.lastObservedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{p.confidenceScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المعايير</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المقياس</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>الوحدة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>الثقة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benchmarks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.metricName}</TableCell>
                  <TableCell>{b.value}</TableCell>
                  <TableCell>{b.unit}</TableCell>
                  <TableCell>{b.benchmarkType}</TableCell>
                  <TableCell>{b.sourceType}</TableCell>
                  <TableCell>{b.confidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
