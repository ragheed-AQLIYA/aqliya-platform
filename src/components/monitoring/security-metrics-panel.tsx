import { getSecurityMetrics } from "@/actions/monitoring-health-actions";

function StatusBadge({
  ok,
  labelAr,
}: {
  ok: boolean;
  labelAr: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-status-success" : "bg-status-error"}`}
      />
      <span className={`text-xs font-medium ${ok ? "text-status-success" : "text-status-error"}`}>
        {labelAr}
      </span>
    </div>
  );
}

function MetricRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warn" | "error";
}) {
  const colorMap = {
    ok: "text-status-success",
    warn: "text-status-warning",
    error: "text-status-error",
  };

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${colorMap[status]}`}>{value}</p>
    </div>
  );
}

export async function SecurityMetricsPanel() {
  const metrics = await getSecurityMetrics();

  const rateLimiterOk = metrics.rateLimiterMode === "redis" || process.env.NODE_ENV !== "production";
  const scannerOk = metrics.scannerConfigured || process.env.NODE_ENV !== "production";

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">المؤشرات الأمنية</h2>
        <p className="text-sm text-muted-foreground">
          RBAC · Rate Limiter · فاحص الملفات
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">RBAC Enforce</p>
          <StatusBadge ok={metrics.rbacEnforce} labelAr={metrics.rbacEnforce ? "مفعّل" : "معطّل"} />
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">RBAC Shadow</p>
          <StatusBadge ok={metrics.rbacShadow} labelAr={metrics.rbacShadow ? "مفعّل" : "معطّل"} />
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Rate Limiter</p>
          <StatusBadge ok={rateLimiterOk} labelAr={metrics.rateLimiterMode} />
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Redis</p>
          <StatusBadge
            ok={metrics.redisReachable === true}
            labelAr={
              metrics.redisReachable === null
                ? "غير مكوّن"
                : metrics.redisReachable
                  ? "متصل"
                  : "منقطع"
            }
          />
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">فاحص الملفات</p>
          <StatusBadge ok={scannerOk} labelAr={metrics.scannerProvider} />
        </div>
        <div className="rounded-lg border px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">منظمات Enforce</p>
          <p className="text-sm font-semibold">
            {metrics.rbacEnforceOrgCount}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">تفصيل الإعدادات</h3>
        <MetricRow
          label="وضع Rate Limiter"
          value={metrics.rateLimiterMode === "redis" ? "Redis (إنتاج)" : "ذاكرة (تطوير)"}
          status={rateLimiterOk ? "ok" : "warn"}
        />
        <MetricRow
          label="فاحص الفيروسات"
          value={metrics.scannerConfigured ? `ClamAV — ${metrics.scannerProvider}` : "غير مكوّن (dev-mock)"}
          status={scannerOk ? "ok" : "warn"}
        />
        <MetricRow
          label="ABAC Enforce"
          value={metrics.rbacEnforce ? `مفعّل — ${metrics.rbacEnforceOrgCount} منظمة` : "معطّل"}
          status={metrics.rbacEnforce ? "ok" : "warn"}
        />
      </div>

      {process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-status-warning rounded-lg border border-status-warning/30 bg-status-warning/5 px-3 py-2">
          بعض الإعدادات في وضع التطوير. تحقق من هذه الإعدادات في بيئة الإنتاج.
        </p>
      )}
    </section>
  );
}
