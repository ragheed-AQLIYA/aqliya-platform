import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Globe,
  KanbanSquare,
  TrendingUp,
  Users,
  ShieldCheck,
  Activity,
  ArrowLeft,
  Building2,
  FileText,
  ScrollText,
  BarChart3,
  AlertCircle,
  HeartPulse,
  Bell,
} from "lucide-react";
import { getPlatformHealthAction } from "@/actions/platform-overview-actions";
import { OverviewClient } from "./overview-client";

// ─── Types ────────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string;
  labelAr: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  color: string;
};

type ActivityEntry = {
  id: string;
  productKey: string;
  action: string;
  targetLabel: string | null;
  actorName: string | null;
  createdAt: Date;
  severity: string;
};

// ─── Metric card ──────────────────────────────────────────────────────────

function MetricCard({ label, labelAr, value, icon, href, color }: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={color}>{icon}</span>
        <span className="truncate">{labelAr}</span>
        <span dir="ltr" className="text-[10px] text-muted-foreground/50 mr-auto">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
        </span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors mr-auto" />
      </div>
    </Link>
  );
}

// ─── Health card ──────────────────────────────────────────────────────────

function HealthCard({
  healthScore,
  status,
  aiRunsToday,
  pendingReviews,
  failedWorkflows,
  activeUsersToday,
  auditEventsToday,
}: {
  healthScore: number;
  status: string;
  aiRunsToday: number;
  pendingReviews: number;
  failedWorkflows: number;
  activeUsersToday: number;
  auditEventsToday: number;
}) {
  const statusIcon =
    status === "healthy" ? "🟢" : status === "warning" ? "🟡" : "🔴";
  const statusAr =
    status === "healthy"
      ? "سليم"
      : status === "warning"
        ? "تحذير"
        : "حرج";
  const borderColor =
    status === "healthy"
      ? "border-green-500/30"
      : status === "warning"
        ? "border-amber-500/30"
        : "border-red-500/30";
  const bgColor =
    status === "healthy"
      ? "bg-green-50 dark:bg-green-950/20"
      : status === "warning"
        ? "bg-amber-50 dark:bg-amber-950/20"
        : "bg-red-50 dark:bg-red-950/20";

  return (
    <div
      className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5 shadow-sm transition-all`}
    >
      <div className="flex items-center gap-3 mb-4">
        <HeartPulse className="h-6 w-6 text-foreground" />
        <div>
          <h2 className="text-base font-semibold">صحة المنصة</h2>
          <p className="text-[11px] text-muted-foreground">Platform Health</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="text-2xl font-bold">{statusIcon}</span>
          <span className="text-lg font-bold">{healthScore}%</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              status === "healthy"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : status === "warning"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {statusAr}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <HealthStat label="تشغيلات الذكاء" value={aiRunsToday} />
        <HealthStat label="مراجعات معلقة" value={pendingReviews} />
        <HealthStat label="إجراءات فاشلة" value={failedWorkflows} />
        <HealthStat label="المستخدمين النشطين" value={activeUsersToday} />
        <HealthStat label="أحداث التدقيق" value={auditEventsToday} />
      </div>
    </div>
  );
}

function HealthStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background/60 dark:bg-background/10 p-2.5 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

// ─── Product badge ─────────────────────────────────────────────────────────

const productBadge: Record<string, { label: string; color: string }> = {
  audit: { label: "AuditOS", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  decision: { label: "DecisionOS", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  workflow: { label: "WorkflowOS", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  localcontent: { label: "LocalContentOS", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  sales: { label: "SalesOS", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

function ProductBadge({ productKey }: { productKey: string }) {
  const badge = productBadge[productKey] ?? { label: productKey, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
      {badge.label}
    </span>
  );
}

// ─── Severity icon ─────────────────────────────────────────────────────────

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity) {
    case "error":
    case "critical":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
    case "warn":
    case "warning":
      return <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    default:
      return <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
}

// ─── Main page ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export default async function PlatformOverview() {
  // Auth
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  // ── Platform health ─────────────────────────────────────────────────────
  const health = await getPlatformHealthAction();

  // ── Product counts ──────────────────────────────────────────────────────
  const [decisionCount, salesDealCount, workflowRecordCount, localContactCount, localContentProjectCount, totalAuditEvents] =
    await Promise.all([
      prisma.decision.count().catch(() => 0),
      prisma.salesDeal.count().catch(() => 0),
      prisma.workflowRecord.count().catch(() => 0),
      prisma.localContact.count().catch(() => 0),
      prisma.localContentProject.count().catch(() => 0),
      prisma.platformAuditLog.count().catch(() => 0),
    ]);

  // ── Recent cross-product activity ────────────────────────────────────────
  const recentActivity: ActivityEntry[] = await prisma.platformAuditLog
    .findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productKey: true,
        action: true,
        targetLabel: true,
        actorName: true,
        createdAt: true,
        severity: true,
      },
    })
    .catch(() => []);

  // ── Product-level recent items ──────────────────────────────────────────
  const [recentDecisions, recentSalesDeals] = await Promise.all([
    prisma.decision
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
    prisma.salesDeal
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      })
      .catch(() => []),
  ]);

  const metrics: MetricCardProps[] = [
    {
      label: "Decisions",
      labelAr: "القرارات",
      value: decisionCount,
      icon: <Brain className="h-5 w-5" />,
      href: "/decisions",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Sales Deals",
      labelAr: "صفقات المبيعات",
      value: salesDealCount,
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/sales",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Workflows",
      labelAr: "سجلات سير العمل",
      value: workflowRecordCount,
      icon: <KanbanSquare className="h-5 w-5" />,
      href: "/workflowos",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Local Contacts",
      labelAr: "جهات الاتصال المؤسسية",
      value: localContactCount,
      icon: <Building2 className="h-5 w-5" />,
      href: "/contacts",
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Local Content",
      labelAr: "مشاريع المحتوى المحلي",
      value: localContentProjectCount,
      icon: <Globe className="h-5 w-5" />,
      href: "/local-content",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Audit Events",
      labelAr: "أحداث التدقيق",
      value: totalAuditEvents,
      icon: <ScrollText className="h-5 w-5" />,
      href: "/settings/audit-logs",
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Notifications",
      labelAr: "التنبيهات",
      value: "→",
      icon: <Bell className="h-5 w-5" />,
      href: "/notifications",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <OverviewClient>
      <div className="space-y-8" dir="rtl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              لوحة المنصة الموحدة
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              نظرة شاملة على جميع منتجات AQLIYA — القرارات، المبيعات، سير العمل، المحتوى المحلي، وجهات الاتصال
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            مركز التنبيهات
          </Link>
        </div>

        {/* ── Health Card ────────────────────────────────────────────────── */}
        <HealthCard
          healthScore={health.healthScore}
          status={health.status}
          aiRunsToday={health.aiRunsToday}
          pendingReviews={health.pendingReviews}
          failedWorkflows={health.failedWorkflows}
          activeUsersToday={health.activeUsersToday}
          auditEventsToday={health.auditEventsToday}
        />

        {/* ── Metrics Grid ────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Recent Platform Activity ─────────────────────────────────── */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">آخر النشاطات في المنصة</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد نشاطات بعد</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  ستظهر النشاطات هنا عند بدء استخدام المنتجات
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <SeverityIcon severity={entry.severity} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ProductBadge productKey={entry.productKey} />
                        <span className="font-medium text-foreground">{entry.action}</span>
                      </div>
                      {entry.targetLabel && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {entry.targetLabel}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {entry.actorName && (
                          <span className="text-[11px] text-muted-foreground/70">
                            {entry.actorName}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground/50">
                          {new Date(entry.createdAt).toLocaleString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recentActivity.length > 0 && (
              <Link
                href="/settings/audit-logs"
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                عرض كل النشاطات
                <ArrowLeft className="h-3 w-3" />
              </Link>
            )}
          </section>

          {/* ── Right column: Recent items per product ──────────────────── */}
          <div className="space-y-4">
            {/* Recent Decisions */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-purple-600" />
                <h2 className="text-sm font-semibold">آخر القرارات</h2>
                <Link
                  href="/decisions"
                  className="mr-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  عرض الكل
                </Link>
              </div>
              {recentDecisions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">لا توجد قرارات بعد</p>
              ) : (
                <div className="space-y-1">
                  {recentDecisions.map((d) => (
                    <Link
                      key={d.id}
                      href={`/decisions/${d.id}`}
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <Brain className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(d.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Sales Deals */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-semibold">آخر صفقات المبيعات</h2>
                <Link
                  href="/sales"
                  className="mr-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  عرض الكل
                </Link>
              </div>
              {recentSalesDeals.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">لا توجد صفقات بعد</p>
              ) : (
                <div className="space-y-1">
                  {recentSalesDeals.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{d.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Quick Links */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold mb-3">الوصول السريع</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/decisions", label: "لوحة القرارات", icon: Brain, color: "text-purple-600" },
                  { href: "/sales", label: "لوحة المبيعات", icon: TrendingUp, color: "text-amber-600" },
                  { href: "/workflowos", label: "سير العمل", icon: KanbanSquare, color: "text-cyan-600" },
                  { href: "/contacts", label: "جهات الاتصال", icon: Building2, color: "text-sky-600" },
                  { href: "/local-content", label: "المحتوى المحلي", icon: Globe, color: "text-emerald-600" },
                  { href: "/settings", label: "الإعدادات", icon: SettingsIcon, color: "text-gray-600" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <link.icon className={`h-4 w-4 shrink-0 ${link.color}`} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </OverviewClient>
  );
}

// Settings icon — Lucide doesn't export this as SettingsIcon
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
