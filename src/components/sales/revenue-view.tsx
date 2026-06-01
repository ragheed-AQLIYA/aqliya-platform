import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { PipelineForecast } from "@/lib/sales/intelligence/pipeline-forecast";
import type { PipelineAnalyticsSummary } from "@/lib/sales/vnext/pipeline-analytics";

interface RevenueViewProps {
  forecast: PipelineForecast;
  analytics: PipelineAnalyticsSummary;
  won: { count: number; value: number };
  lost: { count: number; value: number };
  pipelineByStage: PipelineForecast["byStage"];
  disclaimerAr: string;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function RevenueView({
  forecast,
  analytics,
  won,
  lost,
  pipelineByStage,
  disclaimerAr,
}: RevenueViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">الإيرادات والتوقعات</h1>
        <p className="mt-1 text-sm text-muted-foreground">{disclaimerAr}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="مسار خام"
          value={`${forecast.totalRaw.toLocaleString("ar-SA")} ر.س`}
        />
        <Metric
          label="مسار مرجّح"
          value={`${Math.round(forecast.weightedTotal).toLocaleString("ar-SA")} ر.س`}
        />
        <Metric
          label="فوز"
          value={`${won.value.toLocaleString("ar-SA")} ر.س (${won.count})`}
        />
        <Metric
          label="خسارة"
          value={`${lost.value.toLocaleString("ar-SA")} ر.س (${lost.count})`}
        />
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>
            ثقة التوقع: {forecast.forecastConfidence}
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <p className="text-sm text-muted-foreground mb-4">
            متوسط تأهيل: {analytics.avgQualificationScore}% · مراجعة مطلوبة:{" "}
            {analytics.dealsRequiringReview}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-muted-foreground">
                  <th className="py-2 px-2">المرحلة</th>
                  <th className="py-2 px-2">العدد</th>
                  <th className="py-2 px-2">خام</th>
                  <th className="py-2 px-2">مرجّح</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pipelineByStage).map(([stage, bucket]) => (
                  <tr key={stage} className="border-b">
                    <td className="py-2 px-2">{stage}</td>
                    <td className="py-2 px-2">{bucket.count}</td>
                    <td className="py-2 px-2">
                      {bucket.raw.toLocaleString("ar-SA")}
                    </td>
                    <td className="py-2 px-2">
                      {Math.round(bucket.weighted).toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
