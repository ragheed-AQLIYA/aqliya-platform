/**
 * Phase 28.3 — Knowledge Foundation KPI Cards with lifecycle + candidate metrics.
 */
import {
  BookOpen,
  Layers,
  RotateCcw,
  Package,
  AlertTriangle,
  Users,
  Link2,
  Rocket,
} from "lucide-react";
import type { FoundationKPIs } from "@/lib/knowledge-foundation/types";

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
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function FoundationKpiCards({
  kpis,
}: {
  kpis: FoundationKPIs | { error: string };
}) {
  console.error(JSON.stringify({ event: "KF_RENDER_ENTER", component: "FoundationKpiCards" }));

  if ("error" in kpis) {
    console.error(JSON.stringify({ event: "KF_RENDER_EXIT", component: "FoundationKpiCards" }));
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

  const { versionCounts, candidateMetrics } = kpis;

  console.error(JSON.stringify({ event: "KF_RENDER_EXIT", component: "FoundationKpiCards" }));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الإصدار النشط"
          value={kpis.activeVersion ?? "—"}
          sub="المعرفة المؤسسية النشطة"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          label="إجمالي الإصدارات"
          value={kpis.totalVersions}
          sub="الإصدارات المسجلة"
          icon={<Layers className="h-4 w-4" />}
        />
        <StatCard
          label="الإطلاقات"
          value={kpis.totalReleases}
          sub="الحزم المصدرة"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          label="الاسترجاعات"
          value={kpis.rollbackCount}
          sub="عمليات الرجوع"
          icon={<RotateCcw className="h-4 w-4" />}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          توزيع حالات الإصدارات
        </h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="مسودة" value={versionCounts.DRAFT} icon={<Layers className="h-4 w-4" />} />
          <StatCard label="معتمد" value={versionCounts.APPROVED} icon={<Layers className="h-4 w-4" />} />
          <StatCard label="مُطلق" value={versionCounts.RELEASED} icon={<Rocket className="h-4 w-4" />} />
          <StatCard label="نشط" value={versionCounts.ACTIVE} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard label="متقاعد" value={versionCounts.DEPRECATED} icon={<Layers className="h-4 w-4" />} />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          مؤشرات المرشّحات
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="متاحة للربط"
            value={candidateMetrics.eligiblePromoted}
            sub="مُرقّاة غير مرتبطة"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="مرتبطة"
            value={candidateMetrics.boundCandidates}
            sub="في إصدارات"
            icon={<Link2 className="h-4 w-4" />}
          />
          <StatCard
            label="مُطلقة"
            value={candidateMetrics.releasedCandidates}
            sub="ضمن حزم إطلاق"
            icon={<Rocket className="h-4 w-4" />}
          />
          <StatCard
            label="متوسط الثقة"
            value={`${(candidateMetrics.averageConfidence * 100).toFixed(0)}%`}
            sub="مجمع المُرقّاة"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            label="متوسط الأدلة"
            value={candidateMetrics.averageEvidenceCount.toFixed(1)}
            sub="لكل مرشّح مُرقّى"
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
