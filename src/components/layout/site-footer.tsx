import Link from "next/link";
import Image from "next/image";

const footerColumnsAr = [
  {
    title: "المنصة",
    links: [
      { label: "كيف تعمل عقلية", href: "/platform" },
      { label: "أنظمة التشغيل", href: "/products" },
      { label: "من أين تبدأ", href: "/start" },
      { label: "حالات الاستخدام", href: "/use-cases" },
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
      { label: "الملخص التنفيذي", href: "/proof#executive-brief" },
      { label: "إطار التقييم التشغيلي", href: "/proof#evaluation-framework" },
      { label: "مكتبة الأدلة", href: "/proof#evidence-samples" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "عن عقلية", href: "/about" },
      { label: "نماذج التعاون", href: "/start#engagement" },
      { label: "من أين تبدأ", href: "/start" },
      { label: "رؤى ومقالات", href: "/insights" },
      { label: "تواصل", href: "/contact" },
    ],
  },
];

const footerColumnsEn = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/en/platform" },
      { label: "Operating Systems", href: "/en/products" },
      { label: "Where to start", href: "/en/start" },
      { label: "Use cases", href: "/en/use-cases" },
      { label: "Governance", href: "/en/governance" },
      { label: "Deployment", href: "/en/deployment" },
      { label: "Security", href: "/en/security" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Audit firms", href: "/en/industries#audit-firms" },
      { label: "Government entities", href: "/en/industries#government" },
      { label: "Enterprise", href: "/en/industries#enterprise" },
      { label: "Professional services", href: "/en/industries#professional-services" },
    ],
  },
  {
    title: "Proof",
    links: [
      { label: "Proof center", href: "/en/proof" },
      { label: "Interactive demo", href: "/en/demo" },
      { label: "Executive brief", href: "/en/proof#executive-brief" },
      { label: "Evaluation framework", href: "/en/proof#evaluation-framework" },
      { label: "Evidence samples", href: "/en/proof#evidence-samples" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About AQLIYA", href: "/en/about" },
      { label: "Engagement models", href: "/en/start#engagement" },
      { label: "Where to start", href: "/en/start" },
      { label: "Insights", href: "/en/insights" },
      { label: "Contact", href: "/en/contact" },
    ],
  },
];

const legalLinksAr = [
  { label: "سياسة الخصوصية", href: "/privacy" },
  { label: "شروط الخدمة", href: "/terms" },
];

const legalLinksEn = [
  { label: "Privacy Policy", href: "/en/privacy" },
  { label: "Terms of Service", href: "/en/terms" },
];

/** Product pages remain reachable but not promoted in primary nav. */
const productLinksAr = [
  { label: "AuditOS", href: "/products/audit" },
  { label: "DecisionOS", href: "/products/decision" },
  { label: "LocalContentOS", href: "/products/local-content" },
];

const productLinksEn = [
  { label: "AuditOS", href: "/en/products/audit" },
  { label: "DecisionOS", href: "/en/products/decision" },
  { label: "LocalContentOS", href: "/en/products/local-content" },
];

export function SiteFooter({ locale = "ar" }: { locale?: "ar" | "en" } = {}) {
  const isEn = locale === "en";
  const homeHref = isEn ? "/en" : "/";
  const footerColumns = isEn ? footerColumnsEn : footerColumnsAr;
  const legalLinks = isEn ? legalLinksEn : legalLinksAr;
  const productLinks = isEn ? productLinksEn : productLinksAr;

  return (
    <footer role="contentinfo" className="border-t bg-gradient-to-b from-muted/30 to-background" dir={isEn ? "ltr" : undefined}>
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
              {isEn
                ? "An institutional operating platform for decisions, processes, and evidence. It connects data, actions, and approvals in a single auditable path."
                : "منصة تشغيل مؤسسية للقرارات والعمليات والأدلة. تربط البيانات والإجراءات والاعتمادات في مسار واحد قابل للمراجعة."}
            </p>

            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/20 p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary/70">
                {isEn ? "Institutional Principle" : "المبدأ المؤسسي"}
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-foreground">
                {isEn
                  ? "AI assists. Humans decide. Evidence governs."
                  : "الذكاء يساعد. الإنسان يقرر. الدليل يحكم."}
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
            {isEn ? "Operating Systems" : "أنظمة التشغيل المتخصصة"}
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
              {isEn ? "All rights reserved." : "جميع الحقوق محفوظة."}
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
