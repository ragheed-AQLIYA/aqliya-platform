import { MetricActionCard } from "@/components/platform/command-surface/metric-action-card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialRevenue,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

export function RevenueSection({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialRevenue>;
}) {
  const revenue = section.data;

  return (
    <section aria-labelledby="exec-revenue">
      <h2 id="exec-revenue" className="mb-3 text-sm font-semibold">
        \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a
      </h2>
      {section.status !== "ok" || !revenue ? (
        <SectionFallback
          section={section}
          emptyMessage="\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0625\u064a\u0631\u0627\u062f\u0627\u062a \u0643\u0627\u0641\u064a\u0629 \u0628\u0639\u062f."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricActionCard
            id="exec-pipeline-raw"
            labelAr="\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u062e\u0627\u0645"
            value={`${revenue.totalPipeline.toLocaleString("ar-SA")} \u0631.\u0633`}
            metricKey="sales_pipeline_value"
            productSlug="sales"
            href="/sales/revenue"
          />
          <MetricActionCard
            id="exec-forecast"
            labelAr="\u0627\u0644\u062a\u0648\u0642\u0639 \u0627\u0644\u0645\u0631\u062c\u0651\u062d"
            value={`${Math.round(revenue.weightedForecast).toLocaleString("ar-SA")} \u0631.\u0633`}
            metricKey="sales_weighted_forecast"
            productSlug="sales"
            href="/sales/revenue"
          />
          <MetricActionCard
            id="exec-coverage"
            labelAr="\u062a\u063a\u0637\u064a\u0629 \u0627\u0644\u0645\u0633\u0627\u0631"
            value={`${revenue.coverageRatioPct}%`}
            metricKey="sales_pipeline_coverage"
            productSlug="sales"
            href="/sales/revenue"
          />
          <MetricActionCard
            id="exec-confidence"
            labelAr="\u062b\u0642\u0629 \u0627\u0644\u062a\u0648\u0642\u0639"
            value={revenue.forecastConfidence}
            metricKey="sales_forecast_confidence"
            productSlug="sales"
            href="/sales/revenue"
          />
        </div>
      )}
    </section>
  );
}
