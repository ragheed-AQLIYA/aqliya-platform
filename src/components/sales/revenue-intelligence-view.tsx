import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";

const STAGE_LABELS: Record<string, string> = {
  Draft: "مسودة",
  Qualification: "تأهيل",
  InReview: "قيد المراجعة",
  Approved: "معتمد",
  Negotiation: "تفاوض",
  ClosedWon: "فوز",
  ClosedLost: "خسارة",
  Rejected: "مرفوض",
  Archived: "مؤرشف",
};

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

function priorityVariant(priority: string) {
  if (priority === "high") return "blocked" as const;
  if (priority === "medium") return "under_review" as const;
  return "draft" as const;
}

function severityVariant(severity: string) {
  if (severity === "high") return "blocked" as const;
  if (severity === "medium") return "under_review" as const;
  return "draft" as const;
}

interface RevenueIntelligenceViewProps {
  snapshot: RevenueIntelligenceSnapshot;
}

export function RevenueIntelligenceView({ snapshot }: RevenueIntelligenceViewProps) {
  const {
    totalPipeline,
    weightedForecast,
    forecastConfidence,
    pipelineCoverage,
    stalledOpportunities,
    stageDistribution,
    riskFlags,
    opportunitiesNeedingAction,
    revenueNotes,
    won,
    lost,
    disclaimerAr,
  } = snapshot;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">ذكاء الإيرادات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مسار، توقع مرجّح، تغطية، ومخاطر — من بيانات الفرص والتفاعلات
        </p>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">{disclaimerAr}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="إجمالي المسار"
          value={`${totalPipeline.toLocaleString("ar-SA")} ر.س`}
          hint={`${stageDistribution.reduce((s, b) => s + b.count, 0)} فرصة نشطة`}
        />
        <Metric
          label="التوقع المرجّح"
          value={`${Math.round(weightedForecast).toLocaleString("ar-SA")} ر.س`}
          hint={`ثقة: ${forecastConfidence}`}
        />
        <Metric
          label="تغطية المسار"
          value={`${pipelineCoverage.ratio.toFixed(1)}×`}
          hint={`${pipelineCoverage.labelAr} · هدف مرجّح ${pipelineCoverage.impliedTarget.toLocaleString("ar-SA")} ر.س`}
        />
        <Metric
          label="فرص متوقفة"
          value={String(stalledOpportunities.count)}
          hint="بدون نشاط 14+ يوم"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="فوز"
          value={`${won.value.toLocaleString("ar-SA")} ر.س`}
          hint={`${won.count} صفقة`}
        />
        <Metric
          label="خسارة"
          value={`${lost.value.toLocaleString("ar-SA")} ر.س`}
          hint={`${lost.count} صفقة`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>توزيع المراحل</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {stageDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا فرص نشطة في المسار</p>
            ) : (
              <div className="space-y-3">
                {stageDistribution.map((bucket) => (
                  <div key={bucket.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{STAGE_LABELS[bucket.stage] ?? bucket.stage}</span>
                      <span className="text-muted-foreground">
                        {bucket.count} · {bucket.rawValue.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/70"
                        style={{ width: `${Math.min(100, bucket.pctOfPipeline)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bucket.pctOfPipeline}% من المسار · مرجّح{" "}
                      {bucket.weightedValue.toLocaleString("ar-SA")} ر.س
                    </p>
                  </div>
                ))}
              </div>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>علامات المخاطر</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {riskFlags.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا علامات مخاطر بارزة</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {riskFlags.map((flag) => (
                  <li
                    key={flag.id}
                    className="flex items-start justify-between gap-2 rounded border px-2 py-1"
                  >
                    <div>
                      <p>{flag.labelAr}</p>
                      {flag.opportunityName ? (
                        <Link
                          href={`/sales/opportunities/${flag.opportunityId}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {flag.opportunityName}
                        </Link>
                      ) : null}
                    </div>
                    <StatusBadge status={severityVariant(flag.severity)} />
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>فرص متوقفة</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {stalledOpportunities.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا فرص متوقفة حالياً</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stalledOpportunities.items.map((item) => (
                  <li key={item.id} className="rounded border px-2 py-2">
                    <Link
                      href={`/sales/opportunities/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {STAGE_LABELS[item.stage] ?? item.stage} ·{" "}
                      {item.valueEstimate.toLocaleString("ar-SA")} ر.س
                      {item.daysSinceActivity != null
                        ? ` · ${item.daysSinceActivity} يوم بدون نشاط`
                        : " · لا تفاعلات مسجّلة"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>فرص تحتاج إجراء</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {opportunitiesNeedingAction.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا إجراءات عاجلة</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {opportunitiesNeedingAction.map((item) => (
                  <li key={item.opportunityId} className="rounded border px-2 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/sales/opportunities/${item.opportunityId}`}
                        className="font-medium hover:underline"
                      >
                        {item.opportunityName}
                      </Link>
                      <StatusBadge status={priorityVariant(item.priority)} />
                    </div>
                    <ul className="mt-1 list-disc list-inside text-xs text-muted-foreground">
                      {item.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>ملاحظات الإيرادات (مسودة)</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {revenueNotes.map((note) => (
              <li
                key={note.id}
                className={`rounded border px-3 py-2 ${
                  note.kind === "caution"
                    ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                    : note.kind === "recommendation"
                      ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                      : ""
                }`}
              >
                {note.textAr}
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
