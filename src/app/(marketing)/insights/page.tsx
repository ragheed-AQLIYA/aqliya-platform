import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "رؤى ومقالات | AQLIYA",
  description:
    "تحليلات ومقالات حول الذكاء الاصطناعي المؤسسي المحكوم — من منظور الحوكمة والمسؤولية والأثر التشغيلي الحقيقي.",
};

const articles = [
  {
    slug: "ai-institutional-failures",
    category: "تحليل",
    categoryColor: "text-red-400",
    title: "خمس حالات فشل مؤسسي بسبب الذكاء الاصطناعي — وما يجمع بينها",
    excerpt:
      "لم تفشل هذه المؤسسات بسبب أن الذكاء الاصطناعي كان رديئاً. فشلت لأن لم يكن هناك هيكل حوكمة يحيط باستخدامه. القصة المشتركة في خمس حالات من قطاعات مختلفة.",
    readTime: "8 دقائق",
    date: "مايو 2025",
  },
  {
    slug: "assistant-vs-governed-intelligence",
    category: "مفهوم",
    categoryColor: "text-violet-400",
    title: "المساعد الذكي مقابل الذكاء المؤسسي المحكوم — فرق جوهري لا تقني",
    excerpt:
      "معظم المؤسسات تعتقد أنها تبني ذكاءً مؤسسياً بينما تُدير مساعداً ذكياً. الفرق ليس في حجم النموذج أو دقة المخرجات — بل في هيكل المسؤولية والأدلة.",
    readTime: "6 دقائق",
    date: "مايو 2025",
  },
  {
    slug: "governance-over-intelligence",
    category: "منظور",
    categoryColor: "text-emerald-400",
    title: "لماذا الحوكمة أهم من الذكاء — المعادلة التي تُغفلها معظم فرق الذكاء الاصطناعي",
    excerpt:
      "السؤال ليس 'كم دقيقاً نموذجنا؟' بل 'هل يمكننا الإجابة على هذا السؤال: من وافق على هذا الإجراء ولماذا؟'. الذكاء بدون حوكمة عبء لا أصل.",
    readTime: "7 دقائق",
    date: "مايو 2025",
  },
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              رؤى ومقالات
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              تحليلات بدون تسويق
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              مقالات تتناول الذكاء الاصطناعي المؤسسي من زاوية الحوكمة
              والمسؤولية والأثر الحقيقي — لا من زاوية الترويج.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="space-y-6">
            {articles.map((article, i) => (
              <Link key={article.slug} href={`/insights/${article.slug}`}>
                <div className="group glass-card-light rounded-2xl p-8 transition-all hover:border-white/15">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${article.categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="text-[10px] text-white/30">{article.date}</span>
                    <span className="text-[10px] text-white/30">{article.readTime} قراءة</span>
                    {i === 0 && (
                      <span className="rounded-full border border-aqliya-cyan/30 bg-aqliya-cyan/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-aqliya-cyan">
                        جديد
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white transition-colors group-hover:text-aqliya-cyan sm:text-2xl">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/55">{article.excerpt}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-aqliya-cyan/70 transition-colors group-hover:text-aqliya-cyan">
                    اقرأ المقال
                    <span className="rtl:rotate-180">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Editorial note */}
          <div className="mt-12 rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center">
            <p className="text-sm font-semibold text-white/60">
              ملاحظة تحريرية
            </p>
            <p className="mt-2 text-sm leading-7 text-white/40">
              مقالات عقلية مكتوبة من منظور الممارسة — لا من منظور التسويق.
              إذا وجدت ادعاءاً لا يصمد أمام النقد، نرحب بالتواصل المباشر.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
