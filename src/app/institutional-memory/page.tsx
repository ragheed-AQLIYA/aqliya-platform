"use client";

import { useEffect, useState } from "react";
import {
  getMemoryDashboardStats,
  PRODUCT_LABELS_AR,
} from "@/actions/institutional-memory-actions";
import type { MemoryStats } from "@/actions/institutional-memory-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstitutionalMemoryDashboard() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMemoryDashboardStats().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.error ?? "فشل في تحميل البيانات");
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الذاكرة المؤسسية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-destructive">
          <p className="text-lg font-bold">خطأ</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "إجمالي الأحداث",
      titleEn: "Total Events",
      value: stats.totalEvents,
      color: "text-blue-600",
    },
    {
      title: "المجموعات",
      titleEn: "Collections",
      value: stats.totalCollections,
      color: "text-green-600",
    },
    {
      title: "عقد الرسم البياني",
      titleEn: "Graph Nodes",
      value: stats.totalGraphNodes,
      color: "text-purple-600",
    },
    {
      title: "الروابط",
      titleEn: "Edges",
      value: stats.totalGraphEdges,
      color: "text-orange-600",
    },
    {
      title: "نشاط آخر 30 يوم",
      titleEn: "30-Day Activity",
      value: stats.recentEvents,
      color: "text-rose-600",
    },
  ];

  const productEntries = Object.entries(stats.eventsByProduct);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الذاكرة المؤسسية</h1>
        <p className="text-muted-foreground">
          Institutional Memory — ربط المنتجات والمعرفة عبر المنصة
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{card.title}</CardTitle>
              <p className="text-[10px] text-muted-foreground">{card.titleEn}</p>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events by Product */}
      {productEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الأحداث حسب المنتج</CardTitle>
            <p className="text-xs text-muted-foreground">Events by Product</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productEntries.map(([product, count]) => (
                <div key={product} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32">
                    {PRODUCT_LABELS_AR[product] ?? product}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (count / Math.max(...productEntries.map(([, c]) => c))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-left">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {stats.totalEvents === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl mb-2">🧠</p>
            <p className="text-lg font-bold text-muted-foreground">
              لا توجد أحداث ذاكرة مؤسسية بعد
            </p>
            <p className="text-sm text-muted-foreground">
              No institutional memory events yet. Events are created automatically
              when products interact.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <h3 className="font-bold text-sm mb-1">🌐 ما هي الذاكرة المؤسسية؟</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            الذاكرة المؤسسية تربط الكيانات عبر منتجات AQLIYA المختلفة. عندما يتم
            ربط قرار في DecisionOS بحساب في SalesOS، أو إشارة من WorkflowOS إلى
            جهة اتصال في LocalContactOS، يتم تسجيل ذلك كحدث ذاكرة مؤسسية. هذا
            يسمح برؤية شاملة للعلاقات عبر المنصة.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Institutional Memory links entities across AQLIYA products. When a
            DecisionOS decision references a SalesOS account, it&apos;s recorded
            as a memory event — enabling cross-product insight.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
