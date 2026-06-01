import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { NextBestActionPanel } from "./next-best-action-panel";
import type {
  SalesAccount,
  SalesInteractionLog,
  SalesNextBestActionItem,
  SalesObjectionSignal,
  SalesOpportunity,
} from "@/lib/sales/types";
import type { IntelligenceSignal } from "@/lib/platform/intelligence";

interface CommandCenterViewProps {
  activeAccounts: number;
  activeOpps: number;
  pipelineValue: number;
  stalledOpps: number;
  meetingsThisWeek: number;
  topObjections: SalesObjectionSignal[];
  topSignals: IntelligenceSignal[];
  icpFit: { labelAr: string; count: number; pct: number }[];
  nextActions: SalesNextBestActionItem[];
  recentActivity: SalesInteractionLog[];
  accounts: SalesAccount[];
  opportunities?: SalesOpportunity[];
  interactions?: SalesInteractionLog[];
  byStage: Record<string, number>;
  forecastWeighted?: number;
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

const STALL_MS = 14 * 86400000;
const WEEK_MS = 7 * 86400000;
const CLOSED_STAGES = new Set([
  "ClosedWon",
  "ClosedLost",
  "Archived",
  "Rejected",
]);

function resolveStalledOpportunities(
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
): SalesOpportunity[] {
  const now = Date.now();
  return opportunities.filter((o) => {
    if (CLOSED_STAGES.has(o.stage)) return false;
    const opInts = interactions.filter((i) => i.opportunityId === o.id);
    if (opInts.length === 0)
      return o.stage === "Draft" || o.stage === "Qualification";
    const last = new Date(opInts[0].loggedAt).getTime();
    return now - last > STALL_MS;
  });
}

function resolveMeetingsThisWeek(
  interactions: SalesInteractionLog[],
): SalesInteractionLog[] {
  const now = Date.now();
  return interactions.filter(
    (i) =>
      (i.type === "meeting" || i.type === "call") &&
      now - new Date(i.loggedAt).getTime() < WEEK_MS,
  );
}

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  meeting: "اجتماع",
  call: "مكالمة",
  email: "بريد",
  note: "ملاحظة",
  demo: "عرض",
};

export function CommandCenterView({
  activeAccounts,
  activeOpps,
  pipelineValue,
  stalledOpps,
  meetingsThisWeek,
  topObjections,
  topSignals,
  icpFit,
  nextActions,
  recentActivity,
  accounts,
  opportunities = [],
  interactions = [],
  byStage,
  forecastWeighted,
}: CommandCenterViewProps) {
  const stalledList = resolveStalledOpportunities(opportunities, interactions).slice(
    0,
    6,
  );
  const weeklyMeetings = resolveMeetingsThisWeek(interactions).slice(0, 6);
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">مركز القيادة التجاري</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ذكاء تجاري مساعد — لا يُعد قراراً نهائياً. المراجعة البشرية مطلوبة.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="حسابات نشطة" value={activeAccounts} />
        <MetricCard label="فرص نشطة" value={activeOpps} />
        <MetricCard
          label="قيمة المسار"
          value={`${pipelineValue.toLocaleString("ar-SA")} ر.س`}
        />
        <MetricCard label="فرص متوقفة" value={stalledOpps} />
        <MetricCard label="اجتماعات هذا الأسبوع" value={meetingsThisWeek} />
        {forecastWeighted != null && (
          <MetricCard
            label="توقع مرجّح"
            value={`${Math.round(forecastWeighted).toLocaleString("ar-SA")} ر.س`}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="mb-3 text-sm font-semibold">فرص متوقفة</p>
            {stalledList.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا فرص متوقفة حالياً</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stalledList.map((o) => {
                  const account = accountById.get(o.accountId);
                  return (
                    <li key={o.id} className="rounded border px-2 py-1.5">
                      <Link
                        href={`/sales/opportunities/${o.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {o.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {account?.nameAr ?? account?.name ?? "—"} · {o.stage}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {stalledOpps > stalledList.length && (
              <Link
                href="/sales/opportunities"
                className="mt-2 inline-block text-xs text-primary hover:underline"
              >
                عرض المسار الكامل
              </Link>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="mb-3 text-sm font-semibold">اجتماعات هذا الأسبوع</p>
            {weeklyMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا اجتماعات هذا الأسبوع</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {weeklyMeetings.map((m) => {
                  const account = accountById.get(m.accountId);
                  return (
                    <li key={m.id} className="rounded border px-2 py-1.5">
                      <span className="text-xs text-muted-foreground">
                        {m.loggedAt.slice(0, 10)} ·{" "}
                        {INTERACTION_TYPE_LABELS[m.type] ?? m.type}
                      </span>
                      <p className="truncate">{m.summary.slice(0, 80)}</p>
                      {account && (
                        <Link
                          href={`/sales/accounts/${account.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {account.nameAr ?? account.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/sales/activities"
              className="mt-2 inline-block text-xs text-primary hover:underline"
            >
              كل الأنشطة
            </Link>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NextBestActionPanel actions={nextActions.slice(0, 6)} />

        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">أبرز الاعتراضات</p>
              <Link
                href="/sales/intelligence"
                className="text-xs text-primary hover:underline"
              >
                الذاكرة التجارية
              </Link>
            </div>
            {topObjections.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا اعتراضات مسجّلة</p>
            ) : (
              <ul className="space-y-2">
                {topObjections.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between text-sm rounded border px-2 py-1"
                  >
                    <span>{o.labelAr}</span>
                    <span className="text-muted-foreground">{o.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">أبرز الإشارات</p>
              <Link
                href="/sales/intelligence"
                className="text-xs text-primary hover:underline"
              >
                الذاكرة التجارية
              </Link>
            </div>
            {topSignals.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا إشارات</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {topSignals.map((s) => (
                  <li key={s.id} className="rounded border px-2 py-1">
                    {s.label} — {s.value}% ({s.level})
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">توزيع ملاءمة ICP</p>
              <Link
                href="/sales/icp"
                className="text-xs text-primary hover:underline"
              >
                تفاصيل ICP
              </Link>
            </div>
            {icpFit.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا بيانات ICP بعد</p>
            ) : (
              <ul className="space-y-2">
                {icpFit.map((f) => (
                  <li key={f.labelAr} className="flex items-center gap-2 text-sm">
                    <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/60"
                        style={{ width: `${f.pct}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0">{f.labelAr}</span>
                    <span className="text-muted-foreground">{f.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">نشاط تجاري حديث</p>
            <Link
              href="/sales/activities"
              className="text-xs text-primary hover:underline"
            >
              سجل الأنشطة
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا نشاط</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentActivity.map((a) => {
                const account = accountById.get(a.accountId);
                return (
                  <li key={a.id} className="rounded border px-2 py-1">
                    <span className="text-xs text-muted-foreground">
                      {a.loggedAt.slice(0, 10)} ·{" "}
                      {INTERACTION_TYPE_LABELS[a.type] ?? a.type}
                      {account ? ` · ${account.nameAr ?? account.name}` : ""}
                    </span>
                    <p>{a.summary.slice(0, 100)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      {Object.keys(byStage).length > 0 && (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <p className="mb-3 text-sm font-semibold">توزيع المراحل</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStage).map(([stage, count]) => (
                <span key={stage} className="rounded-full bg-muted px-3 py-1 text-xs">
                  {stage}: {count}
                </span>
              ))}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      <EnterpriseCard module="sales">
        <EnterpriseCardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">حسابات سريعة</p>
            <Link
              href="/sales/accounts"
              className="text-xs text-primary hover:underline"
            >
              كل الحسابات
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.slice(0, 6).map((a) => (
              <Link
                key={a.id}
                href={`/sales/accounts/${a.id}`}
                className="rounded-lg border p-3 hover:border-primary/50 transition-colors"
              >
                <p className="font-medium text-sm">{a.nameAr ?? a.name}</p>
                <StatusBadge status={a.status} size="sm" />
              </Link>
            ))}
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
