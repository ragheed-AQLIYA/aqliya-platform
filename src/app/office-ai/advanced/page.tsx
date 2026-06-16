"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutList,
  CalendarClock,
  UserCog,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Layers,
} from "lucide-react"
import type { OfficeAiTaskStats } from "@/lib/platform/office-ai-adv"
import { getAdvStats } from "./actions"

export default function OfficeAiAdvancedPage() {
  const [stats, setStats] = useState<OfficeAiTaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdvStats()
      setStats(data)
    } catch {
      setError("فشل في تحميل الإحصائيات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

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
      <div className="flex items-center gap-3 mb-2">
        <Layers className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">الذكاء المكتبي المتقدم</h1>
          <p className="text-sm text-muted-foreground">
            إدارة قوالب سير العمل والجداول وإعدادات الأدوار
          </p>
        </div>
        <Badge variant="outline" className="mr-auto">Advanced</Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المهام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold">{stats?.total ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المهام المكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-3xl font-bold">{stats?.completed ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المهام المتأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-3xl font-bold">{stats?.overdue ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل الإنجاز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-3xl font-bold">
                {stats ? `${Math.round((stats.completionRate ?? 0) * 100)}%` : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/office-ai/advanced/templates" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutList className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">قوالب سير العمل</CardTitle>
              </div>
              <CardDescription>
                إنشاء وإدارة قوالب سير العمل المتقدمة مع خطوات متعددة وأدوار مخصصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="h-4 w-4 ml-1" />
                إدارة القوالب
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/office-ai/advanced/schedules" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">الجداول المتكررة</CardTitle>
              </div>
              <CardDescription>
                إعداد جداول زمنية متكررة لتنفيذ المهام بشكل دوري
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="h-4 w-4 ml-1" />
                إدارة الجداول
              </Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/office-ai/advanced/role-config" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">إعدادات الأدوار</CardTitle>
              </div>
              <CardDescription>
                تكوين أدوار الذكاء الاصطناعي لكل دور في المؤسسة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="h-4 w-4 ml-1" />
                إدارة الأدوار
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Task Breakdown */}
      {stats && Object.keys(stats.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">توزيع المهام حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Breakdown - Empty */}
      {stats && Object.keys(stats.byType).length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مهام بعد</p>
            <p className="text-sm mt-1">قم بإنشاء قالب أو جدولة مهمة للبدء</p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
