"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import {
  isEnglishPath,
  toArabicPath,
  toEnglishPath,
} from "@/lib/marketing/locale-paths";
import { getBookingUrl } from "@/lib/marketing/booking";
import { Menu, X } from "lucide-react";

const navItemsAr = [
  { label: "المنصة", href: "/platform" },
  { label: "القطاعات", href: "/industries" },
  { label: "الإثبات", href: "/proof" },
  { label: "الحوكمة", href: "/governance" },
  { label: "عن عقلية", href: "/about" },
];

const navItemsEn = [
  { label: "Platform", href: "/en/platform" },
  { label: "Industries", href: "/en/industries" },
  { label: "Proof", href: "/en/proof" },
  { label: "Governance", href: "/en/governance" },
  { label: "About", href: "/en/about" },
];

type SiteHeaderProps = {
  locale?: "ar" | "en";
};

export function SiteHeader({ locale: localeProp }: SiteHeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const locale =
    localeProp ?? (isEnglishPath(pathname) ? "en" : "ar");
  const navItems = locale === "en" ? navItemsEn : navItemsAr;
  const homeHref = locale === "en" ? "/en" : "/";
  const contactHref = getBookingUrl(locale);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && href !== "/en" && pathname.startsWith(href));

  const switchLocale = (target: "ar" | "en") => {
    setCookie("NEXT_LOCALE", target);
    const nextPath =
      target === "en" ? toEnglishPath(pathname) : toArabicPath(pathname);
    router.push(nextPath);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="hidden border-b border-border/30 bg-muted/20 md:block">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
            Private Governed Institutional Intelligence Platform
          </p>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
            {locale === "en"
              ? "Institutional operating platform — managed cloud"
              : "منصة تشغيل مؤسسية — السحابة المُدارة"}
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link
          href={homeHref}
          className="flex shrink-0 items-center gap-3"
          aria-label="AQLIYA"
        >
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={116}
            height={34}
            priority
            className="h-8 w-auto shrink-0"
          />
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label={locale === "en" ? "Main navigation" : "التنقل الرئيسي"}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}

          <span className="mx-3 h-4 w-px bg-border" />

          {[
            { label: "ع", value: "ar" as const },
            { label: "EN", value: "en" as const },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => switchLocale(value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                value === locale
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Switch to ${value}`}
              aria-pressed={value === locale}
              lang={value}
            >
              {label}
            </button>
          ))}

          <Link
            href={contactHref}
            className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/15 transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {locale === "en" ? "Schedule diagnostic" : "احجز جلسة تشخيص"}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 md:hidden"
          aria-label={locale === "en" ? "Open menu" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="mobile-main-menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background/98 backdrop-blur-xl md:hidden">
          <nav
            id="mobile-main-menu"
            className="flex flex-col gap-0.5 px-4 py-3"
            aria-label={
              locale === "en" ? "Mobile main navigation" : "التنقل الرئيسي للجوال"
            }
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-3">
              {[
                { label: "ع", value: "ar" as const },
                { label: "EN", value: "en" as const },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchLocale(value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    value === locale
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={value === locale}
                  lang={value}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              href={contactHref}
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 h-11 text-sm"
            >
              {locale === "en" ? "Schedule diagnostic" : "احجز جلسة تشخيص"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
