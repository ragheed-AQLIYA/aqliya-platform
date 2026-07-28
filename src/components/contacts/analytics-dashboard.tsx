"use client";

import { useState, useEffect, useCallback } from "react";
import { getContactAnalyticsAction } from "@/actions/contact-analytics-actions";
import type { ContactAnalytics } from "@/lib/localcontactos/analytics-service";
import Link from "next/link";

// ─── Component ───────────────────────────────────────────────────────────────

export function ContactAnalyticsDashboard() {
  const [data, setData] = useState<ContactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getContactAnalyticsAction();
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">تعذر تحميل التحليلات</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { overview, interactions, relations, riskFlags, recommendations } = data;

  // ── Max bar value for charts ──
  const maxDept = Math.max(...Object.values(overview.byDepartment), 1);
  const maxType = Math.max(...Object.values(interactions.byType), 1);
  const maxMonth = Math.max(...interactions.monthlyTrend.map((m) => m.count), 1);

  const INTERACTION_LABELS: Record<string, string> = {
    meeting: "اجتماع",
    call: "مكالمة",
    email: "بريد",
    message: "رسالة",
    note: "ملاحظة",
    other: "أخرى",
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="إجمالي جهات الاتصال" value={overview.total} sub={`${overview.active} نشطة`} color="blue" />
        <KpiCard label="التفاعلات هذا الشهر" value={interactions.thisMonth} sub={`${interactions.lastMonth} الشهر الماضي`} color="green" />
        <KpiCard label="العلاقات" value={relations.total} sub={`قوة ${relations.avgStrength}/10`} color="purple" />
        <KpiCard label="توصيات" value={recommendations.length} sub={`${riskFlags.stale.length} جهة خاملة`} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensitivity Distribution */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-bold text-sm mb-3">توزيع مستويات الحساسية</h3>
          <div className="space-y-2">
            {Object.entries(overview.bySensitivity).map(([level, count]) => (
              <div key={level} className="flex items-center gap-2">
                <span className="text-xs w-16">
                  {level === "normal" ? "عادي" : level === "sensitive" ? "حساس" : "سري"}
                </span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      level === "confidential" ? "bg-red-500" : level === "sensitive" ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${(count / overview.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-bold text-sm mb-3">التوزيع حسب القسم</h3>
          <div className="space-y-2">
            {Object.entries(overview.byDepartment).slice(0, 6).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-2">
                <span className="text-xs w-24 truncate">{dept}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(count / maxDept) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Types */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-bold text-sm mb-3">أنواع التفاعلات</h3>
          <div className="space-y-2">
            {Object.entries(interactions.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-xs w-16">{INTERACTION_LABELS[type] ?? type}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(count / maxType) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relation Types */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-bold text-sm mb-3">أنواع العلاقات</h3>
          <div className="space-y-2">
            {Object.entries(relations.byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-xs w-16">{RELATION_LABELS[type] ?? type}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(count / relations.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          {relations.strongestRelation && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <span className="font-bold">أقوى علاقة:</span>{" "}
              {relations.strongestRelation.source} ← {relations.strongestRelation.type} →{" "}
              {relations.strongestRelation.target} (قوة {relations.strongestRelation.strength})
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-bold text-sm mb-3">الاتجاه الشهري للتفاعلات</h3>
        <div className="flex items-end gap-1 h-32">
          {interactions.monthlyTrend.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold">{m.count}</span>
              <div
                className="w-full bg-primary/60 rounded-t hover:bg-primary transition-colors"
                style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? 4 : 0 }}
                title={`${m.month}: ${m.count}`}
              />
              <span className="text-[10px] text-muted-foreground">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Flags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RiskFlagCard
          title="جهات خاملة (60+ يوم)"
          titleEn="Stale Contacts"
          contacts={riskFlags.stale}
          color="amber"
        />
        <RiskFlagCard
          title="جهات حساسية عالية"
          titleEn="High Sensitivity"
          contacts={riskFlags.highSensitivity}
          color="red"
        />
        <RiskFlagCard
          title="جهات غير نشطة"
          titleEn="Inactive Contacts"
          contacts={riskFlags.inactive}
          color="gray"
        />
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-bold text-sm mb-3">توصيات ذكية</h3>
        {recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد توصيات حالياً — جميع جهات الاتصال بحالة جيدة.</p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                  rec.priority === "high"
                    ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                    : rec.priority === "medium"
                    ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                    : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                }`}
              >
                <span
                  className={`mt-0.5 text-lg ${
                    rec.priority === "high" ? "text-red-500" : rec.priority === "medium" ? "text-amber-500" : "text-blue-500"
                  }`}
                >
                  {rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🔵"}
                </span>
                <div className="flex-1">
                  <p>{rec.messageAr}</p>
                  <Link
                    href={`/contacts/${rec.contactId}`}
                    className="text-primary text-xs hover:underline mt-1 inline-block"
                  >
                    عرض جهة الاتصال ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="text-center">
        <button
          onClick={fetchData}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          تحديث التحليلات
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
    green: "border-green-200 bg-green-50 dark:bg-green-950/20",
    purple: "border-purple-200 bg-purple-50 dark:bg-purple-950/20",
    amber: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
  };

  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}

function RiskFlagCard({
  title,
  titleEn,
  contacts,
  color,
}: {
  title: string;
  titleEn: string;
  contacts: { id: string; name: string; daysSinceInteraction: number | null }[];
  color: "amber" | "red" | "gray";
}) {
  const borders = { amber: "border-amber-200", red: "border-red-200", gray: "border-gray-200" };

  return (
    <div className={`bg-card rounded-lg border ${borders[color]} p-4`}>
      <h4 className="font-bold text-sm mb-2">
        {title} <span className="text-xs text-muted-foreground font-normal">({contacts.length})</span>
      </h4>
      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground">لا يوجد</p>
      ) : (
        <ul className="space-y-1.5">
          {contacts.slice(0, 5).map((c) => (
            <li key={c.id} className="text-xs flex justify-between">
              <Link href={`/contacts/${c.id}`} className="hover:underline truncate max-w-[70%]">
                {c.name}
              </Link>
              <span className="text-muted-foreground">
                {c.daysSinceInteraction ? `${c.daysSinceInteraction} يوم` : "—"}
              </span>
            </li>
          ))}
          {contacts.length > 5 && (
            <li className="text-xs text-muted-foreground">...و {contacts.length - 5} آخرين</li>
          )}
        </ul>
      )}
    </div>
  );
}

const RELATION_LABELS: Record<string, string> = {
  colleague: "زميل",
  manager: "مدير",
  subordinate: "مرؤوس",
  partner: "شريك",
  client: "عميل",
  vendor: "مورّد",
  board_member: "عضو مجلس",
  investor: "مستثمر",
  other: "أخرى",
};
