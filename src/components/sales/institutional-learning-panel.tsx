import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { WaveCInstitutionalLearningView } from "@/lib/sales/services/institutional-learning-service";
import {
  buildInstitutionalLearningRowHref,
  buildInstitutionalLearningTrendHref,
  institutionalLearningRowElementId,
} from "@/lib/sales/vnext/institutional-learning-links";
import { InstitutionalLearningFocusScroll } from "@/components/sales/institutional-learning-focus-scroll";
import { cn } from "@/lib/utils";

function RecommendationBadge({ label }: { label: string }) {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {label}
    </span>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  return (
    <span className="rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
      ثقة {Math.round(value * 100)}%
    </span>
  );
}

function EvidenceList({
  entityId,
  evidenceMap,
}: {
  entityId: string;
  evidenceMap: WaveCInstitutionalLearningView["evidenceMap"];
}) {
  const items = evidenceMap[entityId] ?? [];
  if (items.length === 0) {
    return <p className="text-[10px] text-muted-foreground">لا أدلة مسجلة</p>;
  }
  return (
    <ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
      {items.slice(0, 3).map((item) => (
        <li key={`${entityId}-${item}`} className="truncate">
          · {item}
        </li>
      ))}
    </ul>
  );
}

function rowFocusClass(focusRowId: string | null | undefined, rowId: string) {
  return cn(
    "rounded-lg border border-border/60 p-3",
    focusRowId === rowId &&
      "border-primary/60 bg-primary/5 ring-1 ring-primary/30",
  );
}

export function hasInstitutionalLearningData(
  view: WaveCInstitutionalLearningView,
): boolean {
  const rowCount =
    view.insights.length +
    view.patterns.length +
    view.trends.length +
    view.recommendations.length;
  return rowCount > 0 && Object.keys(view.evidenceMap).length > 0;
}

interface InstitutionalLearningPanelProps {
  data: WaveCInstitutionalLearningView;
  focusRowId?: string | null;
}

export function InstitutionalLearningPanel({
  data,
  focusRowId,
}: InstitutionalLearningPanelProps) {
  if (!hasInstitutionalLearningData(data)) return null;

  return (
    <div className="space-y-4">
      <InstitutionalLearningFocusScroll focusRowId={focusRowId} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">التعلم المؤسسي</h2>
          <p className="text-xs text-muted-foreground">{data.disclaimerAr}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RecommendationBadge label={data.recommendationLabel} />
          <ConfidenceBadge value={data.overallConfidence} />
          {data.insights.length > 0 ? (
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {data.insights.length} رؤية
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.insights.length > 0 ? (
          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>رؤى مؤسسية</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              <ul className="space-y-3 text-sm">
                {data.insights.map((row) => (
                  <li
                    key={row.id}
                    id={institutionalLearningRowElementId(row.id)}
                    className={rowFocusClass(focusRowId, row.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={buildInstitutionalLearningRowHref(
                          "insight",
                          row.id,
                        )}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.titleAr}
                      </Link>
                      <ConfidenceBadge value={row.confidence} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.narrativeAr}
                    </p>
                    <EvidenceList
                      entityId={row.id}
                      evidenceMap={data.evidenceMap}
                    />
                  </li>
                ))}
              </ul>
            </EnterpriseCardContent>
          </EnterpriseCard>
        ) : null}

        {data.patterns.length > 0 ? (
          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>أنماط</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              <ul className="space-y-3 text-sm">
                {data.patterns.map((row) => (
                  <li
                    key={row.id}
                    id={institutionalLearningRowElementId(row.id)}
                    className={rowFocusClass(focusRowId, row.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={buildInstitutionalLearningRowHref(
                          "pattern",
                          row.id,
                        )}
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
                    <EvidenceList
                      entityId={row.id}
                      evidenceMap={data.evidenceMap}
                    />
                  </li>
                ))}
              </ul>
            </EnterpriseCardContent>
          </EnterpriseCard>
        ) : null}

        {data.trends.length > 0 ? (
          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>اتجاهات</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              <ul className="space-y-3 text-sm">
                {data.trends.map((row) => (
                  <li
                    key={row.id}
                    id={institutionalLearningRowElementId(row.id)}
                    className={rowFocusClass(focusRowId, row.id)}
                  >
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
                    <EvidenceList
                      entityId={row.id}
                      evidenceMap={data.evidenceMap}
                    />
                  </li>
                ))}
              </ul>
            </EnterpriseCardContent>
          </EnterpriseCard>
        ) : null}

        {data.recommendations.length > 0 ? (
          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>توصيات</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              <ul className="space-y-3 text-sm">
                {data.recommendations.map((row) => (
                  <li
                    key={row.id}
                    id={institutionalLearningRowElementId(row.id)}
                    className={rowFocusClass(focusRowId, row.id)}
                  >
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
                    <EvidenceList
                      entityId={row.id}
                      evidenceMap={data.evidenceMap}
                    />
                  </li>
                ))}
              </ul>
            </EnterpriseCardContent>
          </EnterpriseCard>
        ) : null}
      </div>
    </div>
  );
}
