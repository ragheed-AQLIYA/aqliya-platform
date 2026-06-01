import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type {
  SalesObjectionSignal,
  SalesCompetitorMentionView,
  SalesOpportunity,
} from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import type { OpportunityIntelligenceSummary } from "@/lib/sales/vnext/opportunity-intelligence";

interface IntelligenceOverviewProps {
  objections: SalesObjectionSignal[];
  competitors: SalesCompetitorMentionView[];
  signals: IntelligenceSignal[];
  interactionCount: number;
  opportunityInsights: Array<{
    opportunity: SalesOpportunity;
    intelligence: OpportunityIntelligenceSummary;
  }>;
}

export function IntelligenceOverview({
  objections,
  competitors,
  signals,
  interactionCount,
  opportunityInsights,
}: IntelligenceOverviewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">ذاكرة الذكاء التجاري</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إشارات، اعتراضات، ومنافسون — مشتقة من {interactionCount} تفاعل
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">الإشارات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
              {signals.map((s) => (
                <li key={s.id} className="rounded border px-2 py-1">
                  {s.label}: {s.value}%
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="text-base">الاعتراضات</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
              {objections.map((o) => (
                <li key={o.id}>
                  {o.labelAr} — {o.count}×
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="text-base">المنافسون</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {competitors.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong> — {c.contextAr}
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="text-base">ذكاء الفرص</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {opportunityInsights.map(({ opportunity, intelligence }) => (
              <li key={opportunity.id}>
                <Link
                  href={`/sales/opportunities/${opportunity.id}`}
                  className="text-primary hover:underline"
                >
                  {opportunity.name}
                </Link>
                {" — "}
                {intelligence.intelligenceLabelAr} ({intelligence.winProbability}
                %)
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
