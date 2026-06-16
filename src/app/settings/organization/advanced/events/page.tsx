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
  Activity,
  Loader2,
  AlertTriangle,
  X,
  RefreshCw,
  ArrowLeft,
} from "lucide-react"
import type { OrgLifecycleEvent } from "@/lib/platform/org-advanced/org-adv-service"
import { getLifecycleEventsData } from "../actions"
import { LIFECYCLE_EVENT_TYPES } from "@/lib/platform/org-advanced/constants"
import Link from "next/link"

const EVENT_TYPE_LABELS: Record<string, string> = {
  CREATED: "إنشاء",
  UPDATED: "تحديث",
  USER_ADDED: "إضافة مستخدم",
  USER_REMOVED: "إزالة مستخدم",
  SETTINGS_CHANGED: "تغيير الإعدادات",
  HIERARCHY_CHANGED: "تغيير هيكل المنظمة",
  SUSPENDED: "تعليق",
  REACTIVATED: "إعادة تفعيل",
  MERGED: "دمج",
}

const EVENT_TYPE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATED: "default",
  UPDATED: "secondary",
  USER_ADDED: "default",
  USER_REMOVED: "destructive",
  SETTINGS_CHANGED: "secondary",
  HIERARCHY_CHANGED: "secondary",
  SUSPENDED: "destructive",
  REACTIVATED: "default",
  MERGED: "outline",
}

export default function OrgLifecycleEventsPage() {
  const [events, setEvents] = useState<OrgLifecycleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterType, setFilterType] = useState("all")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")

  const fetchEvents = useCallback(async () => {
    try {
      const filter: Record<string, unknown> = {}
      if (filterType !== "all") filter.eventType = filterType
      if (filterFrom) filter.fromDate = new Date(filterFrom)
      if (filterTo) {
        const end = new Date(filterTo)
        end.setHours(23, 59, 59, 999)
        filter.toDate = end
      }
      const data = await getLifecycleEventsData(
        Object.keys(filter).length > 0 ? (filter as any) : undefined,
      )
      setEvents(data)
    } catch {
      setError("فشل في تحميل الأحداث")
    } finally {
      setLoading(false)
    }
  }, [filterType, filterFrom, filterTo])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

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
        <Link href="/settings/organization/advanced">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">أحداث دورة حياة المنظمة</h1>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية الأحداث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[180px]">
              <Label className="text-xs">نوع الحدث</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {LIFECYCLE_EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {EVENT_TYPE_LABELS[type] ?? type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[180px]">
              <Label className="text-xs">من تاريخ</Label>
              <Input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </div>
            <div className="min-w-[180px]">
              <Label className="text-xs">إلى تاريخ</Label>
              <Input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchEvents}>
              <RefreshCw className="h-4 w-4 ml-1" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الأحداث</CardTitle>
          <CardDescription>
            {events.length} حدث في دورة حياة المنظمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              لا توجد أحداث مسجلة
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>بواسطة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={EVENT_TYPE_VARIANTS[event.eventType] ?? "outline"}>
                        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm">{event.description}</span>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-1">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            البيانات الوصفية
                          </summary>
                          <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                      {event.actorId ? `${event.actorId.slice(0, 12)}...` : "—"}
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
