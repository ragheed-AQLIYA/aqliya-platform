import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "طلب جلسة تنفيذية | AQLIYA",
  description:
    "اطلب جلسة تنفيذية مع عقلية: ناقش فجوتك التشغيلية، حدد خط النظام المناسب، أو صمّم مساراً مؤسسياً محكوماً فوق AQLIYA Intelligence Core.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              طلب جلسة تنفيذية
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              الجلسة التنفيذية ليست عرضاً تجارياً
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              هي حوار مؤسسي لتحديد الفجوة التشغيلية، وتقييم مدى ملاءمة أحد
              أنظمة عقلية لمعالجتها — أو تصميم مسار مخصص فوق AQLIYA Intelligence
              Core إذا كان نطاقك مختلفاً.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
              {[
                "30 دقيقة أولى تشخيصية",
                "لا التزام مسبق",
                "محادثة مباشرة مع الفريق التقني",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-aqliya-cyan/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactForm />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 border-t">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "حدد خط النظام المناسب",
              body: "إذا كنت تعرف المجال الذي تريد تفعيله داخل مؤسستك، ابدأ من استكشاف خطوط عقلية وتحديد الخط الأقرب إلى طبيعة العمل.",
              cta: "استكشف الأنظمة",
              href: "/products",
            },
            {
              title: "ابدأ من جلسة تصميم",
              body: "إذا كان نطاقك مركبًا أو عابرًا للأقسام، فابدأ من جلسة تصميم نظام مؤسسي محكوم فوق النواة نفسها.",
              cta: "اطلب جلسة تصميم النظام",
              href: "/custom-product",
            },
            {
              title: "اطّلع على بنية الحوكمة",
              body: "إذا كنت مسؤولاً تقنياً أو معنياً بالامتثال، اطّلع على بنية Evidence Chain وRBAC وAudit Trail قبل أي حوار.",
              cta: "بنية الحوكمة",
              href: "/governance",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card-light p-6">
              <h2 className="text-xl font-black text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.body}
              </p>
              <div className="mt-5">
                <Link href={item.href} className="btn-outline px-6">
                  {item.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
