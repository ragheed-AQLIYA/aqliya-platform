import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "كيف نعمل", href: "/how-we-work" },
      { label: "تواصل معنا", href: "/contact" },
      { label: "صمّم نظامك المؤسسي", href: "/custom-product" },
      { label: "راسلنا عبر البريد", href: "mailto:ragheed@aqliya.com" },
    ],
  },
  {
    title: "خطوط الأنظمة",
    links: [
      {
        label: "AuditOS — نظام التدقيق والذكاء المالي",
        href: "/products/audit",
      },
      {
        label: "LocalContentOS — نظام المحتوى المحلي",
        href: "/products/local-content",
      },
      { label: "DecisionOS — نظام حوكمة القرارات", href: "/products/decision" },
      {
        label: "SalesOS — نظام الذاكرة التجارية والمبيعات",
        href: "/products/sales",
      },
      {
        label: "SimulationOS — نظام محاكاة السيناريوهات",
        href: "/products/simulation",
      },
      { label: "Custom Systems — أنظمة مؤسسية مخصصة", href: "/custom-product" },
    ],
  },
  {
    title: "ابدأ الآن",
    links: [
      { label: "استكشف خطوط عقلية", href: "/products" },
      { label: "شاهد AuditOS — عرض تفاعلي", href: "/auditos" },
      { label: "ناقش حالة استخدام", href: "/custom-product" },
    ],
  },
  {
    title: "نماذج التشغيل",
    links: [
      { label: "سحابة عقلية — متاحة الآن", href: "/products" },
      { label: "خوادم خاصة — قيد التخطيط والتحضير", href: "/products" },
      { label: "بيئة معزولة — مستقبلية", href: "/products" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/aqliya-logo-approved.png"
                alt="AQLIYA"
                width={120}
                height={36}
                className="shrink-0 h-9 w-auto"
              />
            </Link>
            <p className="text-sm leading-7 text-muted-foreground">
              عقلية منصة ذكاء مؤسسي خاص ومحكوم، تبني خطوط أنظمة متخصصة فوق
              AQLIYA Intelligence Core. الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
              السحابة متاحة الآن. الخوادم الخاصة قيد التخطيط والتحضير.
            </p>
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                المبدأ المؤسسي
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
              <a
                href="mailto:ragheed@aqliya.com"
                className="mt-3 inline-block text-sm font-medium text-primary transition-colors hover:text-aqliya-cyan"
              >
                ragheed@aqliya.com
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AQLIYA. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
