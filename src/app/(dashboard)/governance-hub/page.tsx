import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Users,
  Scale,
} from "lucide-react";
import { getGovernanceDashboardAction, type GovernanceItem } from "@/actions/governance-actions";
import { GovernanceClient } from "./governance-client";

export const dynamic = "force-dynamic";

const productBadge: Record<string, { label: string; color: string }> = {
  decision: { label: "DecisionOS", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  workflow: { label: "WorkflowOS", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  localcontent: { label: "LocalContentOS", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  sales: { label: "SalesOS", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  risk: { label: "RiskOS", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  audit: { label: "AuditOS", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

function ProductBadge({ productKey }: { productKey: string }) {
  const badge = productBadge[productKey] ?? { label: productKey, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.color}`}>
      {badge.label}
    </span>
  );
}

const typeColors: Record<string, string> = {
  مراجعة: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  اعتماد: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  موافقة: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function TypeBadge({ type }: { type: string }) {
  const color = typeColors[type] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${color}`}>
      {type}
    </span>
  );
}

const priorityConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  high: { label: "حرج", color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  medium: { label: "عالية", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20", icon: <Clock className="h-3.5 w-3.5" /> },
  low: { label: "منخفضة", color: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800", icon: <Activity className="h-3.5 w-3.5" /> },
};

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] ?? priorityConfig.low;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function daysRemaining(deadline: Date): string {
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `متأخر بـ ${Math.abs(diff)} أيام`;
  if (diff === 0) return "اليوم";
  if (diff === 1) return "غداً";
  return `${diff} أيام متبقية`;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={color}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <span className="text-3xl font-bold tracking-tight text-foreground">
        {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
      </span>
    </div>
  );
}

function ItemCard({ item }: { item: GovernanceItem }) {
  const isCritical = (item.deadline && new Date() > item.deadline) || item.priority === "high";

  return (
    <Link
      href={item.href}
      className={`block rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 ${
        isCritical ? "border-red-300 dark:border-red-800" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <ProductBadge productKey={item.productKey} />
            <TypeBadge type={item.type} />
            <PriorityBadge priority={item.priority} />
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-snug">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {item.createdBy && (
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.createdBy}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground/50">
              {new Date(item.createdAt).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            {item.deadline && (
              <span className={`text-[11px] flex items-center gap-1 ${
                new Date() > item.deadline ? "text-red-500 font-medium" : "text-muted-foreground/70"
              }`}>
                <Clock className="h-3 w-3" />
                {daysRemaining(item.deadline)}
              </span>
            )}
          </div>
        </div>
        <ArrowLeft className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
      </div>
    </Link>
  );
}

export default async function GovernanceHub() {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const dashboard = await getGovernanceDashboardAction();
  const { items, stats } = dashboard;

  const criticalItems = items.filter(
    (i) => (i.deadline && new Date() > i.deadline) || i.priority === "high"
  );
  const mediumItems = items.filter(
    (i) => i.priority === "medium" && !(i.deadline && new Date() > i.deadline)
  );
  const lowItems = items.filter(
    (i) => i.priority === "low" && !(i.deadline && new Date() > i.deadline)
  );

  const productCount = Object.keys(stats.byProduct).length;

  return (
    <GovernanceClient>
      <div className="space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">مركز الحوكمة الموحد</h1>
            <p className="mt-1 text-sm text-muted-foreground">جميع المراجعات والموافقات المعلقة عبر المنصة</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="معلقة إجمالاً" value={stats.totalPending} icon={<AlertCircle className="h-5 w-5" />} color="text-primary" />
          <StatCard label="حرجة / متأخرة" value={stats.criticalCount} icon={<AlertTriangle className="h-5 w-5" />} color="text-red-600 dark:text-red-400" />
          <StatCard label="منتجات لديها عناصر" value={productCount} icon={<ShieldCheck className="h-5 w-5" />} color="text-purple-600 dark:text-purple-400" />
          <StatCard label="متوسط عمر الانتظار" value={`${stats.averageAge} يوم`} icon={<Clock className="h-5 w-5" />} color="text-amber-600 dark:text-amber-400" />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border bg-card shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">جميع العناصر في حالة سليمة</p>
            <p className="text-sm text-muted-foreground mt-1">لا توجد مراجعات معلقة حالياً</p>
          </div>
        ) : (
          <div className="space-y-8">
            {criticalItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h2 className="text-base font-semibold text-foreground">حرجة — تجاوزت التاريخ المحدد</h2>
                  <span className="mr-auto text-xs text-muted-foreground">{criticalItems.length} عنصر</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {criticalItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {mediumItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-foreground">عالية — بانتظار المراجعة</h2>
                  <span className="mr-auto text-xs text-muted-foreground">{mediumItems.length} عنصر</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mediumItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {lowItems.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">منخفضة — قيد الإعداد</h2>
                  <span className="mr-auto text-xs text-muted-foreground">{lowItems.length} عنصر</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lowItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </GovernanceClient>
  );
}
