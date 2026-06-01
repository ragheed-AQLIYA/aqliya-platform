import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type {
  SalesAIBriefDraft,
  SalesCompetitorMentionView,
  SalesNextBestActionItem,
  SalesObjectionSignal,
} from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { CommercialMemorySnapshot } from "@/lib/sales/vnext/commercial-memory";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import { NextBestActionPanel } from "./next-best-action-panel";

const MEMORY_DISCLAIMER_AR =
  "ملخص الذاكرة التجارية — مسودة DRAFT — مستخرج بقواعد من التفاعلات والفرص؛ ليس قراراً نهائياً.";

export function AccountCommercialMemorySummary({
  snapshot,
  accountIcpFitPct,
}: {
  snapshot: CommercialMemorySnapshot;
  accountIcpFitPct?: number;
}) {
  const topPatterns = snapshot.patterns.slice(0, 4);

  return (
    <EnterpriseCard module="sales" className="border-dashed">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الذاكرة التجارية — ملخص</EnterpriseCardTitle>
        <p className="text-xs text-muted-foreground">{MEMORY_DISCLAIMER_AR}</p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-4 text-sm">
        {accountIcpFitPct != null && (
          <p>
            ملاءمة ICP للحساب (مشتقة): <strong>{accountIcpFitPct}%</strong>
          </p>
        )}
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            أبرز الاعتراضات (مؤسسة)
          </p>
          {snapshot.topObjections.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            <ul className="list-inside list-disc">
              {snapshot.topObjections.slice(0, 3).map((o) => (
                <li key={o.label}>
                  {o.label} ({o.count})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            معايير القرار المتكررة
          </p>
          {snapshot.decisionCriteria.length === 0 ? (
            <p className="text-muted-foreground">—</p>
          ) : (
            <ul className="list-inside list-disc">
              {snapshot.decisionCriteria.slice(0, 3).map((c) => (
                <li key={c.label}>
                  {c.label} ({c.count})
                </li>
              ))}
            </ul>
          )}
        </div>
        {topPatterns.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">
              أنماط متكررة (توصيات مسودة)
            </p>
            <ul className="space-y-2">
              {topPatterns.map((p) => (
                <li key={p.id} className="rounded border px-2 py-1 text-xs">
                  <span className="font-medium">{p.label}</span>
                  <p className="text-muted-foreground">{p.recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function AccountSignalsSection({
  signals,
}: {
  signals: IntelligenceSignal[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>إشارات الذكاء</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-2 text-sm">
          {signals.map((s) => (
            <li key={s.id} className="rounded border px-2 py-1">
              {s.label} — {s.value}% ({s.level})
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function AccountObjectionsSection({
  objections,
}: {
  objections: SalesObjectionSignal[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الاعتراضات</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {objections.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا اعتراضات مستخرجة</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {objections.map((o) => (
              <li key={o.id}>
                {o.labelAr} ({o.count})
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function AccountCompetitorsSection({
  competitors,
}: {
  competitors: SalesCompetitorMentionView[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>المنافسون</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {competitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا إشارات منافسة</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {competitors.map((c) => (
              <li key={c.id} className="rounded border px-2 py-1">
                <span className="font-medium">{c.name}</span>
                <p className="text-xs text-muted-foreground">{c.contextAr}</p>
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function AccountProofAssetsSection({
  proofAssets,
}: {
  proofAssets: SalesEvidenceRef[];
}) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>أصول الإثبات المرتبطة</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {proofAssets.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا أدلة مرتبطة</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {proofAssets.map((p) => (
              <li key={p.id}>
                {p.label} ({p.typeId})
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function AccountNextActionsSection({
  nextActions,
}: {
  nextActions: SalesNextBestActionItem[];
}) {
  return (
    <NextBestActionPanel actions={nextActions} title="إجراءات مقترحة للحساب" />
  );
}

export function AccountAIBriefDraftSection({
  aiBriefDraft,
}: {
  aiBriefDraft: SalesAIBriefDraft;
}) {
  return (
    <EnterpriseCard module="sales" className="border-dashed border-amber-300">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle className="flex items-center gap-2">
          ملخص ذكاء AI
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            DRAFT
          </span>
        </EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-4">
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {aiBriefDraft.disclaimerAr}
        </p>
        {aiBriefDraft.sections.map((s) => (
          <div key={s.titleAr}>
            <p className="text-sm font-semibold">{s.titleAr}</p>
            <p className="text-sm text-muted-foreground">{s.bodyAr}</p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          أُنشئ: {aiBriefDraft.generatedAt.slice(0, 16)}
        </p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
