import Link from "next/link";
import type { Metadata } from "next";
import {
  SectionEyebrow,
  EnterpriseCTA,
} from "@/components/enterprise";

export const metadata: Metadata = {
  title: "Office AI Assistant — مساعد مؤسسي ذكي | AQLIYA",
  description:
    "Office AI Assistant هو المساعد المؤسسي الذكي المشترك عبر جميع أنظمة عقلية — يقدّم مهام ذكية ضمن بيئة محكومة مع مراجعة بشرية وأدلة وسجل تدقيقي كامل.",
};

export default function OfficeAIProductPage() {
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <Link
            href="/products"
            className="relative text-sm text-white/45 hover:text-white/70 transition-colors"
          >
            ← العودة إلى أنظمة التشغيل
          </Link>
          <div className="relative max-w-4xl">
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              Office AI Assistant / مساعد مؤسسي ذكي
            </span>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/78">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              قدرة مشتركة — متكاملة في المنصة
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              مساعد مؤسسي ذكي — ليس منتجاً مستقلاً، بل قدرة مشتركة فوق منصة عقلية
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/62">
              Office AI Assistant هو تطبيق ذكي مشترك يعمل فوق AQLIYA Intelligence
              Core، متاح داخل جميع أنظمة عقلية. يقدّم مهام مساعدة ذكية — تلخيص،
              اقتراح، تحليل — ضمن بيئة محكومة بالصلاحيات وسجل التدقيق والمراجعة
              البشرية.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary px-6">
                تواصل لتفعيل المساعد
              </Link>
              <Link href="/platform" className="btn-secondary px-6">
                استكشف المنصة
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="قدرة مشتركة — ليست منتجاً مستقلاً"
          title="مساعد واحد يعمل عبر جميع أنظمة عقلية"
          description="Office AI Assistant ليس تطبيقاً منفصلاً بذاته. هو قدرة ذكية مشتركة مدمجة في كل نظام — كل قرار أو مستند أو سير عمل يمكنه الاستعانة بالمساعد ضمن نفس بيئة الحوكمة."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              مهام ذكية
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              تلخيص مستندات، اقتراح صياغات، تحليل بيانات، إعداد مسودات تقارير،
              وتصنيف محتوى — كل مهمة ضمن سياق مسموح وبصلاحية محددة.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              مستجيب للسياق
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              المساعد يعرف السياق الذي يعمل فيه — أي نظام، أي صلاحية، أي مرحلة من
              سير العمل — ويقدّم مخرجاته ضمن حدود ذلك السياق.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              مراجعة قبل الاعتماد
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              أي مخرج من المساعد يُعرض كمسودة أو اقتراح. المستخدم يراجع، يعدّل،
              ثم يعتمد. لا يوجد مخرج نهائي بدون مراجعة بشرية.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="الحوكمة"
          title="كيف يُحكم Office AI Assistant؟"
          description="كل استدعاء للمساعد يمر عبر نفس طبقات الحوكمة التي تحكم كل إجراء في منصة عقلية."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-4">
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              فحص الصلاحية
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              لا يمكن للمساعد الوصول إلى بيانات أو سياقات لا يملك المستخدم صلاحية
              عليها.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              تسجيل كل حدث
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              كل طلب وكل مخرج يُسجّل في سجل التدقيق المركزي مع هوية المستخدم
              والتوقيت.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              مراجعة بشرية
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              المساعد لا يعتمد ولا يُنهي أي إجراء. دوره تقديم المسودة أو التحليل
              فقط.
            </p>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-aqliya-cyan">
              إفصاح الذكاء
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              كل مخرج يُوسَم بأنه &quot;مساعد — مقترح&quot; وليس حقيقة نهائية أو قرار
              معتمد.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <SectionEyebrow
          label="أين يتوفر"
          title="متاح داخل كل نظام من أنظمة عقلية"
          description="Office AI Assistant ليس تطبيقاً منفصلاً بل قدرة مدمجة — يظهر داخل كل نظام عند الحاجة إلى مساعدة ذكية ضمن سياق العمل."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
            <h3 className="text-sm font-black text-foreground">AuditOS</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              مساعد في تحليل بيانات التدقيق، اقتراح ملاحظات، وصياغة تقارير
              المراجعة.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
            <h3 className="text-sm font-black text-foreground">DecisionOS</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              مساعد في إعداد البدائل، تحليل المخاطر، وصياغة التوصيات.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
            <h3 className="text-sm font-black text-foreground">SalesOS</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              مساعد في تلخيص اجتماعات، اقتراح متابعات، وإعداد مسودات عروض.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/10 p-6">
            <h3 className="text-sm font-black text-foreground">LocalContentOS</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              مساعد في تحليل بيانات الموردين، اقتراح تصنيفات، وصياغة تقارير
              المحتوى المحلي.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <EnterpriseCTA
          title="هل تريد تفعيل المساعد الذكي داخل أنظمتك؟"
          description="Office AI Assistant متاح الآن كقدرة مشتركة لجميع أنظمة عقلية. تواصل معنا لتفعيله ضمن بيئتك."
          primaryLabel="تواصل للتفعيل"
          primaryHref="/contact"
          secondaryLabel="استكشف المنصة"
          secondaryHref="/platform"
        />
      </section>
    </div>
  );
}
