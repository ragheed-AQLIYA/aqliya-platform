import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  {
    title: "الشركة",
    links: [
      { label: "الرئيسية", href: "/" },
      { label: "من نحن", href: "/about" },
      { label: "كيف نعمل", href: "/how-we-work" },
      { label: "تواصل معنا", href: "/contact" },
    ],
  },
  {
    title: "الأنظمة",
    links: [
      { label: "صمّم نظامك", href: "/custom-product" },
      { label: "أنظمة اتخاذ القرار", href: "/products/decision" },
      { label: "أنظمة المحاكاة", href: "/products/simulation" },
      { label: "أنظمة المبيعات", href: "/products/sales" },
    ],
  },
  {
    title: "المنتجات",
    links: [
      { label: "AQLIYA AuditOS", href: "/auditos" },
      { label: "أنظمة المحتوى المحلي", href: "/products/local-content" },
      { label: "جميع خطوط الحلول", href: "/products" },
    ],
  },
  {
    title: "التواصل",
    links: [
      { label: "البريد الإلكتروني", href: "mailto:ragheed@aqliya.com" },
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
              شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات.
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
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
