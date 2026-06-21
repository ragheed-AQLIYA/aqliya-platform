"use client";

import Link from "next/link";
import {
  AlertCircle,
  Activity,
  ArrowLeft,
  Bell,
  ShieldCheck,
  Brain,
  Globe,
  TrendingUp,
  KanbanSquare,
  Settings,
} from "lucide-react";
import { useSSENotifications } from "@/lib/hooks/use-sse-notifications";

// ─── Product badge ─────────────────────────────────────────────────────────

const productBadge: Record<
  string,
  { label: string; labelAr: string; color: string; icon: React.ReactNode }
> = {
  audit: {
    label: "AuditOS",
    labelAr: "نظام التدقيق",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  decision: {
    label: "DecisionOS",
    labelAr: "نظام القرارات",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <Brain className="h-3.5 w-3.5" />,
  },
  workflow: {
    label: "WorkflowOS",
    labelAr: "سير العمل",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    icon: <KanbanSquare className="h-3.5 w-3.5" />,
  },
  localcontent: {
    label: "LocalContentOS",
    labelAr: "المحتوى المحلي",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <Globe className="h-3.5 w-3.5" />,
  },
  sales: {
    label: "SalesOS",
    labelAr: "المبيعات",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
  platform: {
    label: "Platform",
    labelAr: "المنصة",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: <Settings className="h-3.5 w-3.5" />,
  },
};

function ProductBadge({ productKey }: { productKey: string }) {
  const badge = productBadge[productKey] ?? {
    label: productKey,
    labelAr: productKey,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    icon: <Activity className="h-3.5 w-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}
    >
      {badge.icon}
      {badge.labelAr}
    </span>
  );
}

// ─── Severity badge ────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  switch (severity) {
    case "critical":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-3 w-3" />
          حرج
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertCircle className="h-3 w-3" />
          تحذير
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <Activity className="h-3 w-3" />
          معلومات
        </span>
      );
  }
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications, counts, connected, error } = useSSENotifications();

  const total = notifications.length;

  const critical = notifications.filter((n) => n.severity === "critical");
  const warning = notifications.filter((n) => n.severity === "warning");
  const info = notifications.filter((n) => n.severity === "info");

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              مركز التنبيهات
            </h1>
            {/* Connection status indicator */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                connected
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {connected ? "متصل" : "غير متصل"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            جميع التنبيهات والإشعارات من منتجات المنصة
          </p>
        </div>
        <Link
          href="/overview"
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          العودة للوحة المنصة
        </Link>
      </div>

      {/* ── Connection error banner ────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-3 text-center text-xs text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* ── Summary counters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/20 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {counts.critical}
          </div>
          <div className="text-xs text-muted-foreground mt-1">حرجة</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {counts.warning}
          </div>
          <div className="text-xs text-muted-foreground mt-1">تحذيرات</div>
        </div>
        <div className="rounded-xl border border-gray-300 dark:border-gray-700 bg-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{counts.info}</div>
          <div className="text-xs text-muted-foreground mt-1">معلومات</div>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground">
            لا توجد تنبيهات
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            جميع الأنظمة تعمل بشكل طبيعي. لا توجد إشعارات أو تنبيهات تحتاج إلى
            متابعة.
          </p>
        </div>
      )}

      {/* ── Critical section ───────────────────────────────────────────── */}
      {critical.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            حرجة ({critical.length})
          </h2>
          <div className="space-y-2">
            {critical.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        </section>
      )}

      {/* ── Warning section ────────────────────────────────────────────── */}
      {warning.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            تحذيرات ({warning.length})
          </h2>
          <div className="space-y-2">
            {warning.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        </section>
      )}

      {/* ── Info section ────────────────────────────────────────────────── */}
      {info.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            معلومات ({info.length})
          </h2>
          <div className="space-y-2">
            {info.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Notification card component ────────────────────────────────────────────

function NotificationCard({
  notification: n,
}: {
  notification: {
    id: string;
    productKey: string;
    severity: string;
    title: string;
    description: string;
    href: string;
    createdAt: string;
  };
}) {
  const borderColor =
    n.severity === "critical"
      ? "border-r-red-500"
      : n.severity === "warning"
        ? "border-r-amber-500"
        : "border-r-gray-300 dark:border-r-gray-600";

  return (
    <Link
      href={n.href}
      className={`block rounded-xl border border-r-4 bg-card p-4 shadow-sm transition-all hover:shadow-md ${borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <ProductBadge productKey={n.productKey} />
            <SeverityBadge severity={n.severity} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {n.description}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-2">
            {new Date(n.createdAt).toLocaleString("ar-SA", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <ArrowLeft className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
      </div>
    </Link>
  );
}
