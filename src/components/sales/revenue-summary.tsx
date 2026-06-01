import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { PipelineAnalyticsSummary } from "@/lib/sales/vnext/pipeline-analytics";
import type { PipelineForecastResult } from "@/lib/sales/intelligence/pipeline-forecast";

interface RevenueViewProps {
  forecast: PipelineForecastResult;
  analytics: PipelineAnalyticsSummary;
  won: { count: number; value: number };
  lost: { count: number; value: number };
  disclaimerAr: string;
}

export function RevenueSummary({
  forecast,
  analytics,
  won,
  lost,
  disclaimerAr,
}: RevenueViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الإيرادات والتوقعات</h1>
        <p className="mt-1 text-sm text-muted-foreground">{disclaimerAr}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric label="إجمالي المسار" value={analytics.totalValue} />
        <Metric label="قيمة مرجّحة" value={analytics.weightedValue} />
        <Metric label="توقع مرجّح" value={Math.round(forecast.weightedTotal)} />
        <Metric
          label="ثقة التوقع"
          value={`${Math.round(forecast.forecastConfidence * 100)}%`}
          raw
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">فوز / خسارة</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="text-sm">
            <p>
              فوز: {won.count} — {won.value.toLocaleString("ar-SA")} ر.س
            </p>
            <p>
              خسارة: {lost.count} — {lost.value.toLocaleString("ar-SA")} ر.س
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">متوسط التأهيل</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <p className="text-2xl font-bold">
              {analytics.avgQualificationScore}%
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="text-base">توزيع المراحل</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <div className="flex flex-wrap gap-2 text-sm">
            {Object.entries(analytics.stageDistribution)
              .filter(([, c]) => c > 0)
              .map(([stage, count]) => (
                <span key={stage} className="rounded-full bg-muted px-3 py-1">
                  {stage}: {count}
                </span>
              ))}
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}

function Metric({
  label,
  value,
  raw,
}: {
  label: string;
  value: number | string;
  raw?: boolean;
}) {
  const display =
    raw || typeof value === "string"
      ? value
      : value.toLocaleString("ar-SA");
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{display}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
