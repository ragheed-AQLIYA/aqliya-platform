import Link from "next/link"

const products = [
  {
    title: "اتخاذ القرار",
    desc: "أنظمة تساعد المؤسسات على تنظيم القرارات المعقدة من البدائل والمعايير إلى التوصية والاعتماد.",
    href: "/products/decision",
  },
  {
    title: "المحاكاة",
    desc: "أنظمة تساعد على اختبار السيناريوهات قبل التنفيذ لفهم الأثر، المخاطر، التكلفة، والنتائج المحتملة.",
    href: "/products/simulation",
  },
  {
    title: "المبيعات",
    desc: "أنظمة تساعد فرق B2B على التأهيل، الترتيب، الفلترة، الحملات، المتابعة، وتحسين الأداء.",
    href: "/products/sales",
  },
  {
    title: "المراجعة والتدقيق",
    desc: "أنظمة تساعد مكاتب الأوديت والفرق المالية على تنظيم إجراءات المراجعة، الأدلة، الملاحظات، والمخرجات.",
    href: "/products/audit",
  },
  {
    title: "المحتوى المحلي",
    desc: "أنظمة تساعد المؤسسات على إدارة وتحليل الموردين، الإنفاق، الالتزام، ومؤشرات المحتوى المحلي.",
    href: "/products/local-content",
  },
]

const differentiators = [
  "نبني حول طريقة عمل المؤسسة — لا نحصرها في قالب جاهز",
  "نربط البيانات بالإجراءات والمخرجات",
  "نصمم الأنظمة لتكون قابلة للتتبع والمراجعة",
  "نخصص الحلول حسب القطاع والصلاحيات والاحتياج",
  "نجمع بين البرمجة والذكاء المؤسسي ومنطق التشغيل",
]

const audiences = [
  "الشركات المتوسطة والكبيرة",
  "الجهات الحكومية وشبه الحكومية",
  "مكاتب المراجعة والتدقيق",
  "مكاتب الاستشارات",
  "فرق المبيعات B2B",
  "فرق المالية والمحاسبة",
  "فرق المشتريات والمحتوى المحلي",
  "فرق الإدارة والاستراتيجية",
]

const steps = [
  { num: "01", title: "فهم طبيعة العمل", desc: "نحلل العمليات، البيانات، المستخدمين، الصلاحيات، والمخرجات المطلوبة." },
  { num: "02", title: "تصميم النظام", desc: "نحوّل الاحتياج إلى هيكل واضح يشمل الصفحات، الصلاحيات، مسارات العمل، والتقارير." },
  { num: "03", title: "بناء أو تخصيص", desc: "نطوّر النظام من الصفر أو نخصص أحد حلول عقلية الجاهزة حسب طبيعة المؤسسة." },
  { num: "04", title: "ربط البيانات والمنطق", desc: "نربط البيانات بالتحليل، المخرجات، التتبع، والمراجعة." },
  { num: "05", title: "التجربة والتحسين", desc: "نختبر النظام مع المستخدمين ونحسّنه بناءً على الواقع التشغيلي." },
  { num: "06", title: "التسليم والتطوير", desc: "نطلق النظام وندعمه بالتطوير حسب نمو المؤسسة واحتياجاتها." },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-blue)/8,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              عقلية — أنظمة برمجية مصممة حول طريقة عمل مؤسستك
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              نصنع ونعدّ أنظمة رقمية وذكاء مؤسسي تساعد المؤسسات على تنظيم أعمالها، تشغيل بياناتها، تحسين مخرجاتها، وربط إجراءاتها بمنطق واضح قابل للتتبع والمراجعة.
            </p>
            <p className="mt-4 text-base text-muted-foreground/80">
              لا نبدأ من قالب جاهز. نبدأ من طريقة عمل المؤسسة، بياناتها، إجراءاتها، قراراتها، ومخرجاتها، ثم نبني أو نخصص النظام المناسب لها.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/custom-product"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                صمّم منتجك الخاص
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                استكشف خطوط حلول عقلية
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Product Section */}
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">صمّم منتجًا خاصًا بطبيعة عمل مؤسستك</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ليست كل مؤسسة تحتاج نفس النظام. بعض المؤسسات تحتاج منتجًا جاهزًا، وبعضها تحتاج نظامًا يُبنى حول إجراءاتها، بياناتها، صلاحياتها، ومخرجاتها.
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              في عقلية، نبدأ من فهم طريقة عملك، ثم نصمم ونبني أو نخصص النظام المناسب لك.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "أنظمة تشغيل داخلية",
              "منصات إدارة ومراجعة واعتماد",
              "أنظمة تحليل بيانات ومخرجات",
              "أنظمة محاكاة وسيناريوهات",
              "أنظمة مبيعات وتأهيل فرص",
              "أنظمة امتثال ومحتوى محلي",
              "بوابات عملاء أو موردين",
              "منتجات SaaS خاصة حسب نموذج العمل",
              "أنظمة تقارير ومؤشرات",
              "أنظمة متابعة وموافقات داخلية",
              "أنظمة معرفة وتشغيل مخصصة",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/custom-product"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              اطلب تصميم منتج خاص
            </Link>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">من طبيعة العمل إلى نظام قابل للتشغيل</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              عقلية لا تبدأ من الواجهة. تبدأ من فهم طريقة العمل.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="relative rounded-xl border bg-background p-6">
                <span className="text-3xl font-black text-primary/20">{step.num}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">خطوط حلول جاهزة وقابلة للتخصيص</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              إلى جانب بناء الأنظمة المخصصة، تطور عقلية خطوط حلول جاهزة يمكن تشغيلها أو تخصيصها حسب طبيعة عمل المؤسسة. هذه الخطوط لا تحدّ نطاق عقلية، بل تمثل نماذج من قدرتها على بناء أنظمة متخصصة حسب الحاجة.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.href}
                href={product.href}
                className="group rounded-xl border bg-background p-6 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
              >
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {product.desc}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              عرض جميع خطوط الحلول
            </Link>
          </div>
        </div>
      </section>

      {/* Why AQLIYA */}
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">لأن كل مؤسسة تعمل بطريقة مختلفة</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              المؤسسات لا تحتاج دائمًا برنامجًا عامًا. تحتاج نظامًا يفهم طريقة عملها.
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              كل مؤسسة تختلف في بياناتها، إجراءاتها، صلاحياتها، قراراتها، ومعاييرها. لذلك لا يكفي أن تحصل على أداة عامة أو لوحة تحكم ثابتة.
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              عقلية تساعد المؤسسات على تحويل هذا التعقيد إلى أنظمة واضحة، قابلة للتشغيل، وقابلة للتطوير.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-sm leading-6 text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="border-b py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">نخدم المؤسسات التي تحتاج أنظمة مصممة حول عملها</h2>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((item) => (
              <div
                key={item}
                className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">هل تحتاج نظامًا مصممًا لطبيعة عملك؟</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            إذا كانت مؤسستك تعتمد على إجراءات متكررة، ملفات متفرقة، قرارات غير موثقة، أو مخرجات تحتاج مراجعة واعتماد، يمكن لعقلية أن تساعدك على تحويل ذلك إلى نظام رقمي واضح وقابل للتشغيل.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              ابدأ ببناء نظامك مع عقلية
            </Link>
            <Link
              href="/custom-product"
              className="inline-flex h-12 items-center justify-center rounded-md border bg-background px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              صمّم منتجك الخاص
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
