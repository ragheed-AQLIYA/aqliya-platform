import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "من نحن | AQLIYA",
  description: "عقلية منصة ذكاء مؤسسي خاص ومحكوم تبني خطوط أنظمة مؤسسية فوق AQLIYA Intelligence Core، بحيث تبقى البيانات والمخرجات والمراجعات تحت حوكمة المؤسسة.",
}

const whyAqliyaExists = [
  "المشكلة ليست نقص أدوات الذكاء الاصطناعي فقط، بل مخرجات بلا أدلة ومسارات بلا محاسبة.",
  "المؤسسات تحتاج ذكاءً يعمل داخل الحوكمة، لا خارجها.",
  "الخطر الحقيقي ليس بطء الأتمتة، بل قرارات لا يمكن تتبعها أو مراجعتها أو تفسيرها بعد صدورها.",
]

const coreItems = [
  "تنسيق الذكاء",
  "الحوكمة",
  "سير العمل",
  "ربط الأدلة",
  "الصلاحيات",
  "سجل التدقيق",
  "التقارير",
]

const systemLines = [
  "AuditOS — نظام التدقيق والذكاء المالي",
  "LocalContentOS — نظام المحتوى المحلي",
  "DecisionOS — نظام حوكمة القرارات",
  "SalesOS — نظام الذاكرة التجارية والمبيعات",
  "SimulationOS — نظام محاكاة السيناريوهات",
  "Custom Systems — أنظمة مؤسسية مخصصة",
]

const whatAqliyaIsNot = [
  "ليست AuditOS فقط.",
  "ليست SaaS فقط.",
  "ليست شات بوت.",
  "لا تجعل الذكاء الاصطناعي صاحب القرار النهائي.",
  "لا تدّعي قدرات On-Prem أو Air-Gapped أو Local AI كمنتجات منفذة حاليًا.",
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#0B1728] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-block rounded-full border border-[#137dc5]/20 bg-[#137dc5]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#137dc5]">
              About AQLIYA
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              عقلية — منصة ذكاء مؤسسي خاص ومحكوم
            </h1>
            <p className="mt-4 text-base leading-8 text-white/60 sm:text-lg">
              عقلية ليست منتجًا واحدًا، وليست نظام تدقيق فقط، وليست شركة تطوير تقليدية. عقلية منصة تبني خطوط أنظمة مؤسسية فوق AQLIYA Intelligence Core، بحيث تبقى البيانات والمخرجات والمراجعات تحت حوكمة المؤسسة.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-black text-foreground">لماذا وُجدت عقلية؟</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            المؤسسات لا تحتاج AI أكثر فقط؛ تحتاج ذكاءً يعمل داخل الحوكمة. حين تصبح المخرجات أسرع من أن تكون قابلة للمراجعة، تتحول الأتمتة من فرصة إلى مخاطرة تشغيلية ومؤسسية.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {whyAqliyaExists.map((item) => (
              <div key={item} className="rounded-xl border bg-muted/20 p-5">
                <p className="text-sm leading-7 text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base leading-8 text-muted-foreground">
            المخاطرة ليست في ضعف الأتمتة فقط، بل في مخرجات بلا دليل، قرارات بلا تتبع، وسير عمل بلا مساءلة. هنا تأتي عقلية: طبقة تشغيل تربط الذكاء بالبيانات، وسير العمل، والأدلة، والمراجعة البشرية قبل الاعتماد النهائي.
          </p>
        </div>
      </section>

      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-black text-white">ماذا تفعل AQLIYA Intelligence Core؟</h2>
            <p className="mt-4 text-base leading-8 text-white/55">
              AQLIYA Intelligence Core هي النواة المشتركة التي تجمع تنسيق الذكاء، الحوكمة، سير العمل، ربط الأدلة، الصلاحيات، سجل التدقيق، والتقارير في بنية واحدة تُمكّن المؤسسة من تشغيل أكثر من خط نظام فوق منطق حوكمة واحد.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreItems.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                <p className="text-sm font-bold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-black text-foreground">خطوط الأنظمة تحت عقلية</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            عقلية لا تُقدَّم كمنتج واحد. بل كمنصة تُفعَّل منها خطوط أنظمة متخصصة حسب نطاق المؤسسة، وكلها مبنية على نواة حوكمة واحدة وعلى AQLIYA Intelligence Core.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {systemLines.map((item) => (
              <div key={item} className="rounded-xl border bg-background p-5 shadow-sm">
                <p className="text-sm font-bold text-foreground">{item}</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  خط متخصص ضمن عقلية، قابل للتفعيل حسب نطاق المؤسسة، ويرتبط بسير العمل، والأدلة، والمراجعة، والاعتماد.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1728] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-black text-white">ما الذي لا تدّعيه عقلية؟</h2>
            <p className="mt-4 text-base leading-8 text-white/55">
              وضوح الحدود جزء من الموثوقية. عقلية لا تختزل نفسها في منتج واحد، ولا تبيع وعودًا تشغيلية لم تُنفَّذ بعد، ولا تنقل القرار النهائي من الإنسان إلى الآلة.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {whatAqliyaIsNot.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#137dc5]" />
                <p className="text-sm leading-7 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <div className="mx-auto max-w-3xl rounded-xl border bg-muted/10 p-8 sm:p-12 text-center">
          <p className="text-sm font-bold text-primary">الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.</p>
          <h2 className="mt-4 text-2xl font-black text-foreground">ابدأ من نطاق مؤسستك</h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            إذا كنت تريد استكشاف خطوط الأنظمة تحت عقلية أو مناقشة تفعيل نظام مؤسسي محكوم، ابدأ من الخط المناسب أو من جلسة تصميم النظام.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              استكشف خطوط عقلية
            </Link>
            <Link href="/custom-product" className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted">
              صمّم نظامك المؤسسي
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
