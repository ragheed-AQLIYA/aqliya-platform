export const dynamic = "force-dynamic";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { AlertCircle, Clock, Activity, Shield } from "lucide-react";
import {
  getEscalationRules,
  getGovernanceEvents,
  getActiveEscalationsAction,
} from "./actions";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getActionBadge(action: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    APPROVE: "default",
    REJECT: "destructive",
    SUBMIT: "secondary",
    EXPORT: "outline",
    ARCHIVE: "outline",
    ESCALATE: "destructive",
  };
  return map[action] ?? "secondary";
}

function getActionLabel(action: string): string {
  const map: Record<string, string> = {
    SUBMIT: "تقديم",
    APPROVE: "اعتماد",
    REJECT: "رفض",
    EXPORT: "تصدير",
    ARCHIVE: "أرشفة",
    ESCALATE: "تصعيد",
  };
  return map[action] ?? action;
}

export default async function DecisionGovDashboardPage() {
  const [rulesResult, eventsResult, escalationsResult] = await Promise.all([
    getEscalationRules().catch(e => ({ success: false as const, error: (e as Error).message })),
    getGovernanceEvents().catch(e => ({ success: false as const, error: (e as Error).message })),
    getActiveEscalationsAction().catch(e => ({ success: false as const, error: (e as Error).message })),
  ]);

  const errors: string[] = []
  if (!rulesResult.success) errors.push(`قواعد التصعيد: ${rulesResult.error}`)
  if (!eventsResult.success) errors.push(`أحداث الحوكمة: ${eventsResult.error}`)
  if (!escalationsResult.success) errors.push(`التصعيدات النشطة: ${escalationsResult.error}`)

  const rules = rulesResult.success ? rulesResult.data : []
  const events = eventsResult.success ? eventsResult.data : []
  const escalations = escalationsResult.success ? escalationsResult.data : []

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">حوكمة القرارات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            قواعد التصعيد، سجل الأحداث، وإدارة دورة اعتماد القرارات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/decisions/gov/escalation-rules">
            <Button variant="outline">إدارة قواعد التصعيد</Button>
          </Link>
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4 text-sm text-red-800 dark:text-red-200 space-y-1">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              قواعد التصعيد
            </CardTitle>
            <CardDescription>قواعد التصعيد النشطة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {rules.filter((r) => r.isActive).length} نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-destructive" />
              تصعيدات نشطة
            </CardTitle>
            <CardDescription>قرارات تجاوزت المهلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{escalations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              بحاجة إلى مراجعة عاجلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              الأحداث
            </CardTitle>
            <CardDescription>آخر أحداث الحوكمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground mt-1">حدث مسجل</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">قواعد التصعيد</CardTitle>
          <CardDescription>
            قواعد تحدد متى يتم تصعيد القرار للمراجعين
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>لا توجد قواعد تصعيد بعد</p>
              <Link href="/decisions/gov/escalation-rules">
                <Button variant="outline" className="mt-3" size="sm">
                  إنشاء قاعدة تصعيد
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدور المستهدف</TableHead>
                  <TableHead>المهلة (ساعات)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.targetRoleSlug}</TableCell>
                    <TableCell>{rule.escalateAfterHours}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "نشط" : "متوقف"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(rule.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">التصعيدات النشطة</CardTitle>
          <CardDescription>القرارات التي تجاوزت المهلة الزمنية للمراجعة</CardDescription>
        </CardHeader>
        <CardContent>
          {escalations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>لا توجد تصعيدات نشطة — جميع القرارات ضمن المهلة</p>
            </div>
          ) : (
            <div className="divide-y">
              {escalations.map((esc, idx) => (
                <div key={idx} className="flex items-start justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{esc.decisionTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      الدور المستهدف: {esc.targetRoleSlug}
                    </p>
                  </div>
                  <Badge variant="destructive">متأخر</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">سجل أحداث الحوكمة</CardTitle>
          <CardDescription>آخر 50 حدث عبر جميع القرارات</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>لا توجد أحداث حوكمة مسجلة بعد</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الإجراء</TableHead>
                  <TableHead>من الحالة</TableHead>
                  <TableHead>إلى الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant={getActionBadge(event.action)}>
                        {getActionLabel(event.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.fromStatus}</TableCell>
                    <TableCell>{event.toStatus}</TableCell>
                    <TableCell>{formatDate(event.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
