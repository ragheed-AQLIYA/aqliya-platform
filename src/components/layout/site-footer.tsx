import Link from "next/link";
import Image from "next/image";

const footerColumns = [
  {
    title: "المنصة",
    links: [
      { label: "كيف تعمل عقلية", href: "/platform" },
      { label: "أنظمة التشغيل", href: "/platform#capabilities" },
      { label: "الحوكمة", href: "/governance" },
      { label: "بيئات النشر", href: "/deployment" },
      { label: "الأمن المؤسسي", href: "/security" },
    ],
  },
  {
    title: "القطاعات",
    links: [
      { label: "مكاتب المراجعة", href: "/industries#audit-firms" },
      { label: "الجهات الحكومية", href: "/industries#government" },
      { label: "الشركات الكبرى", href: "/industries#enterprise" },
      { label: "الخدمات المهنية", href: "/industries#professional-services" },
    ],
  },
  {
    title: "الإثبات",
    links: [
      { label: "مركز الإثبات", href: "/proof" },
      { label: "الديمو التفاعلي", href: "/demo" },
      { label: "الملخص التنفيذي", href: "/executive-brief" },
      { label: "إطار البايلوت", href: "/pilot-proof" },
      { label: "مكتبة الأدلة", href: "/proof-library" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "عن عقلية", href: "/about" },
      { label: "نماذج التعاون", href: "/engagement-models" },
      { label: "دليل المشتري", href: "/buyers" },
      { label: "رؤى ومقالات", href: "/insights" },
      { label: "تواصل", href: "/contact" },
    ],
  },
];

const legalLinks = [
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "شروط الخدمة", href: "/terms" },
];

/** Product pages remain reachable but not promoted in primary nav. */
const productLinks = [
  { label: "AuditOS", href: "/products/audit" },
  { label: "DecisionOS", href: "/products/decision" },
  { label: "LocalContentOS", href: "/products/local-content" },
];

export function SiteFooter({ locale = "ar" }: { locale?: "ar" | "en" } = {}) {
  const homeHref = locale === "en" ? "/en" : "/";
  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link href={homeHref} className="inline-flex items-center gap-3">
              <Image
                src="/brand/aqliya-logo-approved.png"
                alt="AQLIYA"
                width={116}
                height={34}
                className="h-8 w-auto shrink-0"
              />
            </Link>

            <p className="text-sm leading-7 text-muted-foreground">
              منصة تشغيل مؤسسية للقرارات والعمليات والأدلة. تربط البيانات
              والإجراءات والاعتمادات في مسار واحد قابل للمراجعة.
            </p>

            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                المبدأ المؤسسي
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-foreground">
                الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
              </p>
            </div>
          </div>

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

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50 mb-3">
            أنظمة التشغيل المتخصصة
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground/45 transition-colors hover:text-muted-foreground/70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground/55">
              &copy; {new Date().getFullYear()} AQLIYA.{" "}
              {locale === "en" ? "All rights reserved." : "جميع الحقوق محفوظة."}
            </p>
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
