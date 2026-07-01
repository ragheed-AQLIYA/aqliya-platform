/**
 * Phase 8.1 — Knowledge Review KPI Cards widget.
 *
 * Displays operational metrics from the existing getKnowledgeMiningKPIs service.
 * Pure rendering of server-provided data — no direct Prisma access.
 */

import {
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import type { KnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/types";

type KpiData = KnowledgeMiningKPIs | { error: string };

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight">
        {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
      </div>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

export function KpiCards({ kpis }: { kpis: KpiData }) {
  if ("error" in kpis) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        role="alert"
      >
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>تعذّر تحميل مؤشرات الأداء: {kpis.error}</span>
      </div>
    );
  }

  const rate = kpis.approvalRate !== null
    ? `${Math.round(kpis.approvalRate * 100)}%`
    : "—";
  const promo = kpis.promotionRate !== null
    ? `${Math.round(kpis.promotionRate * 100)}%`
    : "—";
  const coverage = kpis.knowledgeCoverage !== null
    ? `${Math.round(kpis.knowledgeCoverage * 100)}%`
    : "—";

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="إجمالي المرشّحين"
        value={kpis.totalCandidates}
        icon={<FileText className="h-4 w-4 text-primary" />}
      />
      <StatCard
        label="قيد المراجعة"
        value={kpis.byStatus.UNDER_REVIEW ?? 0}
        icon={<Activity className="h-4 w-4 text-amber-600" />}
      />
      <StatCard
        label="معدّل الاعتماد"
        value={rate}
        sub={kpis.approvalRate !== null ? "من المرشّحات التي تمت مراجعتها" : undefined}
        icon={<CheckCircle className="h-4 w-4 text-green-600" />}
      />
      <StatCard
        label="معدّل الترقية"
        value={promo}
        sub={kpis.promotionRate !== null ? "من المعتمدة تم ترقيتها" : undefined}
        icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
      />

      {/* Second row — conditional */}
      <StatCard
        label="إجمالي أدلة المرشّحين"
        value={kpis.totalEvidenceRecords}
        icon={<BarChart3 className="h-4 w-4 text-violet-600" />}
      />
      <StatCard
        label="تم الرفض"
        value={kpis.byStatus.REJECTED ?? 0}
        icon={<XCircle className="h-4 w-4 text-red-600" />}
      />
      <StatCard
        label="تم الترقية"
        value={kpis.byStatus.PROMOTED ?? 0}
        icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
      />
      <StatCard
        label="تغطية المعرفة"
        value={coverage}
        sub={kpis.knowledgeCoverage !== null ? "من الحسابات الموحّدة" : undefined}
        icon={<Activity className="h-4 w-4 text-indigo-600" />}
      />
    </section>
  );
}
