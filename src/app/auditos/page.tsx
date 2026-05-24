import Link from "next/link";
import {
  getDemoDashboardSummary,
  getDemoEngagement,
  getDemoAuditEvents,
} from "./demo-data";
import { StepNav } from "./step-nav";
import {
  GuidedDemoPanel,
  InsightCallout,
  MetricCard,
  TraceabilityChain,
} from "@/components/enterprise";
import {
  getSafeDemoActorLabel,
  getSafeDemoEventDescription,
} from "./demo-safety";

export default function AuditosOverview() {
  const summary = getDemoDashboardSummary();
  const engagement = getDemoEngagement();
  const events = getDemoAuditEvents().slice(-5).reverse();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="hero-gradient mb-8 overflow-hidden rounded-[28px] border border-white/10 p-6 text-white shadow-[0_20px_70px_-30px_rgba(0,0,0,0.65)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              AuditOS — أول تطبيق مثبت / عرض إرشادي
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              سيناريو عرض محكوم — FY2025
            </h1>
            <p className="mt-2 text-white/60">مدة الاستعراض: 4 دقائق</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-aqliya-cyan animate-pulse" />
            <span className="text-xs font-semibold text-aqliya-cyan">
              عرض عام ببيانات معقمة
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/74">
          AuditOS هو أول تطبيق مُثبت تحت عقلية في مجال التدقيق والذكاء المالي.
          يوضح هذا الديمو كيف تتحول AQLIYA Intelligence Core إلى مسار عمل محكوم
          يربط البيانات، الأدلة، المراجعة، والاعتماد داخل نظام واضح وقابل
          للتتبع.
        </p>
        <p className="mt-3 text-xs leading-6 text-white/45">
          هذا عرض توضيحي عام ببيانات إرشادية/تجريبية لغرض شرح المسار، وليس بيئة
          تشغيل عميل حقيقية أو نشرًا إنتاجيًا مستقلًا.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products/audit"
            className="btn-secondary h-10 px-6 text-sm"
          >
            صفحة AuditOS
          </Link>
          <Link
            href="/custom-product"
            className="btn-primary h-10 px-6 text-sm"
          >
            ناقش التفعيل
          </Link>
        </div>
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
        <MetricCard label="سيناريوهات العرض" value={summary.totalEngagements} />
        <MetricCard label="خطوات معروضة" value={summary.activeEngagements} />
        <MetricCard label="نقاط مراجعة" value={summary.pendingReviews} />
        <MetricCard label="ملاحظات توضيحية" value={summary.openFindings} />
      </div>

      {/* Insight Callout */}
      <InsightCallout
        text="يعرض هذا السيناريو تصنيف 21 من 22 حسابًا. حساب واحد يبقى للمراجعة البشرية قبل الاعتماد. الذكاء الاصطناعي يساعد. الإنسان يقرر."
        type="success"
        className="mb-8"
      />

      {/* Engagement & Activity */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[3fr,2fr]">
        <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">الارتباط التجريبي</h2>
          <div className="space-y-3">
            <Row label="الجهة المعروضة" value="سيناريو تجريبي" />
            <Row label="الفترة المالية" value={engagement.fiscalPeriod} />
            <Row label="نوع المسار" value="عرض عام للقراءة فقط" />
            <Row label="الإطار المحاسبي" value="IFRS for SMEs" />
            <Row
              label="الحالة"
              value="عرض محكوم"
              badgeColor="bg-blue-50 text-blue-700"
            />
            <Row label="الفريق" value="فريق عرض داخلي" />
          </div>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">آخر النشاطات</h2>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/40" />
                <div>
                  <p className="text-sm leading-5">
                    {getSafeDemoEventDescription(e.eventType, e.description)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getSafeDemoActorLabel(e.actorName)} ·{" "}
                    {new Date(e.timestamp).toLocaleDateString("ar-SA")}
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
          steps={[
            "حساب خام",
            "قرار التصنيف",
            "بند في القائمة",
            "إيضاح",
            "دليل",
            "نتيجة",
            "نقطة مراجعة",
          ]}
        />
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          هذا هو جوهر AuditOS كأول تطبيق تحت عقلية: لا يكتفي بإخراج نتيجة، بل
          يحافظ على مسار الدليل والمراجعة والقرار داخل بيئة واحدة قابلة للتتبع.
          ما يظهر هنا نسخة عرض ثابتة لهذا المسار، وليس سجل عميل حي.
        </p>
      </div>

      {/* Final CTA */}
      <div className="rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.03] p-6 text-center shadow-sm">
        <h3 className="text-lg font-semibold">
          هل تريد تجربة AuditOS على بيانات مؤسستك؟
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          ابدأ برؤية أول تطبيق مُثبت على عقلية، ثم ناقش كيف يمكن تفعيل خط النظام
          نفسه أو تصميم مسار مؤسسي مناسب لنطاق مؤسستك.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link
            href="/custom-product"
            className="btn-primary h-10 px-6 text-sm"
          >
            ناقش تفعيل النظام
          </Link>
          <Link
            href="/products/audit"
            className="btn-outline h-10 px-6 text-sm"
          >
            ارجع إلى صفحة المنتج
          </Link>
        </div>
      </div>

      <StepNav current="/auditos" />
    </div>
  );
}

function Row({
  label,
  value,
  badgeColor,
}: {
  label: string;
  value: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-dotted pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {badgeColor ? (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}
        >
          {value}
        </span>
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  );
}
