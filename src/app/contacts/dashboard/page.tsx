/* eslint-disable @typescript-eslint/no-explicit-any */
import { unstable_noStore as noStore } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Activity,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

function sensitivityBadge(level: string) {
  const map: Record<string, { label: string; className: string }> = {
    normal: { label: "عادي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    sensitive: { label: "حساس", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    confidential: { label: "سري", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };
  const entry = map[level] || map.normal;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

function exportStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    none: { label: "لم يطلب", className: "bg-gray-100 text-gray-800" },
    requested: { label: "قيد الموافقة", className: "bg-blue-100 text-blue-800" },
    approved: { label: "معتمد", className: "bg-green-100 text-green-800" },
    rejected: { label: "مرفوض", className: "bg-red-100 text-red-800" },
    exported: { label: "تم التصدير", className: "bg-purple-100 text-purple-800" },
  };
  const entry = map[status] || map.none;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

export default async function ContactsDashboardPage() {
  noStore();
  const user = await requireUserContext("VIEWER");

  const orgId = user.organizationId;

  // Aggregate metrics in parallel
  const [
    totalContacts,
    sensitivityCounts,
    exportStatusCounts,
    recentInteractions,
    reviewStats,
    recentContacts,
  ] = await Promise.all([
    prisma.localContact.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.localContact.groupBy({
      by: ["sensitivityLevel"],
      where: { organizationId: orgId, isActive: true },
      _count: true,
    }),
    prisma.localContact.groupBy({
      by: ["exportStatus"],
      where: { organizationId: orgId, isActive: true },
      _count: true,
    }),
    prisma.localContactInteraction.findMany({
      where: { organizationId: orgId },
      include: { contact: { select: { id: true, name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    prisma.contactReview.findMany({
      where: { organizationId: orgId },
      select: { status: true },
    }),
    prisma.localContact.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, sensitivityLevel: true, position: true, organizationName: true, createdAt: true },
    }),
  ]);

  const getCount = (items: { _count: number }[], key: string) => {
    const found = items.find((i) => (i as any).sensitivityLevel === key || (i as any).exportStatus === key);
    return found?._count ?? 0;
  };

  const normalCount = getCount(sensitivityCounts, "normal");
  const sensitiveCount = getCount(sensitivityCounts, "sensitive");
  const confidentialCount = getCount(sensitivityCounts, "confidential");

  const pendingReviews = reviewStats.filter((r) => r.status === "pending").length;
  const approvedReviews = reviewStats.filter((r) => r.status === "approved").length;
  const rejectedReviews = reviewStats.filter((r) => r.status === "rejected").length;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">لوحة علاقات المؤسسات</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/contacts">
              <Button variant="outline">
                <Users className="ml-2 h-4 w-4" />
                جهات الاتصال
              </Button>
            </Link>
            <Link href="/contacts/new">
              <Button>
                <UserPlus className="ml-2 h-4 w-4" />
                إضافة جهة اتصال
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                إجمالي جهات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalContacts}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                جهات حساسة وسرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{sensitiveCount + confidentialCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {sensitiveCount} حساس • {confidentialCount} سري
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                مراجعات معلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${pendingReviews > 0 ? "text-amber-600" : "text-green-600"}`}>
                {pendingReviews}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {approvedReviews} معتمدة • {rejectedReviews} مرفوضة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                آخر التفاعلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recentInteractions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">آخر 10 تفاعلات مسجلة</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensitivity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                توزيع مستويات الحساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>عادي</span>
                    <span className="font-medium">{normalCount}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${totalContacts > 0 ? (normalCount / totalContacts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>حساس</span>
                    <span className="font-medium">{sensitiveCount}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full"
                      style={{ width: `${totalContacts > 0 ? (sensitiveCount / totalContacts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>سري</span>
                    <span className="font-medium">{confidentialCount}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{ width: `${totalContacts > 0 ? (confidentialCount / totalContacts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                حالة التصدير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["none", "requested", "approved", "rejected", "exported"] as const).map((status) => {
                const count = getCount(exportStatusCounts, status);
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm">{exportStatusBadge(status)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Reviews Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                ملخص المراجعات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingReviews}</p>
                  <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedReviews}</p>
                  <p className="text-sm text-muted-foreground">معتمدة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedReviews}</p>
                  <p className="text-sm text-muted-foreground">مرفوضة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              آخر التفاعلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInteractions.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا توجد تفاعلات مسجلة</p>
            ) : (
              <div className="space-y-3">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {interactionTypeLabel(interaction.interactionType)}
                      </Badge>
                      <div>
                        <Link
                          href={`/contacts/${interaction.contact.id}`}
                          className="font-medium hover:underline text-sm"
                        >
                          {interaction.contact.name}
                        </Link>
                        {interaction.subject && (
                          <p className="text-xs text-muted-foreground">{interaction.subject}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interaction.occurredAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أحدث جهات الاتصال
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا توجد جهات اتصال</p>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[contact.position, contact.organizationName].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {sensitivityBadge(contact.sensitivityLevel)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function interactionTypeLabel(type: string) {
  const map: Record<string, string> = {
    meeting: "اجتماع",
    call: "مكالمة",
    email: "بريد إلكتروني",
    message: "رسالة",
    note: "ملاحظة",
    other: "أخرى",
  };
  return map[type] || type;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
