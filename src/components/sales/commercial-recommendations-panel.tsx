import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import {
  COMMERCIAL_RECOMMENDATION_DISCLAIMER_COMPACT_AR,
  type CommercialRecommendation,
  type CommercialRecommendationCategory,
  type CommercialRecommendationsSnapshot,
} from "@/lib/sales/vnext/commercial-recommendations";

const CATEGORY_LABELS: Record<
  CommercialRecommendationCategory,
  { title: string; titleAr: string }
> = {
  industries: {
    title: "Industries to prioritize",
    titleAr: "قطاعات للأولوية",
  },
  proof: {
    title: "Proof to use",
    titleAr: "أدلة للاستخدام",
  },
  accounts_revisit: {
    title: "Accounts to revisit",
    titleAr: "حسابات للمراجعة",
  },
  opps_at_risk: {
    title: "Opportunities at risk",
    titleAr: "فرص معرضة للخطر",
  },
  icp_drift: {
    title: "ICP drift warnings",
    titleAr: "تحذيرات انحراف ICP",
  },
  messaging_themes: {
    title: "Messaging themes",
    titleAr: "ثيمات الرسائل",
  },
};

const PRIORITY_VARIANT: Record<
  CommercialRecommendation["priority"],
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

function confidencePct(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function RecommendationRow({ item }: { item: CommercialRecommendation }) {
  return (
    <li className="rounded-lg border px-3 py-2 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium text-primary hover:underline"
            >
              {item.titleAr}
            </Link>
          ) : (
            <p className="font-medium">{item.titleAr}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.reasoningAr}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="font-medium">إجراء مقترح:</span>{" "}
            {item.recommendedActionAr}
          </p>
          {item.evidence.length > 0 && (
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {item.evidence.slice(0, 3).map((evidence, index) => (
                <li key={`${item.id}-ev-${index}`}>
                  {"•"} {evidence.textAr || evidence.text}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground/80">
            المصدر: {item.source}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={PRIORITY_VARIANT[item.priority]}>
            {item.priority === "high"
              ? "عالي"
              : item.priority === "medium"
                ? "متوسط"
                : "منخفض"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {confidencePct(item.confidence)}
          </span>
        </div>
      </div>
    </li>
  );
}

export type CommercialRecommendationsPanelProps = {
  snapshot: CommercialRecommendationsSnapshot;
  title?: string;
  compact?: boolean;
  limitPerCategory?: number;
  disclaimerAr?: string;
};

export function CommercialRecommendationsPanel({
  snapshot,
  title = "توصيات تجارية",
  compact = false,
  limitPerCategory = 2,
  disclaimerAr = compact
    ? COMMERCIAL_RECOMMENDATION_DISCLAIMER_COMPACT_AR
    : snapshot.disclaimerAr,
}: CommercialRecommendationsPanelProps) {
  if (snapshot.recommendations.length === 0) return null;

  const categories = (
    Object.keys(CATEGORY_LABELS) as CommercialRecommendationCategory[]
  ).filter((category) => snapshot.byCategory[category].length > 0);

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader className={compact ? "pb-2" : undefined}>
        <EnterpriseCardTitle className={compact ? "text-sm" : "text-base"}>
          {title}
        </EnterpriseCardTitle>
        <p
          className={
            compact
              ? "mt-1 text-[11px] text-muted-foreground"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {disclaimerAr}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {snapshot.recommendationLabel} — ليست قرارات آلية.
        </p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-4">
        {categories.map((category) => {
          const items = snapshot.byCategory[category].slice(0, limitPerCategory);
          return (
            <section key={category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[category].titleAr}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <RecommendationRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          );
        })}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
