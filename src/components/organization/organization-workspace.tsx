"use client";

import {
  Building2,
  Users,
  ShieldCheck,
  Brain,
  TrendingUp,
  KanbanSquare,
  ExternalLink,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { OrganizationSettingsButton } from "./organization-settings";

interface OrgData {
  orgId?: string;
  name: string;
  nameAr: string;
  userCounts: {
    admin: number;
    operator: number;
    viewer: number;
    total: number;
  };
  platformOrgId?: string;
  sunbulClientCount: number;
  sunbulMembershipCount: number;
  sunbulRecordCount: number;
  sunbulStatus: string;
}

export function OrganizationWorkspace({ data }: { data: OrgData }) {
  const products = [
    {
      name: "Sunbul",
      nameAr: "سنبل",
      icon: KanbanSquare,
      status: data.sunbulStatus,
      statusColor: "text-status-success",
      statusBg: "bg-status-success/10",
      href: "/sunbul",
      adminHref: "/sunbul/admin",
      note:
        data.sunbulRecordCount > 0
          ? `${data.sunbulClientCount} عملاء، ${data.sunbulRecordCount} قضية`
          : "جاهز للتفعيل — شغّل البذرة التجريبية أولاً",
      routeNote:
        "المسار الرسمي هو /sunbul بينما /workflowos محفوظ كـ alias داخلي.",
    },
    {
      name: "AuditOS",
      nameAr: "نظام التدقيق المالي",
      icon: ShieldCheck,
      status: "متاح",
      statusColor: "text-module-audit",
      statusBg: "bg-module-audit/10",
      href: "/audit",
      adminHref: null,
      note: "بوابة التدقيق المالي مع سير عمل الحوكمة",
      routeNote: null,
    },
    {
      name: "DecisionOS",
      nameAr: "نظام القرارات",
      icon: Brain,
      status: "متاح",
      statusColor: "text-module-decision",
      statusBg: "bg-module-decision/10",
      href: "/decisions",
      adminHref: null,
      note: "منصة حوكمة القرارات مع التحليل والتوصيات",
      routeNote: null,
    },
    {
      name: "SalesOS",
      nameAr: "نظام المبيعات",
      icon: TrendingUp,
      status: "نموذج أولي",
      statusColor: "text-module-sales",
      statusBg: "bg-module-sales/10",
      href: "/sales",
      adminHref: null,
      note: "لوحة المبيعات — قيد التطوير",
      routeNote: null,
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">{data.nameAr}</h1>
          <p className="text-sm text-muted-foreground">
            {data.name} — مساحة مؤسسة داخل عقلية تستخدم المنتجات المفعلة لها.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            إجمالي المستخدمين
          </div>
          <div className="text-2xl font-bold">{data.userCounts.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ShieldCheck className="h-4 w-4" />
            مشرفين
          </div>
          <div className="text-2xl font-bold">{data.userCounts.admin}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            مشغلين
          </div>
          <div className="text-2xl font-bold">{data.userCounts.operator}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            مراجعين
          </div>
          <div className="text-2xl font-bold">{data.userCounts.viewer}</div>
        </div>
      </div>

      {/* Enabled Products */}
      <section>
        <h2 className="text-lg font-semibold mb-4">المنتجات المفعلة</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.name}
              className="rounded-lg border bg-card p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <product.icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">{product.nameAr}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {product.name}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.statusColor} ${product.statusBg}`}
                >
                  {product.status}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">{product.note}</p>

              <div className="flex items-center gap-2">
                <Link
                  href={product.href}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  فتح {product.nameAr}
                  <ArrowLeft className="h-3 w-3" />
                </Link>
                {product.adminHref && (
                  <Link
                    href={product.adminHref}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    إدارة {product.nameAr}
                    <Settings className="h-3 w-3" />
                  </Link>
                )}
              </div>

              {product.routeNote && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    {product.routeNote}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Employees Summary */}
      <section>
        <h2 className="text-lg font-semibold mb-4">الموظفون والصلاحيات</h2>
        <div className="rounded-lg border bg-card divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-module-audit" />
              <span>مشرف المنصة (Platform Admin)</span>
            </div>
            <span className="text-sm font-semibold" dir="ltr">
              {data.userCounts.admin}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-module-decision" />
              <span>مشغل (Operator)</span>
            </div>
            <span className="text-sm font-semibold" dir="ltr">
              {data.userCounts.operator}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>مراجع (Reviewer)</span>
            </div>
            <span className="text-sm font-semibold" dir="ltr">
              {data.userCounts.viewer}
            </span>
          </div>
        </div>
        {data.sunbulMembershipCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {data.sunbulMembershipCount} عضوية في سنبل عبر{" "}
            {data.sunbulClientCount} عميل
          </p>
        )}
      </section>

      {/* Organization Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">إجراءات المؤسسة</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/sunbul/admin"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            إدارة سنبل
          </Link>
          <Link
            href="/sunbul"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            فتح سنبل
          </Link>
          {data.orgId && (
            <OrganizationSettingsButton
              orgId={data.orgId}
              currentName={data.name}
              platformOrgId={data.platformOrgId || ""}
            />
          )}
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
            title="قيد التطوير"
          >
            <Users className="h-4 w-4" />
            إدارة الموظفين
          </button>
        </div>
      </section>
    </div>
  );
}
