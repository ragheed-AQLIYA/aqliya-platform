import { Suspense } from "react";
import { getMonitoringMetrics } from "@/actions/dashboard-read-actions";
import { AiObservabilityCards } from "@/components/monitoring/ai-observability-cards";
import { EnterpriseHealthPanel } from "@/components/monitoring/enterprise-health-panel";
import { EvidenceHealthPanel } from "@/components/monitoring/evidence-health-panel";
import { TbFirmMemoryKpisPanel } from "@/components/monitoring/tb-firm-memory-kpis-panel";
import { LiveHealthCardsWrapper } from "@/components/monitoring/live-health-cards-wrapper";
import { PlatformOpsSection } from "@/components/monitoring/platform-ops-section";
import { MonitoringAutoRefresh } from "@/components/monitoring/monitoring-auto-refresh";
import { ProductHealthPanel } from "@/components/monitoring/product-health-panel";
import { SecurityMetricsPanel } from "@/components/monitoring/security-metrics-panel";
import { AuditLogHealthPanel } from "@/components/monitoring/audit-log-health-panel";

export const dynamic = "force-dynamic";

const CARD_STYLES = [
  "text-module-audit",
  "text-module-decision",
  "text-module-sales",
  "text-status-success",
  "text-orange-600",
  "text-purple-600",
  "text-cyan-600",
  "text-pink-600",
  "text-emerald-600",
  "text-indigo-600",
  "text-amber-600",
  "text-rose-600",
] as const;

async function MetricsCards() {
  const counts = await getMonitoringMetrics();
  const metrics = [
    { label: "مهام التدقيق", value: counts[0], color: CARD_STYLES[0] },
    { label: "القرارات", value: counts[1], color: CARD_STYLES[1] },
    { label: "العملاء", value: counts[2], color: CARD_STYLES[2] },
    { label: "ملفات الأدلة", value: counts[3], color: CARD_STYLES[3] },
    { label: "مشاريع المحتوى المحلي", value: counts[4], color: CARD_STYLES[4] },
    { label: "جهات الاتصال", value: counts[5], color: CARD_STYLES[5] },
    { label: "حسابات المبيعات", value: counts[6], color: CARD_STYLES[6] },
    { label: "مساحات المحتوى", value: counts[7], color: CARD_STYLES[7] },
    { label: "المخاطر", value: counts[8], color: CARD_STYLES[8] },
    { label: "أحداث الذاكرة المؤسسية", value: counts[9], color: CARD_STYLES[9] },
    { label: "إصدارات أساس المعرفة", value: counts[10], color: CARD_STYLES[10] },
    { label: "أحداث التدقيق", value: counts[11], color: CARD_STYLES[11] },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {metrics.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border bg-card p-4 text-center shadow-sm"
        >
          <p className={`text-3xl font-black ${color}`}>{value.toLocaleString("ar-SA")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function MonitoringPage() {
  return (
    <MonitoringAutoRefresh>
      <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">مراقبة الأداء</h1>
        <p className="text-sm text-muted-foreground">
          مؤشرات أداء المنصة الرئيسية
        </p>
      </div>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار التحميل...
          </div>
        }
      >
        <MetricsCards />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل بيانات AI…
          </div>
        }
      >
        <AiObservabilityCards />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل جاهزية المؤسسة…
          </div>
        }
      >
        <EnterpriseHealthPanel />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل ذاكرة التصنيف…
          </div>
        }
      >
        <TbFirmMemoryKpisPanel />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل صحة منصة الأدلة…
          </div>
        }
      >
        <EvidenceHealthPanel />
      </Suspense>
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل حالة التكاملات…
          </div>
        }
      >
        <LiveHealthCardsWrapper />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل صحة المنتجات…
          </div>
        }
      >
        <ProductHealthPanel />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل المؤشرات الأمنية…
          </div>
        }
      >
        <SecurityMetricsPanel />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل صحة سجل التدقيق…
          </div>
        }
      >
        <AuditLogHealthPanel />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-8">
            جار تحميل حالة الخدمات…
          </div>
        }
      >
        <PlatformOpsSection />
      </Suspense>
    </div>
    </MonitoringAutoRefresh>
  );
}
