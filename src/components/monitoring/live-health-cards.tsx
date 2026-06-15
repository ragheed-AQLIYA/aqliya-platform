"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───

interface HealthSnapshot {
  status: string;
  aggregated: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    lastTickAt: string | null;
  };
  circuits: Array<{
    key: string;
    state: string;
    consecutiveFailures: number;
    openedAt: string | null;
  }>;
  generatedAt: string;
}

// ─── Live Health Cards ───

export function LiveHealthCards() {
  const [data, setData] = useState<HealthSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string>("");

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/integration/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastFetch(new Date().toLocaleTimeString("ar-SA"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الاتصال");
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchHealth();

    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (error) {
    return (
      <div className="rounded-xl border border-status-error/30 bg-status-error/5 p-4 text-center text-sm text-status-error">
        ⚠️ تعذر تحميل بيانات الصحة: {error}
        <button onClick={fetchHealth} className="mr-2 underline">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8 text-sm">
        جار تحميل بيانات الصحة...
      </div>
    );
  }

  const circuitColor = (state: string) => {
    switch (state) {
      case "closed": return "text-status-success";
      case "half-open": return "text-status-warning";
      case "open": return "text-status-error";
      default: return "text-muted-foreground";
    }
  };

  const circuitLabel = (state: string) => {
    switch (state) {
      case "closed": return "مغلق";
      case "open": return "مفتوح";
      case "half-open": return "نصف مفتوح";
      default: return state;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <p className={`text-3xl font-black ${data.aggregated.unhealthy === 0 ? "text-status-success" : "text-status-error"}`}>
            {data.aggregated.total}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">إجمالي التكاملات</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <p className="text-3xl font-black text-status-success">{data.aggregated.healthy}</p>
          <p className="mt-1 text-xs text-muted-foreground">سليمة</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <p className={`text-3xl font-black ${data.aggregated.degraded > 0 ? "text-status-warning" : "text-muted-foreground"}`}>
            {data.aggregated.degraded}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">متدهورة</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
          <p className={`text-3xl font-black ${data.aggregated.unhealthy > 0 ? "text-status-error" : "text-muted-foreground"}`}>
            {data.aggregated.unhealthy}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">معطلة</p>
        </div>
      </div>

      {/* Circuit Breakers */}
      {data.circuits.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            قواطع الدائرة
          </h3>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-right font-medium">المزود</th>
                  <th className="px-4 py-2 text-right font-medium">الحالة</th>
                  <th className="px-4 py-2 text-right font-medium">الإخفاقات</th>
                  <th className="px-4 py-2 text-right font-medium">فتح منذ</th>
                </tr>
              </thead>
              <tbody>
                {data.circuits.map((c) => (
                  <tr key={c.key} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs ltr" dir="ltr">{c.key}</td>
                    <td className={`px-4 py-2 font-medium ${circuitColor(c.state)}`}>
                      {circuitLabel(c.state)}
                    </td>
                    <td className="px-4 py-2">{c.consecutiveFailures}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {c.openedAt ? new Date(c.openedAt).toLocaleTimeString("ar-SA") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          آخر تحديث: {lastFetch}
        </span>
        <button
          onClick={fetchHealth}
          className="px-3 py-1 rounded-md border hover:bg-muted/50 transition-colors"
        >
          تحديث الآن
        </button>
      </div>

      {data.aggregated.lastTickAt && (
        <p className="text-xs text-muted-foreground">
          آخر فحص تلقائي: {new Date(data.aggregated.lastTickAt).toLocaleString("ar-SA")}
        </p>
      )}
    </div>
  );
}
