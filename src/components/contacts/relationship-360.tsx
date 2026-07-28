"use client";

import { useState, useEffect, useCallback } from "react";
import { getRelationship360Action } from "@/actions/contact-cross-product-actions";
import type { CrossProductContactView } from "@/lib/localcontactos/cross-product-service";
import Link from "next/link";

// ─── Component ───────────────────────────────────────────────────────────────

export function Relationship360({ contactId }: { contactId: string }) {
  const [data, setData] = useState<CrossProductContactView | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "salesos" | "decisionos" | "timeline">("overview");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getRelationship360Action(contactId);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>تعذر تحميل بيانات العلاقات المتقاطعة</p>
      </div>
    );
  }

  const { contact, salesOS, decisionOS, localContactOS, timeline } = data;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Contact header */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{contact.name}</h3>
            <p className="text-sm text-muted-foreground">{contact.organizationName}</p>
            <p className="text-xs text-muted-foreground">{contact.position}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              contact.sensitivityLevel === "confidential"
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : contact.sensitivityLevel === "sensitive"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            {contact.sensitivityLevel === "confidential" ? "سري" : contact.sensitivityLevel === "sensitive" ? "حساس" : "عادي"}
          </span>
        </div>

        {/* Risk flags */}
        {localContactOS.riskFlags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {localContactOS.riskFlags.map((flag, i) => (
              <span key={i} className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded-full">
                {flag}
              </span>
            ))}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
          <div className="bg-muted/40 rounded p-2">
            <div className="font-bold">{localContactOS.totalInteractions}</div>
            <div className="text-muted-foreground">تفاعلات</div>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <div className="font-bold">{localContactOS.totalRelations}</div>
            <div className="text-muted-foreground">علاقات</div>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <div className="font-bold">{salesOS.relatedDeals.length}</div>
            <div className="text-muted-foreground">صفقات</div>
          </div>
          <div className="bg-muted/40 rounded p-2">
            <div className="font-bold">{decisionOS.decisionsAsStakeholder}</div>
            <div className="text-muted-foreground">قرارات</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-0">
        {(["overview", "salesos", "decisionos", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "نظرة عامة" : tab === "salesos" ? "المبيعات" : tab === "decisionos" ? "القرارات" : "الخط الزمني"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab salesOS={salesOS} decisionOS={decisionOS} localContactOS={localContactOS} />
      )}
      {activeTab === "salesos" && <SalesOSTab salesOS={salesOS} />}
      {activeTab === "decisionos" && <DecisionOSTab decisionOS={decisionOS} />}
      {activeTab === "timeline" && <TimelineTab timeline={timeline} />}
    </div>
  );
}

// ─── Tab Components ──────────────────────────────────────────────────────────

function OverviewTab({
  salesOS,
  decisionOS,
  localContactOS,
}: {
  salesOS: CrossProductContactView["salesOS"];
  decisionOS: CrossProductContactView["decisionOS"];
  localContactOS: CrossProductContactView["localContactOS"];
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border p-4">
        <h4 className="font-bold text-sm mb-3">📊 ملخص العلاقات</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">آخر تفاعل</span>
            <span>{localContactOS.lastInteraction ? new Date(localContactOS.lastInteraction).toLocaleDateString("ar-SA") : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">عدد التفاعلات</span>
            <span className="font-bold">{localContactOS.totalInteractions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">عدد العلاقات</span>
            <span className="font-bold">{localContactOS.totalRelations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">صفقات مرتبطة</span>
            <span className="font-bold">{salesOS.relatedDeals.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">قرارات مرتبطة</span>
            <span className="font-bold">{decisionOS.relatedDecisions.length}</span>
          </div>
          {salesOS.totalDealValue > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">إجمالي قيمة الصفقات</span>
              <span className="font-bold text-green-600">{salesOS.totalDealValue.toLocaleString("ar-SA")} ر.س</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SalesOSTab({ salesOS }: { salesOS: CrossProductContactView["salesOS"] }) {
  return (
    <div className="space-y-4">
      {/* Accounts */}
      {salesOS.relatedAccounts.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-bold text-sm mb-3">🏢 الحسابات المرتبطة</h4>
          <div className="space-y-2">
            {salesOS.relatedAccounts.map((acc) => (
              <Link
                key={acc.id}
                href={`/sales/accounts/${acc.id}`}
                className="flex justify-between items-center p-2 rounded hover:bg-muted/50 text-sm"
              >
                <span>{acc.name}</span>
                <span className="text-xs text-muted-foreground">{acc.industry ?? ""}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Deals */}
      {salesOS.relatedDeals.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-bold text-sm mb-3">💰 الصفقات المرتبطة</h4>
          <div className="space-y-2">
            {salesOS.relatedDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/sales/deals/${deal.id}`}
                className="flex justify-between items-center p-2 rounded hover:bg-muted/50 text-sm"
              >
                <span>{deal.title}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{deal.status}</span>
                  {deal.amount && (
                    <span className="text-xs font-bold text-green-600">{deal.amount.toLocaleString("ar-SA")} ر.س</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {salesOS.relatedAccounts.length === 0 && salesOS.relatedDeals.length === 0 && (
        <div className="text-center text-muted-foreground py-8 text-sm">
          <p>لا توجد حسابات أو صفقات مرتبطة في SalesOS</p>
        </div>
      )}
    </div>
  );
}

function DecisionOSTab({ decisionOS }: { decisionOS: CrossProductContactView["decisionOS"] }) {
  const STATUS_LABELS: Record<string, string> = {
    DRAFT: "مسودة",
    IN_REVIEW: "قيد المراجعة",
    APPROVED: "معتمد",
    REJECTED: "مرفوض",
    ARCHIVED: "مؤرشفة",
  };

  return (
    <div className="space-y-4">
      {decisionOS.relatedDecisions.length > 0 ? (
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-bold text-sm mb-3">📋 القرارات المرتبطة</h4>
          <div className="space-y-2">
            {decisionOS.relatedDecisions.map((d) => (
              <Link
                key={d.id}
                href={`/decisions/${d.id}`}
                className="flex justify-between items-center p-2 rounded hover:bg-muted/50 text-sm"
              >
                <span>{d.title}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{d.type}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8 text-sm">
          <p>لا توجد قرارات مرتبطة في DecisionOS</p>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ timeline }: { timeline: CrossProductContactView["timeline"] }) {
  const PRODUCT_LABELS: Record<string, string> = {
    localcontactos: "جهات الاتصال",
    salesos: "المبيعات",
    decisionos: "القرارات",
  };

  const PRODUCT_COLORS: Record<string, string> = {
    localcontactos: "bg-blue-500",
    salesos: "bg-green-500",
    decisionos: "bg-purple-500",
  };

  return (
    <div className="space-y-0">
      {timeline.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">
          <p>لا توجد أحداث في الخط الزمني</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute right-4 top-0 bottom-0 w-px bg-border" />

          {timeline.map((entry, i) => (
            <div key={i} className="flex gap-4 py-3 pr-8 relative">
              {/* Dot */}
              <div
                className={`absolute right-3 top-4 w-2.5 h-2.5 rounded-full ${PRODUCT_COLORS[entry.product] ?? "bg-gray-400"} ring-2 ring-background`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                    {PRODUCT_LABELS[entry.product] ?? entry.product}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm">{entry.description}</p>
                {entry.link && (
                  <Link href={entry.link} className="text-xs text-primary hover:underline">
                    عرض التفاصيل ←
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
