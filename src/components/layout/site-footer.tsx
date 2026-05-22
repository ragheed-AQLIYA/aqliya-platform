import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "المنصة والحوكمة",
    links: [
      { label: "AQLIYA Intelligence Core", href: "/platform" },
      { label: "بنية الحوكمة والثقة", href: "/governance" },
      { label: "عائلة الأنظمة", href: "/products" },
      { label: "بيئات النشر", href: "/deployment" },
    ],
  },
  {
    title: "الأنظمة النشطة",
    links: [
      { label: "AuditOS — التدقيق والذكاء المالي", href: "/products/audit" },
      { label: "DecisionOS — حوكمة القرارات", href: "/products/decision" },
      { label: "LocalContentOS — المحتوى المحلي", href: "/products/local-content" },
      { label: "أنظمة مؤسسية مخصصة", href: "/custom-product" },
    ],
  },
  {
    title: "للمشترين",
    links: [
      { label: "المدير المالي — CFO", href: "/buyers/cfo" },
      { label: "مدير التقنية — CIO", href: "/buyers/cio" },
      { label: "شريك التدقيق", href: "/buyers/audit-partner" },
      { label: "الجهات الحكومية", href: "/buyers/government" },
      { label: "المشتريات والعقود", href: "/buyers/procurement" },
    ],
  },
  {
    title: "الدليل والتعاون",
    links: [
      { label: "دراسات الحالة", href: "/case-studies" },
      { label: "مكتبة الإثبات", href: "/proof-library" },
      { label: "دليل البايلوت", href: "/pilot-proof" },
      { label: "نماذج التعاون", href: "/engagement-models" },
      { label: "الديمو التفاعلي", href: "/demo" },
      { label: "الملخص التنفيذي", href: "/executive-brief" },
    ],
  },
  {
    title: "الشركة والمعرفة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "كيف نعمل", href: "/how-we-work" },
      { label: "حالات الاستخدام", href: "/use-cases" },
      { label: "رؤى ومقالات", href: "/insights" },
      { label: "تواصل معنا", href: "/contact" },
      { label: "ragheed@aqliya.com", href: "mailto:ragheed@aqliya.com" },
    ],
  },
];

const legalLinks = [
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "شروط الخدمة", href: "/terms" },
  { label: "الأمن المؤسسي", href: "/security" },
  { label: "بيئات النشر", href: "/deployment" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/brand/aqliya-logo-approved.png"
                alt="AQLIYA"
                width={116}
                height={34}
                className="h-8 w-auto shrink-0"
              />
            </Link>

            <p className="text-sm leading-7 text-muted-foreground">
              منصة ذكاء مؤسسي خاص ومحكوم. تبني أنظمة تشغيلية متخصصة فوق AQLIYA
              Intelligence Core — كل نظام داخل بنية حوكمة، أدلة، وسجل تدقيق واحد.
            </p>

            {/* Trust Principle card */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                المبدأ المؤسسي
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-foreground">
                الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground/60">
                AI assists. Humans decide. Evidence governs.
              </p>
            </div>

            {/* Deployment status */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
                السحابة متاحة الآن
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/45">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                الخوادم الخاصة — قيد التخطيط
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground/35">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/20" />
                البيئة المعزولة — استراتيجي
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {footerColumns.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
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

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground/55">
              &copy; {new Date().getFullYear()} AQLIYA. جميع الحقوق محفوظة.
            </p>
            {/* Legal links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground/45 transition-colors hover:text-muted-foreground/70"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/35 sm:text-right">
              Private Governed Institutional Intelligence Platform
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
