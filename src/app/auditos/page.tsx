import Link from "next/link"
import { getDemoDashboardSummary, getDemoEngagement, getDemoAuditEvents } from "@/lib/audit/demo-data"
import { StepNav } from "./step-nav"
import { GuidedDemoPanel, InsightCallout, MetricCard, TraceabilityChain } from "@/components/enterprise"

export default function AuditosOverview() {
  const summary = getDemoDashboardSummary()
  const engagement = getDemoEngagement()
  const events = getDemoAuditEvents().slice(-5).reverse()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Intro */}
      <div className="mb-8 rounded-xl border bg-muted/30 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">تجربة AuditOS</p>
        <h1 className="mt-2 text-2xl font-bold">شركة الخليج التجارية — FY2025</h1>
        <p className="mt-2 text-muted-foreground">مدة الاستعراض: 4 دقائق</p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          AuditOS هو أحد منتجات عقلية المتخصصة في المراجعة والتدقيق والذكاء المالي. يوضح هذا الديمو كيف يمكن تحويل سير عمل مهني معقد إلى نظام واضح، قابل للتتبع، وجاهز للمراجعة.
        </p>
      </div>

      {/* Guided Demo Panel */}
      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ نظرة عامة على بيانات المراجعة والارتباط التجريبي.",
          "لماذا هذا مهم؟ كل مخرج في النظام مرتبط بمصدره وقابل للتتبع.",
          "ما المخرج؟ قوائم مالية، إيضاحات، أدلة، وسجل تتبع كامل.",
          "ما القرار التالي؟ استعراض ميزان المراجعة وتصنيف الحسابات.",
        ]}
        className="mb-8"
      />

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="إجمالي الارتباطات" value={summary.totalEngagements} />
        <MetricCard label="نشطة" value={summary.activeEngagements} />
        <MetricCard label="مراجعات معلقة" value={summary.pendingReviews} />
        <MetricCard label="ملاحظات مفتوحة" value={summary.openFindings} />
      </div>

      {/* Insight Callout */}
      <InsightCallout text="تم تصنيف 21 من 22 حسابًا. حساب واحد يحتاج مراجعة بشرية." type="success" className="mb-8" />

      {/* Engagement & Activity */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[3fr,2fr]">
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

      {/* Traceability Preview */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">مسار التتبع في AuditOS</h2>
        <TraceabilityChain
          steps={["حساب خام", "قرار التصنيف", "بند في القائمة", "إيضاح", "دليل", "نتيجة", "نقطة مراجعة"]}
        />
      </div>

      {/* Final CTA */}
      <div className="rounded-xl border bg-gradient-to-b from-background to-muted/30 p-6 text-center">
        <h3 className="text-lg font-semibold">هل تريد تجربة AuditOS على بيانات مؤسستك؟</h3>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/custom-product" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            اطلب Pilot
          </Link>
          <Link href="/custom-product" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            صمّم نظامك مع عقلية
          </Link>
        </div>
      </div>

      <StepNav current="/auditos" />
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
