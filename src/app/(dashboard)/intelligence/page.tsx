import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Network,
  Activity,
  ScrollText,
  ArrowLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import { getIntelligenceWorkspaceSnapshot } from "@/lib/intelligence/workspace-dashboard";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold tracking-tight">
        {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
      </div>
    </div>
  );
}

export default async function IntelligenceWorkspacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const snapshot = await getIntelligenceWorkspaceSnapshot(
    user.organizationId,
    user.id,
  );

  return (
    <div className="space-y-8 p-6" dir="rtl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide text-muted-foreground">
            Intelligence Core · Tier 2
          </p>
          <h1 className="text-2xl font-bold">مركز الذكاء المؤسسي</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            لوحة موحّدة للإشارات، الذاكرة المؤسسية، نشاط الذكاء الاصطناعي، وسجل
            التدقيق عبر المنتجات — الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل
            يحكم.
          </p>
        </div>
        <Link
          href="/institutional-memory"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          الذاكرة المؤسسية
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="محركات Core"
          value={snapshot.coreEngineCount}
          icon={<Layers className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="عقد الرسم البياني"
          value={snapshot.memory.graphNodes}
          icon={<Network className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          label="أحداث الذاكرة (30 يوم)"
          value={snapshot.memory.events30d}
          icon={<Brain className="h-4 w-4 text-violet-600" />}
        />
        <StatCard
          label="نشاط AI (24 ساعة)"
          value={snapshot.aiActivity24h}
          icon={<Sparkles className="h-4 w-4 text-amber-600" />}
        />
        {snapshot.outbox.enabled ? (
          <>
            <StatCard
              label="Outbox — معلّق"
              value={snapshot.outbox.pending}
              icon={<Activity className="h-4 w-4 text-orange-600" />}
            />
            <StatCard
              label="Outbox — فشل"
              value={snapshot.outbox.failed}
              icon={<Activity className="h-4 w-4 text-red-600" />}
            />
          </>
        ) : null}
        <StatCard
          label={`سجل الأحداث v${snapshot.eventRegistry.schemaVersion}`}
          value={snapshot.eventRegistry.registeredTypes}
          icon={<Activity className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          label="ABAC — تقييمات shadow (30 يوم)"
          value={snapshot.abac.shadowEvaluations30d}
          icon={<Layers className="h-4 w-4 text-indigo-600" />}
        />
        <StatCard
          label="ABAC — نسبة عدم التطابق"
          value={`${snapshot.abac.mismatchRate30d}%`}
          icon={<Layers className="h-4 w-4 text-indigo-600" />}
        />
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Layers className="h-4 w-4" />
          ABAC — جاهزية التفعيل (Pilot)
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {snapshot.abac.recommendation}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className={`rounded-full px-2.5 py-1 ${
              snapshot.abac.enforceEnabled
                ? "bg-green-100 text-green-800"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {snapshot.abac.enforceEnabled ? "Enforce مفعّل" : "Shadow فقط"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 ${
              snapshot.abac.readyForEnforcePilot
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {snapshot.abac.readyForEnforcePilot
              ? "جاهز للـ pilot enforce"
              : "غير جاهز بعد"}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Activity className="h-4 w-4" />
            نشاط المنتجات المباشر (Signals + Audit buffer)
          </h2>
          {snapshot.liveActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا يوجد نشاط حديث — سيظهر بعد mutations مع AuditEngine.
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {snapshot.liveActivities.slice(0, 12).map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.summaryAr}</span>
                    <span
                      dir="ltr"
                      className="shrink-0 font-mono text-[10px] text-muted-foreground"
                    >
                      {item.productSlug}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Activity className="h-4 w-4" />
            إشارات المنتجات (30 يوم)
          </h2>
          {Object.keys(snapshot.productSignals).length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد إشارات مسجّلة بعد.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(snapshot.productSignals)
                .sort(([, a], [, b]) => b - a)
                .map(([product, count]) => (
                  <li
                    key={product}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span dir="ltr" className="font-mono text-xs">
                      {product}
                    </span>
                    <span className="font-semibold">
                      {count.toLocaleString("ar-SA")}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <ScrollText className="h-4 w-4" />
            سجل التدقيق الموحّد
          </h2>
          {snapshot.auditFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد أحداث بعد.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {snapshot.auditFeed.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span dir="ltr" className="truncate font-mono text-[11px]">
                      {item.action}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {item.createdAt.toLocaleString("ar-SA")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span dir="ltr">{item.productKey}</span>
                    {item.actorName ? <span>{item.actorName}</span> : null}
                    {item.targetLabel ? (
                      <span className="truncate">{item.targetLabel}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-muted/30 p-5">
        <h2 className="mb-2 font-semibold">محركات Intelligence Core</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {snapshot.coreEngines.join(" · ")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/intelligence/sectors"
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            قطاعات القرار
          </Link>
          <Link
            href="/governance-hub"
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            مركز الحوكمة
          </Link>
          <Link
            href="/settings/audit-logs"
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            سجل المنصة
          </Link>
        </div>
      </section>
    </div>
  );
}
