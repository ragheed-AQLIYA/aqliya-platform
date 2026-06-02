import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricActionCard } from "@/components/platform/command-surface/metric-action-card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialSnapshot,
} from "@/lib/sales/services/executive-commercial-dashboard-service";

function SectionFallback({
  section,
  emptyMessage,
}: {
  section: ExecutiveCommercialSection<unknown>;
  emptyMessage?: string;
}) {
  const message =
    section.fallbackMessageAr ??
    (section.status === "empty" ? emptyMessage : undefined) ??
    "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u2014 \u062a\u062d\u0642\u0642 \u0645\u0646 \u062a\u0647\u064a\u0626\u0629 SalesOS.";
  return (
    <p className="py-4 text-center text-xs text-muted-foreground">{message}</p>
  );
}

function trendArrow(
  direction: "up" | "down" | "stable" | "insufficient_data",
): string {
  if (direction === "up") return "\u2191";
  if (direction === "down") return "\u2193";
  if (direction === "insufficient_data") return "?";
  return "\u2192";
}

function severityVariant(severity: "high" | "medium" | "low") {
  if (severity === "high") return "destructive" as const;
  if (severity === "medium") return "secondary" as const;
  return "outline" as const;
}

export function ExecutiveCommercialDashboard({
  data,
}: {
  data: ExecutiveCommercialSnapshot;
}) {
  const revenue = data.revenue.data;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a</h1>
          <Badge variant="outline" className="text-[10px]">
            \u0644\u064a\u0633 CRM
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue \u00b7 Pipeline \u00b7 ICP \u00b7 Proof \u00b7 Signals \u00b7 Recommendations \u00b7
          Learning \u00b7 Executive Risks \u2014 SalesOS v0.2
        </p>
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          {data.disclaimerAr}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/sales/revenue" className="text-primary hover:underline">
          \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a
        </Link>
        <Link href="/sales/icp" className="text-primary hover:underline">
          ICP
        </Link>
        <Link href="/sales/intelligence" className="text-primary hover:underline">
          \u0630\u0643\u0627\u0621 \u0627\u0644\u0633\u0648\u0642
        </Link>
        <Link href="/sales" className="text-primary hover:underline">
          \u0645\u0631\u0643\u0632 \u0642\u064a\u0627\u062f\u0629 SalesOS
        </Link>
      </div>

      <section aria-labelledby="exec-revenue">
        <h2 id="exec-revenue" className="mb-3 text-sm font-semibold">
          \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a
        </h2>
        {data.revenue.status !== "ok" || !revenue ? (
          <SectionFallback
            section={data.revenue}
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

      <section aria-labelledby="exec-pipeline">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle id="exec-pipeline" className="text-sm">
              \u0627\u0644\u0645\u0633\u0627\u0631
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.pipeline.status !== "ok" || !data.pipeline.data ? (
              <SectionFallback
                section={data.pipeline}
                emptyMessage="\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0635 \u0641\u064a \u0627\u0644\u0645\u0633\u0627\u0631."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">\u0641\u0631\u0635 \u0646\u0634\u0637\u0629</p>
                  <p className="text-xl font-bold">
                    {data.pipeline.data.activeOpportunityCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">\u0642\u064a\u0645\u0629 \u0645\u0631\u062c\u0651\u062d\u0629</p>
                  <p className="text-xl font-bold">
                    {data.pipeline.data.weightedValue.toLocaleString("ar-SA")} \u0631.\u0633
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0631\u0627\u062c\u0639\u0629</p>
                  <p className="text-xl font-bold">
                    {data.pipeline.data.dealsRequiringReview}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">\u0645\u062a\u0648\u0642\u0641\u0629</p>
                  <p className="text-xl font-bold">{data.pipeline.data.stalledCount}</p>
                </div>
                {data.pipeline.data.topStages.length > 0 && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <p className="mb-2 text-xs text-muted-foreground">\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0645\u0631\u0627\u062d\u0644</p>
                    <div className="flex flex-wrap gap-2">
                      {data.pipeline.data.topStages.map((s) => (
                        <Badge key={s.stage} variant="outline">
                          {s.stage}: {s.count} ({s.pct}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">\u0645\u062e\u0627\u0637\u0631 \u062a\u0646\u0641\u064a\u0630\u064a\u0629</CardTitle>
        </CardHeader>
        <CardContent>
          {data.executiveRisks.status === "fallback" ? (
            <SectionFallback section={data.executiveRisks} />
          ) : !data.executiveRisks.data || data.executiveRisks.data.length === 0 ? (
            <SectionFallback section={data.executiveRisks} />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.executiveRisks.data.map((risk) => (
                <li key={risk.id}>
                  {risk.href ? (
                    <Link
                      href={risk.href}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2 hover:border-destructive/40 hover:bg-muted/40"
                    >
                      <span className="min-w-0 truncate">{risk.labelAr}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {risk.source}
                        </Badge>
                        <Badge variant={severityVariant(risk.severity)} className="text-[10px]">
                          {risk.severity}
                        </Badge>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2">
                      <span className="min-w-0 truncate">{risk.labelAr}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {risk.source}
                        </Badge>
                        <Badge variant={severityVariant(risk.severity)} className="text-[10px]">
                          {risk.severity}
                        </Badge>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ICP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.icp.status !== "ok" || !data.icp.data ? (
              <SectionFallback section={data.icp} />
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    \u062b\u0642\u0629 {data.icp.data.overallConfidencePct}%
                  </Badge>
                  {data.icp.data.reviewQueueCount > 0 && (
                    <Badge variant="outline">
                      \u0645\u0631\u0627\u062c\u0639\u0629: {data.icp.data.reviewQueueCount}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">DRAFT</span>
                </div>
                <p className="text-xs text-muted-foreground">{data.icp.data.hypothesisAr}</p>
                {data.icp.data.topFitSegments.map((row) => (
                  <div
                    key={row.labelAr}
                    className="flex justify-between border-b border-border/50 pb-2 last:border-0"
                  >
                    <span className="font-medium">{row.labelAr}</span>
                    <span className="text-xs">{row.pct}%</span>
                  </div>
                ))}
                <Link href="/sales/icp" className="block text-xs text-primary hover:underline">
                  \u0639\u0631\u0636 ICP \u0643\u0627\u0645\u0644 \u2190
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">\u0634\u0628\u0643\u0629 \u0627\u0644\u0625\u062b\u0628\u0627\u062a</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.proof.status !== "ok" || !data.proof.data ? (
              <SectionFallback section={data.proof} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">\u0623\u0635\u0648\u0644 \u0646\u0634\u0637\u0629</p>
                    <p className="font-bold">{data.proof.data.activeAssetCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">\u0641\u0631\u0635 \u0645\u0631\u0628\u0648\u0637\u0629</p>
                    <p className="font-bold">{data.proof.data.linkedOpportunityCount}</p>
                  </div>
                </div>
                {data.proof.data.coverageGapHintAr && (
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {data.proof.data.coverageGapHintAr}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {data.proof.data.assetTypes.map((t) => (
                    <Badge key={t.type} variant="outline">
                      {t.type}: {t.count}
                    </Badge>
                  ))}
                </div>
                {data.proof.data.topEffectiveAssets.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0635\u0648\u0644</p>
                    <ul className="space-y-1 text-xs">
                      {data.proof.data.topEffectiveAssets.map((asset) => (
                        <li key={asset.title} className="flex justify-between gap-2">
                          <span className="truncate">{asset.title}</span>
                          <span className="shrink-0 font-mono">{asset.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">\u0625\u0634\u0627\u0631\u0627\u062a \u062a\u062c\u0627\u0631\u064a\u0629</CardTitle>
          </CardHeader>
          <CardContent>
            {data.signals.status === "fallback" ? (
              <SectionFallback section={data.signals} />
            ) : !data.signals.data || data.signals.data.length === 0 ? (
              <SectionFallback section={data.signals} />
            ) : (
              <ul className="space-y-2 text-sm">
                {data.signals.data.map((s, i) => (
                  <li
                    key={`${s.label}-${i}`}
                    className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0"
                  >
                    <span className="min-w-0 truncate">{s.label}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {s.source}
                      </Badge>
                      <span className="font-mono text-xs">{s.count}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">\u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recommendations.status === "fallback" ? (
              <SectionFallback section={data.recommendations} />
            ) : !data.recommendations.data || data.recommendations.data.length === 0 ? (
              <SectionFallback section={data.recommendations} />
            ) : (
              <ul className="space-y-2 text-sm">
                {data.recommendations.data.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="block rounded-md border border-border/60 p-2 hover:border-primary/40 hover:bg-muted/40"
                      >
                        <RecommendationRow item={item} />
                      </Link>
                    ) : (
                      <div className="rounded-md border border-border/60 p-2">
                        <RecommendationRow item={item} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">\u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0627\u0644\u062a\u0639\u0644\u0645</CardTitle>
        </CardHeader>
        <CardContent>
          {data.learningTrends.status === "fallback" ? (
            <SectionFallback section={data.learningTrends} />
          ) : !data.learningTrends.data || data.learningTrends.data.length === 0 ? (
            <SectionFallback section={data.learningTrends} />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.learningTrends.data.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg leading-none">{trendArrow(t.direction)}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {t.confidencePct}%
                    </Badge>
                  </div>
                  <p className="mt-2 font-medium leading-snug">{t.labelAr}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.summaryAr}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        \u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: {new Date(data.generatedAt).toLocaleString("ar-SA")}
      </p>
    </div>
  );
}

function RecommendationRow({
  item,
}: {
  item: ExecutiveCommercialSnapshot["recommendations"] extends ExecutiveCommercialSection<
    infer R
  >
    ? R extends Array<infer Row> | null
      ? Row
      : never
    : never;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={item.priority === "high" ? "destructive" : "secondary"}
          className="text-[10px]"
        >
          {item.priority}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {item.category}
        </Badge>
        <span className="font-medium">{item.titleAr}</span>
      </div>
      {item.reasoningAr && (
        <p className="mt-1 text-xs text-muted-foreground">{item.reasoningAr}</p>
      )}
    </>
  );
}
