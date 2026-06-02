import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import {
  PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL,
  type ProofEffectivenessAnalysis,
  type ProofEffectivenessEnrichedRow,
  type ProofEffectivenessGap,
  type ProofEffectivenessRecommendation,
} from "@/lib/sales/vnext/proof-effectiveness";

interface ProofEffectivenessViewProps {
  analysis: ProofEffectivenessAnalysis;
  compact?: boolean;
}

function RecommendationBadge() {
  return (
    <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      {PROOF_EFFECTIVENESS_RECOMMENDATION_LABEL}
    </span>
  );
}

function ScoreBadge({ value }: { value: number }) {
  return (
    <span className="rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
      {value}/100
    </span>
  );
}

function AssetRow({ row }: { row: ProofEffectivenessEnrichedRow }) {
  return (
    <li className="rounded border px-2 py-2 space-y-1 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">
          #{row.rank} {row.title}
        </span>
        <ScoreBadge value={row.effectivenessScore} />
      </div>
      <p className="text-xs text-muted-foreground">
        {row.assetType} · {row.usage.linkedOpportunityCount} فرص ·{" "}
        {row.winContribution.linkedWonCount}W/{row.winContribution.linkedLostCount}L
      </p>
    </li>
  );
}

function GapList({ gaps }: { gaps: ProofEffectivenessGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-sm text-muted-foreground">لا فجوات مكتشفة</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {gaps.map((gap) => (
        <li key={gap.id} className="rounded border px-2 py-1 space-y-0.5">
          <p className="font-medium">{gap.titleAr}</p>
          <p className="text-xs text-muted-foreground">{gap.recommendationAr}</p>
        </li>
      ))}
    </ul>
  );
}

function RecommendationList({ items }: { items: ProofEffectivenessRecommendation[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">لا توصيات بعد</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((rec) => (
        <li key={rec.id} className="rounded-lg border border-border/60 p-2 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{rec.titleAr}</span>
            <span className="text-[10px] text-muted-foreground">{rec.priority}</span>
          </div>
          <p className="text-xs text-muted-foreground">{rec.recommendationAr}</p>
        </li>
      ))}
    </ul>
  );
}

export function ProofEffectivenessView({
  analysis,
  compact = false,
}: ProofEffectivenessViewProps) {
  const { snapshot, industryStageSummary, mostEffective, underused, gaps, recommendations } = analysis;
  const limit = compact ? 3 : 5;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">فعالية الإثبات</h2>
          <p className="text-xs text-muted-foreground">{analysis.disclaimerAr}</p>
        </div>
        <div className="flex items-center gap-2">
          <RecommendationBadge />
          <span className="text-xs text-muted-foreground">
            {snapshot.summary.activeAssets} أصل نشط
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>الأكثر فعالية</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {mostEffective.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا أصول مرتبة</p>
            ) : (
              <ul className="space-y-2">
                {mostEffective.slice(0, limit).map((row) => (
                  <AssetRow key={row.assetId} row={row} />
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>أقل استخداماً (إمكانات عالية)</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            {underused.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا أصول غير مستغلة</p>
            ) : (
              <ul className="space-y-2">
                {underused.slice(0, limit).map((row) => (
                  <AssetRow key={row.assetId} row={row} />
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {!compact && (
        <div className="grid gap-4 lg:grid-cols-2">
          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>ملاءمة القطاع</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              {industryStageSummary.topIndustriesWithoutProof.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا بيانات قطاعية</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {industryStageSummary.topIndustriesWithoutProof.slice(0, 6).map((industry) => (
                    <li
                      key={industry}
                      className="flex justify-between rounded border px-2 py-1"
                    >
                      <span>{industry}</span>
                      <span className="text-xs text-muted-foreground">بدون أدلة</span>
                    </li>
                  ))}
                </ul>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>

          <EnterpriseCard module="sales">
            <EnterpriseCardHeader>
              <EnterpriseCardTitle>ملاءمة المرحلة</EnterpriseCardTitle>
            </EnterpriseCardHeader>
            <EnterpriseCardContent>
              {industryStageSummary.topStagesWithoutProof.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا بيانات مراحل</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {industryStageSummary.topStagesWithoutProof.slice(0, 6).map((stage) => (
                    <li
                      key={stage}
                      className="flex justify-between rounded border px-2 py-1"
                    >
                      <span>{stage}</span>
                      <span className="text-xs text-muted-foreground">بدون أدلة</span>
                    </li>
                  ))}
                </ul>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>فجوات الإثبات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <GapList gaps={gaps.slice(0, compact ? 3 : 6)} />
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>توصيات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <RecommendationList items={recommendations.slice(0, compact ? 3 : 6)} />
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </div>
  );
}
