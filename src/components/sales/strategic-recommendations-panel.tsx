import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import {
  STRATEGIC_DISCLAIMER_COMPACT_AR,
  type StrategicRecommendation,
  type StrategicRecommendationCategory,
  type StrategicRecommendationsSnapshot,
} from "@/lib/sales/v02/strategic-recommendations";

const CATEGORY_LABELS: Record<
  StrategicRecommendationCategory,
  { title: string; titleAr: string }
> = {
  industry_priority: {
    title: "Industries to prioritize",
    titleAr: "\u0642\u0637\u0627\u0639\u0627\u062A \u0644\u0644\u0623\u0648\u0644\u0648\u064A\u0629",
  },
  proof_to_use: {
    title: "Proof to use",
    titleAr: "\u0623\u062F\u0644\u0629 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
  },
  account_revisit: {
    title: "Accounts to revisit",
    titleAr: "\u062D\u0633\u0627\u0628\u0627\u062A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629",
  },
  opp_at_risk: {
    title: "Opportunities at risk",
    titleAr: "\u0641\u0631\u0635 \u0645\u0639\u0631\u0651\u0636\u0629 \u0644\u0644\u062E\u0637\u0631",
  },
  icp_drift: {
    title: "ICP drift warnings",
    titleAr: "\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0646\u062D\u0631\u0627\u0641 ICP",
  },
};

const PRIORITY_VARIANT: Record<
  StrategicRecommendation["priority"],
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

function confidencePct(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function RecommendationRow({ item }: { item: StrategicRecommendation }) {
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
          {item.evidence.length > 0 && (
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              {item.evidence.slice(0, 3).map((evidence, index) => (
                <li key={`${item.id}-ev-${index}`}>
                  {"\u2022"} {evidence.textAr || evidence.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={PRIORITY_VARIANT[item.priority]}>
            {item.priority === "high"
              ? "\u0639\u0627\u0644\u064A"
              : item.priority === "medium"
                ? "\u0645\u062A\u0648\u0633\u0637"
                : "\u0645\u0646\u062E\u0641\u0636"}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {confidencePct(item.confidence)}
          </span>
        </div>
      </div>
    </li>
  );
}

export function StrategicRecommendationsPanel({
  snapshot,
  title = "\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629",
  compact = false,
  limitPerCategory = 2,
  disclaimerAr = compact
    ? STRATEGIC_DISCLAIMER_COMPACT_AR
    : snapshot.disclaimerAr,
}: {
  snapshot: StrategicRecommendationsSnapshot;
  title?: string;
  compact?: boolean;
  limitPerCategory?: number;
  disclaimerAr?: string;
}) {
  if (snapshot.recommendations.length === 0) return null;

  const categories = (
    Object.keys(CATEGORY_LABELS) as StrategicRecommendationCategory[]
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
          {snapshot.recommendationLabel}
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
