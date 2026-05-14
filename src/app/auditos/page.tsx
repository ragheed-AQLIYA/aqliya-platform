import Link from "next/link"
import { getDemoDashboardSummary, getDemoEngagement, getDemoAuditEvents } from "@/lib/audit/demo-data"
import { StepNav } from "./step-nav"
import { GuidedDemoPanel, InsightCallout, MetricCard, TraceabilityChain } from "@/components/enterprise"

export default function AuditosOverview() {
  const summary = getDemoDashboardSummary()
  const engagement = getDemoEngagement()
  const events = getDemoAuditEvents().slice(-5).reverse()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Intro Header */}
      <div className="mb-8 rounded-xl border-2 border-primary/10 bg-gradient-to-b from-primary/5 to-background p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AuditOS — First Proof Application / Guided Demo</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">شركة الخليج التجارية — FY2025</h1>
            <p className="mt-2 text-muted-foreground">مدة الاستعراض: 4 دقائق</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Public Guided Demo</span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          AuditOS هو أول تطبيق مُثبت تحت عقلية في مجال التدقيق والذكاء المالي. يوضح هذا الديمو كيف تتحول AQLIYA Intelligence Core إلى مسار عمل محكوم يربط البيانات، الأدلة، المراجعة، والاعتماد داخل نظام واضح وقابل للتتبع.
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          هذا عرض توضيحي عام ببيانات إرشادية/تجريبية لغرض شرح المسار، وليس بيئة تشغيل عميل حقيقية أو نشرًا إنتاجيًا مستقلًا.
        </p>
      </div>

      {/* Guided Demo Panel */}
      <GuidedDemoPanel
        questions={[
          "ما الذي تراه؟ أول تطبيق مُثبت تحت عقلية في مسار تدقيق وذكاء مالي محكوم.",
          "لماذا هذا مهم؟ كل مخرج في النظام مرتبط بمصدره، ومراجعته، واعتماده.",
          "ما المخرج؟ قوائم مالية، إيضاحات، أدلة، وسجل تتبع كامل داخل مسار واحد.",
          "ما القرار التالي؟ استعراض كيف تنتقل البيانات من الإدخال إلى المراجعة والاعتماد.",
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
      <InsightCallout text="تم تصنيف 21 من 22 حسابًا. حساب واحد يحتاج مراجعة بشرية قبل الاعتماد. الذكاء الاصطناعي يساعد. الإنسان يقرر." type="success" className="mb-8" />

      {/* Engagement & Activity */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-xl border bg-background p-6 shadow-sm">
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

        <div className="rounded-xl border bg-background p-6 shadow-sm">
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
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          هذا هو جوهر AuditOS كأول تطبيق تحت عقلية: لا يكتفي بإخراج نتيجة، بل يحافظ على مسار الدليل والمراجعة والقرار داخل بيئة واحدة قابلة للتتبع.
        </p>
      </div>

      {/* Final CTA */}
      <div className="rounded-xl border bg-gradient-to-b from-background to-muted/30 p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold">هل تريد تجربة AuditOS على بيانات مؤسستك؟</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          ابدأ برؤية أول تطبيق مُثبت على عقلية، ثم ناقش كيف يمكن تفعيل خط النظام نفسه أو تصميم مسار مؤسسي مناسب لنطاق مؤسستك.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/custom-product" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            ناقش تفعيل النظام
          </Link>
          <Link href="/custom-product" className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            صمّم نظامك المؤسسي
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
