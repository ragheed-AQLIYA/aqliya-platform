import { getAuditLogHealth } from "@/actions/monitoring-health-actions";

export async function AuditLogHealthPanel() {
  const health = await getAuditLogHealth();

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">صحة سجل التدقيق</h2>
        <p className="text-sm text-muted-foreground">
          عدد السجلات · سلسلة التجزئة · سلامة البيانات
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-2xl font-black text-module-audit">
            {health.totalAuditLogs.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground">سجلات التدقيق</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-2xl font-black text-purple-600">
            {health.totalChainEntries.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground">إدخالات السلسلة</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <span
            className={`inline-block h-3 w-3 rounded-full ${health.chainHealthy ? "bg-status-success" : "bg-status-error"}`}
          />
          <p className={`mt-1 text-sm font-semibold ${health.chainHealthy ? "text-status-success" : "text-status-error"}`}>
            {health.chainHealthy ? "سليمة" : "متضررة"}
          </p>
          <p className="text-xs text-muted-foreground">سلامة السلسلة</p>
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className={`text-2xl font-black ${health.tamperCount > 0 ? "text-status-error" : "text-status-success"}`}>
            {health.tamperCount}
          </p>
          <p className="text-xs text-muted-foreground">محاولات التغيير</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <p className="text-sm text-muted-foreground">آخر تحقق من السلسلة</p>
          <p className="text-sm font-medium">
            {health.lastVerifiedAt
              ? new Date(health.lastVerifiedAt).toLocaleString("ar-SA")
              : "لم يتم التحقق بعد"}
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <p className="text-sm text-muted-foreground">نطاق التغطية</p>
          <p className="text-sm font-medium">
            {health.coverageStart && health.coverageEnd
              ? `${new Date(health.coverageStart).toLocaleDateString("ar-SA")} — ${new Date(health.coverageEnd).toLocaleDateString("ar-SA")}`
              : "لا توجد بيانات"}
          </p>
        </div>
      </div>

      {health.tamperCount > 0 && (
        <div className="rounded-lg border border-status-error/30 bg-status-error/5 px-3 py-2">
          <p className="text-sm font-medium text-status-error">
            ⚠ اكتُشف {health.tamperCount} محاولة تغيير على سلسلة التجزئة
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            تحقق من سجلات التدقيق المتأثرة فوراً
          </p>
        </div>
      )}

      {health.totalAuditLogs === 0 && (
        <p className="text-xs text-muted-foreground">
          لا توجد سجلات تدقيق مسجلة بعد. ستظهر البيانات هنا بعد كتابة أول سجل.
        </p>
      )}
    </section>
  );
}
