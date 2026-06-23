import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "خمس حالات فشل مؤسسي بسبب الذكاء الاصطناعي | AQLIYA",
  description:
    "لم تفشل هذه المؤسسات بسبب أن الذكاء الاصطناعي كان رديئاً. فشلت لأن لم يكن هناك هيكل حوكمة. القصة المشتركة في خمس حالات من قطاعات مختلفة.",
};

export default function Article1() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
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
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400">
                تحليل
              </span>
              <span className="text-[10px] text-white/30">مايو 2025</span>
              <span className="text-[10px] text-white/30">8 دقائق قراءة</span>
            </div>
            <h1 className="mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl">
              خمس حالات فشل مؤسسي بسبب الذكاء الاصطناعي — وما يجمع بينها
            </h1>
          </div>
        </div>
      </section>

      {/* Article */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="lead text-lg text-white/75 leading-8">
              في كل مؤتمر ذكاء اصطناعي، تسمع قصص النجاح. نماذج بدقة عالية، توفير
              في الوقت، أتمتة مذهلة. لكن الجلسات الخاصة — مع فرق التقنية
              والقانون والامتثال — تحمل قصصاً مختلفة تماماً.
            </p>

            <p className="text-white/65 leading-8">
              المشترك في الحالات الخمس التي سنستعرضها ليس نوع النموذج أو جودة
              البيانات. المشترك هو غياب بنية حوكمة واضحة حول الذكاء الاصطناعي —
              من يوافق، ما يُسجَّل، وماذا يحدث عند الخطأ.
            </p>

            <h2 className="mt-10 text-2xl font-black text-white">
              1. شركة مالية: توصية ائتمان بدون سجل تبرير
            </h2>
            <p className="text-white/65 leading-8">
              شركة تمويل متوسطة استخدمت نموذجاً لتصنيف طلبات الائتمان. النموذج
              كان دقيقاً بمقاييس الاختبار. المشكلة ظهرت عندما طعن أحد العملاء في
              قرار الرفض — لم يستطع أحد تقديم سبب موثق. النموذج
              &ldquo;قرر&rdquo;، لكن لا أحد يعرف لماذا. الغرامة التنظيمية كانت
              أعلى من كلفة بناء نظام توثيق من البداية.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">الدرس</p>
              <p className="mt-1 text-sm text-white/60">
                أي قرار له أثر مباشر على طرف خارجي يحتاج سجل تبرير يصمد أمام
                المراجعة. النموذج لا يوفر هذا بطبيعته — الحوكمة توفره.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              2. جهة حكومية: تقرير آلي وُزِّع بدون مراجعة
            </h2>
            <p className="text-white/65 leading-8">
              جهة حكومية اعتمدت نظاماً لإنتاج تقارير دورية آلياً. في إحدى
              الدورات، احتوى التقرير على خطأ في تفسير بيانات فئة بسبب تغيير في
              تنسيق المصدر. التقرير وُزِّع على جهات خارجية قبل اكتشاف الخطأ.
              التراجع والتصحيح كلّف ثقة وجهداً لأشهر.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">الدرس</p>
              <p className="mt-1 text-sm text-white/60">
                الأتمتة بدون بوابة مراجعة إنسانية قبل التوزيع الخارجي هي مخاطرة
                مؤسسية. سرعة الإنتاج لا تبرر غياب التحقق.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              3. شركة عقارية: قاعدة معرفة &ldquo;حكيمة&rdquo; أنتجت نصائح
              قانونية منتهية
            </h2>
            <p className="text-white/65 leading-8">
              شركة بنت نظام بحث ذكي فوق وثائق قانونية وتنظيمية. النظام كان
              فعّالاً — حتى تغيرت اللوائح ولم يُحدَّث قاعدة المعرفة. لأشهر، أجاب
              النظام بثقة عن أسئلة الفريق استناداً إلى تشريعات لم تعد سارية. لم
              يكن هناك آلية لتتبع &ldquo;صلاحية&rdquo; كل وثيقة.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">الدرس</p>
              <p className="mt-1 text-sm text-white/60">
                ربط المخرجات بمصادرها التي تملك تواريخ صلاحية ليس ميزة إضافية —
                هو شرط لكل نظام معرفي في بيئات تنظيمية.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              4. مستشفى: نظام تنبيه أُغلق صوته بسبب &ldquo;الضوضاء&rdquo;
            </h2>
            <p className="text-white/65 leading-8">
              نظام للكشف عن حالات استثنائية أنتج كثيراً من التنبيهات الإيجابية
              الزائفة في بداياته. الفريق الطبي بدأ في تجاهل التنبيهات تدريجياً.
              عندما أنتج النظام تنبيهاً حقيقياً بعد أشهر، لم يحظَ بالاستجابة
              المطلوبة في الوقت المناسب. لم يكن المشكلة في النموذج — كان في غياب
              بروتوكول واضح لكيفية التعامل مع التنبيهات.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">الدرس</p>
              <p className="mt-1 text-sm text-white/60">
                جودة النموذج والتصميم التشغيلي مسألتان مختلفتان تماماً. النظام
                يحتاج بروتوكول استجابة لا مجرد مخرجات.
              </p>
            </div>

            <h2 className="mt-10 text-2xl font-black text-white">
              5. شركة لوجستية: أتمتة قرارات التوريد بدون حد أقصى
            </h2>
            <p className="text-white/65 leading-8">
              نظام أتمتة مشتريات أصدر أوامر شراء آلياً استجابةً لمؤشرات المخزون.
              في فترة تذبذب في السوق، أصدر النظام أوامر شراء كبيرة بشكل غير
              متوقع — ضمن منطقه الداخلي الصحيح، لكن خارج أي إطار موافقة إنسانية.
              الالتزامات المالية الناتجة استغرقت ربعاً كاملاً لمعالجتها.
            </p>
            <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">الدرس</p>
              <p className="mt-1 text-sm text-white/60">
                كل قرار له عتبة أثر مالي أو تشغيلي يتجاوزها يجب أن يمر عبر بوابة
                موافقة. &ldquo;صحيح منطقياً&rdquo; لا يعني &ldquo;صحيح
                مؤسسياً&rdquo;.
              </p>
            </div>

            <h2 className="mt-12 text-2xl font-black text-white">
              الخيط المشترك
            </h2>
            <p className="text-white/65 leading-8">
              في كل حالة من الخمس، الذكاء الاصطناعي كان يعمل. المشكلة كانت في
              غياب إجابة واضحة على سؤال واحد: ماذا يحدث عندما يُخطئ؟
            </p>
            <p className="text-white/65 leading-8">
              الحوكمة لا تعني تعطيل الذكاء الاصطناعي أو سلب كفاءته. تعني بناء
              إطار واضح حول متى يُعمَل به، متى يُراجَع، وكيف يُوثَّق — بحيث أن
              الخطأ، حين يقع، يكون محدوداً، قابلاً للتعامل، وقابلاً للتعلم منه.
            </p>
            <p className="text-white/65 leading-8">
              الذكاء بدون حوكمة ليس فقط خطيراً. هو غير مستدام مؤسسياً.
            </p>
          </div>

          {/* Divider */}
          <div className="mt-16 border-t border-white/8 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  مقالات ذات صلة
                </p>
                <Link
                  href="/insights/governance-over-intelligence"
                  className="mt-2 block text-sm font-semibold text-white/70 transition-colors hover:text-aqliya-cyan"
                >
                  لماذا الحوكمة أهم من الذكاء →
                </Link>
              </div>
              <Link href="/proof#executive-brief" className="btn-primary px-6">
                طلب إحاطة تنفيذية
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
