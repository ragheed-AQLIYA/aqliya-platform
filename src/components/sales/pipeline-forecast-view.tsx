import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { PipelineForecast } from "@/lib/sales/intelligence/pipeline-forecast";
import {
  formatSalesConfidence,
  formatSalesStageLabel,
} from "@/lib/sales/sales-ux-copy";

export function PipelineForecastView({ forecast }: { forecast: PipelineForecast }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">توقعات المسار</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          S7-02 — توقع مرجّح من مراحل الصفقات (ليس commit مالي). المراجعة البشرية مطلوبة.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">المسار الخام</p>
            <p className="text-xl font-bold">
              {Math.round(forecast.totalRaw).toLocaleString("ar-SA")} ر.س
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">التوقع المرجّح</p>
            <p className="text-xl font-bold">
              {Math.round(forecast.weightedTotal).toLocaleString("ar-SA")} ر.س
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-xs text-muted-foreground">ثقة التوقع</p>
            <p className="text-xl font-bold">
              {formatSalesConfidence(forecast.forecastConfidence)}
            </p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>توزيع المراحل</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {Object.entries(forecast.byStage).map(([stage, bucket]) => (
              <li
                key={stage}
                className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2"
              >
                <span>{formatSalesStageLabel(stage)}</span>
                <span className="text-muted-foreground">
                  {bucket.count} صفقة · مرجّح{" "}
                  {Math.round(bucket.weighted).toLocaleString("ar-SA")} ر.س
                </span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
