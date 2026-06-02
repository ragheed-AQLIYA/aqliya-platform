import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { NextBestActionPanel } from "./next-best-action-panel";
import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesAIBriefDraft,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesCompetitorMentionView,
} from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { AccountIntelligenceSummary } from "@/lib/sales/vnext/account-intelligence";
import type { InteractionTimelineEntry } from "@/lib/sales/intelligence/account-health";
import type { SalesInteractionLog } from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

interface AccountProfileProps {
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
}

export function AccountIntelligenceProfile(props: AccountProfileProps) {
  const {
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
  } = props;

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
        <StatusBadge status={account.status} size="sm" />
      </div>

      {/* Overview */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">نظرة عامة</h2>
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
                {intelligence.pipelineValue.toLocaleString("ar-SA")}
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

      <NextBestActionPanel actions={nextActions} title="الإجراء التالي — هذا الحساب" />

      {/* Contacts */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>جهات الاتصال</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا جهات اتصال</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {contacts.map((c) => (
                <li key={c.id}>
                  {c.name} — {c.title}
                  {c.email && (
                    <span className="text-muted-foreground"> · {c.email}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Opportunities */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>الفرص</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <form
            action={async (formData) => {
              "use server";
              const { createOpportunityFromAccountAction } =
                await import("@/actions/sales-actions");
              await createOpportunityFromAccountAction(accountId, formData);
            }}
            className="mb-4 flex flex-wrap gap-2"
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
              className="w-28 rounded-md border px-2 py-1 text-sm"
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

      {/* Activity timeline */}
      {interactionTimeline.length > 0 && (
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>خط زمني للنشاط</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="space-y-2 text-sm">
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

      {/* Meetings */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>الاجتماعات والمكالمات</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا اجتماعات مسجّلة</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {meetings.map((m) => (
                <li key={m.id} className="rounded border px-2 py-1">
                  {m.loggedAt.slice(0, 10)} — {m.summary}
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Signals */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>إشارات</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-1 text-sm">
            {signals.map((s) => (
              <li key={s.id}>
                {s.label}: {s.value}% (ثقة {Math.round(s.confidence * 100)}%)
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Objections */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>الاعتراضات</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {objections.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا اعتراضات مستخرجة</p>
          ) : (
            <ul className="list-inside list-disc text-sm">
              {objections.map((o) => (
                <li key={o.id}>
                  {o.labelAr} ({o.count}×)
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      {/* Competitors */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>المنافسون</EnterpriseCardTitle>
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

      {/* Proof assets */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>أصول الإثبات</EnterpriseCardTitle>
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

      {/* AI Brief DRAFT */}
      <EnterpriseCard module="sales" className="border-amber-300 dark:border-amber-800">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              DRAFT
            </span>
            ملخص ذكاء اصطناعي
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{aiBriefDraft.disclaimerAr}</p>
          {aiBriefDraft.sections.map((s) => (
            <div key={s.titleAr}>
              <p className="font-medium">{s.titleAr}</p>
              <p className="text-muted-foreground">{s.bodyAr}</p>
            </div>
          ))}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
