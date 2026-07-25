"use client";

import Link from "next/link";
import type { WaveCInstitutionalLearningView } from "@/lib/sales/services/institutional-learning-service";
import {
  buildInstitutionalLearningRowHref,
  buildInstitutionalLearningTrendHref,
} from "@/lib/sales/vnext/institutional-learning-links";
import { InstitutionalLearningFocusScroll } from "@/components/sales/institutional-learning-focus-scroll";
import { RecommendationBadge, ConfidenceBadge } from "./components/institutional-learning-badges";
import { InstitutionalLearningSectionCard } from "./components/institutional-learning-section-card";
import { useInstitutionalLearningPanel } from "./hooks/use-institutional-learning-panel";

interface InstitutionalLearningPanelProps {
  data: WaveCInstitutionalLearningView;
  focusRowId?: string | null;
}

export function InstitutionalLearningPanel({
  data,
  focusRowId,
}: InstitutionalLearningPanelProps) {
  const { isEmpty, focusRowId: activeFocus } = useInstitutionalLearningPanel(
    data,
    focusRowId,
  );

  if (isEmpty) return null;

  return (
    <div className="space-y-4">
      <InstitutionalLearningFocusScroll focusRowId={activeFocus} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">التعلم المؤسسي</h2>
          <p className="text-xs text-muted-foreground">{data.disclaimerAr}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RecommendationBadge label={data.recommendationLabel} />
          <ConfidenceBadge value={data.overallConfidence} />
          {data.insights.length > 0 && (
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {data.insights.length} رؤية
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InstitutionalLearningSectionCard
          title="رؤى مؤسسية"
          items={data.insights}
          focusRowId={activeFocus}
          evidenceMap={data.evidenceMap}
          renderItem={(row) => (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={buildInstitutionalLearningRowHref("insight", row.id)}
                  className="font-medium text-primary hover:underline"
                >
                  {row.titleAr}
                </Link>
                <ConfidenceBadge value={row.confidence} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.narrativeAr}
              </p>
            </>
          )}
        />

        <InstitutionalLearningSectionCard
          title="أنماط"
          items={data.patterns}
          focusRowId={activeFocus}
          evidenceMap={data.evidenceMap}
          renderItem={(row) => (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={buildInstitutionalLearningRowHref("pattern", row.id)}
                  className="font-medium text-primary hover:underline"
                >
                  {row.labelAr}
                </Link>
                <span className="text-xs text-muted-foreground">
                  ×{row.count}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.recommendationAr}
              </p>
            </>
          )}
        />

        <InstitutionalLearningSectionCard
          title="اتجاهات"
          items={data.trends}
          focusRowId={activeFocus}
          evidenceMap={data.evidenceMap}
          renderItem={(row) => (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={buildInstitutionalLearningTrendHref(row)}
                  className="font-medium text-primary hover:underline"
                >
                  {row.metricAr}
                </Link>
                <ConfidenceBadge value={row.confidence} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.direction} · {row.currentValue}
              </p>
            </>
          )}
        />

        <InstitutionalLearningSectionCard
          title="توصيات"
          items={data.recommendations}
          focusRowId={activeFocus}
          evidenceMap={data.evidenceMap}
          renderItem={(row) => (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={buildInstitutionalLearningRowHref(
                    "recommendation",
                    row.id,
                  )}
                  className="font-medium text-primary hover:underline"
                >
                  {row.titleAr}
                </Link>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase">
                  {row.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.reasoningAr}
              </p>
            </>
          )}
        />
      </div>
    </div>
  );
}
