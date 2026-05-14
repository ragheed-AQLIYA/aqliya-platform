import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "كيف نعمل", href: "/how-we-work" },
      { label: "ناقش تفعيل النظام", href: "/contact" },
      { label: "صمّم نظامك المؤسسي", href: "/custom-product" },
      { label: "تواصل معنا", href: "/contact" },
    ],
  },
  {
    title: "خطوط الأنظمة",
    links: [
      { label: "AuditOS — نظام التدقيق والذكاء المالي", href: "/products/audit" },
      { label: "LocalContentOS — نظام المحتوى المحلي", href: "/products/local-content" },
      { label: "DecisionOS — نظام حوكمة القرارات", href: "/products/decision" },
      { label: "SalesOS — نظام الذاكرة التجارية والمبيعات", href: "/products/sales" },
      { label: "SimulationOS — نظام محاكاة السيناريوهات", href: "/products/simulation" },
      { label: "Custom Systems — أنظمة مؤسسية مخصصة", href: "/custom-product" },
    ],
  },
  {
    title: "التفعيل والاستكشاف",
    links: [
      { label: "استكشف خطوط عقلية", href: "/products" },
      { label: "شاهد AuditOS كأول تطبيق", href: "/auditos" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
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
            <p className="text-sm leading-6 text-muted-foreground">
              عقلية منصة ذكاء مؤسسي خاص ومحكوم، تقدم خطوط أنظمة متخصصة تربط البيانات، الإجراءات، المخرجات، والأدلة داخل بيئة واحدة قابلة للمراجعة والاعتماد.
            </p>
            <p className="text-xs leading-6 text-muted-foreground/90">
              الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.
            </p>
            <a href="mailto:ragheed@aqliya.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ragheed@aqliya.com
            </a>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
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
  )
}
