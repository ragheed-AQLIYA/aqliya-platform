import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AiObservabilityCards } from "@/components/monitoring/ai-observability-cards";

export const dynamic = "force-dynamic";

async function MetricsCards() {
  const [engagementCount, decisionCount, clientCount, evidenceCount] =
    await Promise.all([
      prisma.auditEngagement.count(),
      prisma.decision.count(),
      prisma.auditClient.count(),
      prisma.auditEvidence.count(),
    ]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        {
          label: "مهام التدقيق",
          value: engagementCount,
          color: "text-module-audit",
        },
        {
          label: "القرارات",
          value: decisionCount,
          color: "text-module-decision",
        },
        { label: "العملاء", value: clientCount, color: "text-module-sales" },
        {
          label: "ملفات الأدلة",
          value: evidenceCount,
          color: "text-status-success",
        },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border bg-card p-4 text-center shadow-sm"
        >
          <p className={`text-3xl font-black ${color}`}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function MonitoringPage() {
  return (
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
    </div>
  );
}
