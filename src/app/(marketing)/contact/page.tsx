import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا | AQLIYA",
  description:
    "ابدأ من نطاق مؤسستك مع عقلية: حدد خط النظام المناسب، ناقش التفعيل، أو اطلب جلسة تصميم نظام مؤسسي محكوم.",
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
              تواصل
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              ابدأ من نطاق مؤسستك، لا من طلب عام غير واضح
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
              سواء كنت تريد تفعيل خط نظام تحت عقلية، أو تحديد المسار المؤسسي
              المناسب، أو تصميم نظام خاص فوق AQLIYA Intelligence Core، فهذه
              الصفحة هي نقطة البداية العملية للحديث الصحيح.
            </p>
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
              cta: "استكشف خطوط عقلية",
              href: "/products",
            },
            {
              title: "ابدأ من جلسة تصميم",
              body: "إذا كان نطاقك مركبًا أو عابرًا للأقسام، فابدأ من جلسة تصميم نظام مؤسسي محكوم فوق النواة نفسها.",
              cta: "اطلب جلسة تصميم النظام",
              href: "/custom-product",
            },
            {
              title: "شاهد تطبيقًا فعليًا",
              body: "إذا كنت تريد رؤية كيف تتحول النواة المشتركة إلى تطبيق حي، ابدأ بعرض AuditOS كأول تطبيق واضح تحت عقلية.",
              cta: "شاهد AuditOS",
              href: "/products/audit",
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
