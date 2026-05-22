import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "المساعد الذكي مقابل الذكاء المؤسسي المحكوم | AQLIYA",
  description:
    "الفرق بين مساعد ذكي وذكاء مؤسسي محكوم ليس في حجم النموذج — بل في هيكل المسؤولية والأدلة.",
};

export default function Article2() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/60"
            >
              <span className="rotate-180">→</span>
              رؤى ومقالات
            </Link>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                مفهوم
              </span>
              <span className="text-[10px] text-white/30">مايو 2025</span>
              <span className="text-[10px] text-white/30">6 دقائق قراءة</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
              المساعد الذكي مقابل الذكاء المؤسسي المحكوم — فرق جوهري لا تقني
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-invert prose-lg max-w-none">

            <p className="lead text-lg text-white/75 leading-8">
              &ldquo;نحن نستخدم الذكاء الاصطناعي في كل أقسامنا.&rdquo; هذه الجملة تصف
              شيئين مختلفين جذرياً — وكثير من المؤسسات لا تعرف الفرق
              حتى يُكلّفها.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              المساعد الذكي: أداة إنتاجية
            </h2>
            <p className="text-white/65 leading-8">
              المساعد الذكي — سواء كان نموذجاً لغوياً في واجهة محادثة، أو
              أداة تلخيص، أو مولد محتوى — هو أداة تُعزز إنتاجية الفرد. هو
              يُجيب على أسئلة، يُلخّص وثائق، يُصيغ نصوصاً.
            </p>
            <p className="text-white/65 leading-8">
              لا يوجد سجل لمن استخدمه ولأي غرض. لا يوجد ربط بين مخرجاته
              ومصادر محددة. لا يوجد بروتوكول لمتى يُعمَل بمخرجاته ومتى يُراجَع.
              هو أداة شخصية في يد الموظف — لا نظام مؤسسي.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              الذكاء المؤسسي المحكوم: بنية تشغيلية
            </h2>
            <p className="text-white/65 leading-8">
              الذكاء المؤسسي المحكوم ليس أداة أكبر أو نموذجاً أذكى. هو بنية
              تشغيلية كاملة تحيط باستخدام الذكاء الاصطناعي بهيكل واضح:
            </p>
            <ul className="space-y-2 text-white/65">
              <li>كل مخرج مرتبط بمصادره الأصلية قابلة للتحقق</li>
              <li>كل إجراء مرتبط بمستخدم ومختوم بوقت</li>
              <li>كل قرار ذو أثر يمر عبر موافقة إنسانية موثقة</li>
              <li>كل وصول يخضع لصلاحيات محددة بالدور</li>
              <li>السجل كامل وغير قابل للتعديل</li>
            </ul>

            <div className="my-8 overflow-hidden rounded-2xl border border-white/8">
              <div className="grid lg:grid-cols-2">
                <div className="border-b border-white/8 p-6 lg:border-b-0 lg:border-e border-white/8">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    المساعد الذكي
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/55">
                    {[
                      "الاستخدام فردي وغير موثق",
                      "المخرج لا يرتبط بمصدر محدد",
                      "لا سجل لمن استخدم ماذا",
                      "القرار يعتمد على المستخدم فقط",
                      "لا إطار لمتى يُعمَل بالمخرج",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqliya-cyan">
                    الذكاء المحكوم
                  </p>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    {[
                      "كل استخدام موثق بهوية ووقت",
                      "كل مخرج مرتبط بمصادره الأصلية",
                      "سجل تدقيق كامل غير قابل للتعديل",
                      "القرار يتطلب موافقة إنسانية صريحة",
                      "بروتوكول واضح لكل نوع من المخرجات",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aqliya-cyan/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              لماذا يهم الفرق؟
            </h2>
            <p className="text-white/65 leading-8">
              عندما تسأل مدير امتثال: &ldquo;هل يمكنك إثبات أن هذا التقرير صحيح؟&rdquo;
              — المساعد الذكي لا يُساعدك. الذكاء المحكوم يُجيبك بسلسلة
              أدلة كاملة.
            </p>
            <p className="text-white/65 leading-8">
              عندما تسأل جهة تنظيمية: &ldquo;من وافق على هذا القرار ومتى وبناءً
              على ماذا؟&rdquo; — المساعد الذكي لا يملك الإجابة. الذكاء المحكوم يُنتج
              التقرير في دقائق.
            </p>
            <p className="text-white/65 leading-8">
              الفرق ليس تقنياً. هو مؤسسي. وهو الفرق بين أداة و بنية.
            </p>

          </div>

          <div className="mt-16 border-t border-white/8 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  مقال ذو صلة
                </p>
                <Link
                  href="/insights/governance-over-intelligence"
                  className="mt-2 block text-sm font-semibold text-white/70 transition-colors hover:text-aqliya-cyan"
                >
                  لماذا الحوكمة أهم من الذكاء →
                </Link>
              </div>
              <Link href="/platform" className="btn-primary px-6">
                AQLIYA Intelligence Core
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
