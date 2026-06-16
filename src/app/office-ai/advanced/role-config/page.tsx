"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCog, Loader2, ArrowLeft } from "lucide-react"
import type { OfficeAiRoleConfig } from "@/lib/platform/office-ai-adv"
import { getAdvRoleConfig } from "../actions"

export default function RoleConfigPage() {
  const [configs, setConfigs] = useState<OfficeAiRoleConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const data = await getAdvRoleConfig()
      setConfigs(Array.isArray(data) ? data : [])
    } catch {
      setError("فشل في تحميل إعدادات الأدوار")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Link href="/office-ai/advanced">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 ml-1" />
            العودة
          </Button>
        </Link>
        <UserCog className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">إعدادات الأدوار</h1>
          <p className="text-sm text-muted-foreground">تكوين سلوك الذكاء الاصطناعي لكل دور في المؤسسة</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      )}

      {configs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <UserCog className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد إعدادات أدوار بعد</p>
            <p className="text-sm mt-1">سيتم إنشاء الإعدادات الافتراضية تلقائياً عند الحاجة</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إعدادات الأدوار الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدور</TableHead>
                  <TableHead>السماح بالذكاء الاصطناعي</TableHead>
                  <TableHead>الحد الأقصى للمهام</TableHead>
                  <TableHead>أنواع المهام المسموحة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((cfg) => (
                  <TableRow key={cfg.id}>
                    <TableCell className="font-medium">{cfg.roleSlug}</TableCell>
                    <TableCell>
                      <Badge variant={!cfg.requireApproval ? "default" : "secondary"}>
                        {!cfg.requireApproval ? "مفعل" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell>{cfg.maxTasksPerDay?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {cfg.allowedTaskTypes?.join(", ") || "الكل"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
