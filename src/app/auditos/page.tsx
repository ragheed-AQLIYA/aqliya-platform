import { getDemoDashboardSummary, getDemoEngagement, getDemoAuditEvents } from "@/lib/audit/demo-data"
import { StepNav } from "./step-nav"

export default function AuditosOverview() {
  const summary = getDemoDashboardSummary()
  const engagement = getDemoEngagement()
  const events = getDemoAuditEvents().slice(-5).reverse()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="space-y-2 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">تجربة نظام المراجعة</p>
        <h1 className="text-2xl font-bold">AQLIYA AuditOS</h1>
        <p className="text-muted-foreground">
          نظام يساعد مكاتب المراجعة والفرق المالية على تنظيم أعمال المراجعة والأدلة والملاحظات والمخرجات.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الارتباطات" value={summary.totalEngagements} />
        <StatCard label="نشطة" value={summary.activeEngagements} variant="info" />
        <StatCard label="مراجعات معلقة" value={summary.pendingReviews} variant="warning" />
        <StatCard label="ملاحظات مفتوحة" value={summary.openFindings} variant="warning" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-xl border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">الارتباط التجريبي</h2>
          <div className="space-y-3">
            <Row label="العميل" value={engagement.client?.name ?? "-"} />
            <Row label="الفترة المالية" value={engagement.fiscalPeriod} />
            <Row label="نوع الارتباط" value="مراجعة كاملة" />
            <Row label="الإطار المحاسبي" value="IFRS for SMEs" />
            <Row label="الحالة" value="قيد التنفيذ" badgeColor="bg-blue-50 text-blue-700" />
            <Row label="الفريق" value={engagement.team?.map((t) => t.userName).join(" · ") ?? "-"} />
          </div>
        </div>

        <div className="rounded-xl border bg-background p-6">
          <h2 className="mb-4 text-lg font-semibold">آخر النشاطات</h2>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
                <div>
                  <p className="text-sm leading-5">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.actorName} · {new Date(e.timestamp).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StepNav current="/auditos" />
    </div>
  )
}

function StatCard({ label, value, variant }: { label: string; value: number; variant?: "info" | "warning" }) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

function Row({ label, value, badgeColor }: { label: string; value: string; badgeColor?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dotted pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {badgeColor ? (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>{value}</span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  )
}
