"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarClock,
  Plus,
  Play,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react"
import type { OfficeAiSchedule } from "@/lib/platform/office-ai-adv"
import { getAdvSchedules, createAdvScheduleAction, processDueSchedulesAction, type ActionState } from "../actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const RECURRENCE_LABELS: Record<string, string> = {
  DAILY: "يومي",
  WEEKLY: "أسبوعي",
  MONTHLY: "شهري",
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<OfficeAiSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form
  const [formName, setFormName] = useState("")
  const [formRecurrence, setFormRecurrence] = useState("DAILY")
  const [formNextRun, setFormNextRun] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Process
  const [processing, setProcessing] = useState(false)

  const fetchSchedules = useCallback(async () => {
    try {
      const data = await getAdvSchedules()
      setSchedules(data)
    } catch {
      setError("فشل في تحميل الجداول")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  async function handleCreate(formData: FormData) {
    setFormError(null)
    if (!formName.trim()) {
      setFormError("اسم الجدول مطلوب")
      return
    }
    if (!formNextRun) {
      setFormError("تاريخ التشغيل التالي مطلوب")
      return
    }

    setFormSubmitting(true)
    formData.set("name", formName)
    formData.set("recurrence", formRecurrence)
    formData.set("nextRunAt", formNextRun)

    const result = await createAdvScheduleAction(
      { status: "idle" },
      formData,
    )
    setFormSubmitting(false)

    if (result.status === "success") {
      setShowForm(false)
      setFormName("")
      setFormRecurrence("DAILY")
      setFormNextRun("")
      await fetchSchedules()
    } else if (result.status === "error") {
      setFormError(result.error)
    }
  }

  async function handleProcessDue() {
    setProcessing(true)
    setError(null)
    try {
      const result = await processDueSchedulesAction()
      if (result.tasksCreated > 0) {
        await fetchSchedules()
      }
    } catch {
      setError("فشل في معالجة الجداول المستحقة")
    } finally {
      setProcessing(false)
    }
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
    <main className="p-8 max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/office-ai/advanced">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <CalendarClock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">الجداول المتكررة</h1>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleProcessDue} disabled={processing}>
          {processing ? (
            <Loader2 className="h-4 w-4 ml-1 animate-spin" />
          ) : (
            <Play className="h-4 w-4 ml-1" />
          )}
          معالجة الجداول المستحقة
        </Button>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 ml-1" />
          {showForm ? "إلغاء" : "جدول جديد"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">إنشاء جدول جديد</CardTitle>
            <CardDescription>
              جدول زمني متكرر لتنفيذ المهام بشكل دوري
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">اسم الجدول</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="مثال: تقرير أسبوعي"
                  />
                </div>
                <div>
                  <Label htmlFor="recurrence">التكرار</Label>
                  <Select value={formRecurrence} onValueChange={setFormRecurrence}>
                    <SelectTrigger id="recurrence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">يومي</SelectItem>
                      <SelectItem value="WEEKLY">أسبوعي</SelectItem>
                      <SelectItem value="MONTHLY">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nextRunAt">تاريخ التشغيل التالي</Label>
                  <Input
                    id="nextRunAt"
                    type="datetime-local"
                    value={formNextRun}
                    onChange={(e) => setFormNextRun(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? (
                  <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                ) : null}
                حفظ الجدول
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الجداول</CardTitle>
          <CardDescription>
            {schedules.length} جدول متكرر
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              لا توجد جداول. أنشئ أول جدول بالضغط على "جدول جديد".
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>التكرار</TableHead>
                  <TableHead>التشغيل التالي</TableHead>
                  <TableHead>آخر تشغيل</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {RECURRENCE_LABELS[s.recurrence] ?? s.recurrence}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(s.nextRunAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.lastRunAt
                        ? new Date(s.lastRunAt).toLocaleDateString("ar-SA")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "outline"}>
                        {s.isActive ? "نشط" : "غير نشط"}
                      </Badge>
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
