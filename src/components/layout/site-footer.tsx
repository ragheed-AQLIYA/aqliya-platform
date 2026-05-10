import Link from "next/link"
import Image from "next/image"

const footerLinks = [
  {
    title: "الصفحات",
    links: [
      { label: "الرئيسية", href: "/" },
      { label: "صمّم منتجك", href: "/custom-product" },
      { label: "المنتجات", href: "/products" },
      { label: "كيف نعمل", href: "/how-we-work" },
      { label: "من نحن", href: "/about" },
      { label: "تواصل معنا", href: "/contact" },
    ],
  },
  {
    title: "المنتجات",
    links: [
      { label: "اتخاذ القرار", href: "/products/decision" },
      { label: "المحاكاة", href: "/products/simulation" },
      { label: "المبيعات", href: "/products/sales" },
      { label: "المراجعة والتدقيق", href: "/products/audit" },
      { label: "المحتوى المحلي", href: "/products/local-content" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/brand/aqliya-mark.svg"
                alt="AQLIYA"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="text-lg font-black tracking-tight text-primary">AQLIYA</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              شركة تقنية تصنع وتعدّ أنظمة برمجية وذكاء مؤسسي حسب طبيعة عمل المؤسسات.
            </p>
            <p className="text-sm text-muted-foreground">
              <a href="mailto:ragheed@aqliya.com" className="hover:text-primary transition-colors">
                ragheed@aqliya.com
              </a>
            </p>
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
