import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesInteractionLog,
  SalesAIBriefDraft,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesCompetitorMentionView,
} from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { AccountIntelligenceSummary } from "@/lib/sales/vnext/account-intelligence";
import type { InteractionTimelineEntry } from "@/lib/sales/intelligence/account-health";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";
import type { CommercialMemorySnapshot } from "@/lib/sales/vnext/commercial-memory";
import {
  AccountAIBriefDraftSection,
  AccountCommercialMemorySummary,
  AccountCompetitorsSection,
  AccountNextActionsSection,
  AccountObjectionsSection,
  AccountProofAssetsSection,
  AccountSignalsSection,
} from "./account-intelligence-sections";

interface AccountProfileViewProps {
  account: SalesAccount;
  contacts: SalesContact[];
  opportunities: SalesOpportunity[];
  intelligence: AccountIntelligenceSummary;
  interactionCount: number;
  interactionTimeline: InteractionTimelineEntry[];
  meetings: SalesInteractionLog[];
  objections: SalesObjectionSignal[];
  competitors: SalesCompetitorMentionView[];
  proofAssets: SalesEvidenceRef[];
  aiBriefDraft: SalesAIBriefDraft;
  nextActions: SalesNextBestActionItem[];
  signals: IntelligenceSignal[];
  accountId: string;
  commercialMemory: CommercialMemorySnapshot;
  accountIcpFitPct?: number;
}

export function AccountProfileView({
  account,
  contacts,
  opportunities,
  intelligence,
  interactionCount,
  interactionTimeline,
  meetings,
  objections,
  competitors,
  proofAssets,
  aiBriefDraft,
  nextActions,
  signals,
  accountId,
  commercialMemory,
  accountIcpFitPct,
}: AccountProfileViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link
          href="/sales/accounts"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← الحسابات
        </Link>
        <h1 className="mt-2 text-h2 font-black">
          {account.nameAr ?? account.name}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={account.status} size="sm" />
          {account.industry && (
            <span className="text-xs text-muted-foreground">
              {account.industry}
            </span>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          نظرة عامة
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <EnterpriseCard module="sales">
            <EnterpriseCardContent className="pt-6">
              <p className="text-xs text-muted-foreground">صحة الحساب</p>
              <p className="text-2xl font-bold">{intelligence.healthScore}%</p>
              <p className="text-sm">{intelligence.healthLevel}</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
          <EnterpriseCard module="sales">
            <EnterpriseCardContent className="pt-6">
              <p className="text-xs text-muted-foreground">قيمة المسار</p>
              <p className="text-2xl font-bold">
                {intelligence.pipelineValue.toLocaleString("ar-SA")} ر.س
              </p>
            </EnterpriseCardContent>
          </EnterpriseCard>
          <EnterpriseCard module="sales">
            <EnterpriseCardContent className="pt-6">
              <p className="text-xs text-muted-foreground">تفاعلات</p>
              <p className="text-2xl font-bold">{interactionCount}</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>
      </section>

      <AccountNextActionsSection nextActions={nextActions} />
      <AccountCommercialMemorySummary
        snapshot={commercialMemory}
        accountIcpFitPct={accountIcpFitPct}
      />

      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="pt-6">
          <p className="text-sm font-semibold">جهات الاتصال</p>
          {contacts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">لا جهات اتصال</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {contacts.map((c) => (
                <li key={c.id} className="text-sm rounded border px-2 py-1">
                  <span className="font-medium">{c.name}</span>
                  {c.title && (
                    <span className="text-muted-foreground"> — {c.title}</span>
                  )}
                  {c.email && (
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="pt-6">
          <p className="text-sm font-semibold">الفرص</p>
          <form
            action={async (formData) => {
              "use server";
              const { createOpportunityFromAccountAction } =
                await import("@/actions/sales-actions");
              await createOpportunityFromAccountAction(accountId, formData);
            }}
            className="mb-4 mt-2 flex flex-wrap gap-2"
          >
            <input
              name="name"
              placeholder="اسم الفرصة"
              className="rounded-md border px-2 py-1 text-sm"
              required
            />
            <input
              name="valueEstimate"
              placeholder="القيمة التقديرية"
              className="rounded-md border px-2 py-1 text-sm w-28"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
            >
              إنشاء فرصة
            </button>
          </form>
          <ul className="space-y-2">
            {opportunities.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/sales/opportunities/${o.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {o.name} — {o.stage}
                  {o.valueEstimate != null &&
                    ` · ${o.valueEstimate.toLocaleString("ar-SA")} ر.س`}
                </Link>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {interactionTimeline.length > 0 && (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="text-sm font-semibold">خط زمني للنشاط</p>
            <ul className="mt-2 space-y-2 text-sm">
              {interactionTimeline.map((t) => (
                <li key={t.id} className="rounded border px-2 py-1">
                  <span className="text-xs text-muted-foreground">
                    {t.loggedAt.slice(0, 10)} · {t.type}
                  </span>
                  <p>{t.labelAr}</p>
                </li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="pt-6">
          <p className="text-sm font-semibold">الاجتماعات والمكالمات</p>
          {meetings.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              لا اجتماعات مسجّلة
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {meetings.map((m) => (
                <li key={m.id} className="rounded border px-2 py-1">
                  <span className="text-xs text-muted-foreground">
                    {m.loggedAt.slice(0, 10)} · {m.type}
                  </span>
                  <p>{m.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <AccountSignalsSection signals={signals} />
      <AccountObjectionsSection objections={objections} />
      <AccountCompetitorsSection competitors={competitors} />
      <AccountProofAssetsSection proofAssets={proofAssets} />
      <AccountAIBriefDraftSection aiBriefDraft={aiBriefDraft} />
    </div>
  );
}
