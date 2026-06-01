"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

// Navigation redesign decisions:
// 1. Platform + Systems + Governance = three pillars enterprise buyers need
// 2. Removed "How We Work" from primary nav (moved to footer)
// 3. Removed Turkish (AR/EN for target market only)
// 4. CTA changed: "طلب جلسة تنفيذية" — executive qualification signal
// 5. Added institutional top bar with operational status signal

const navItems = [
  { label: "المنصة", href: "/platform", description: "AQLIYA Intelligence Core" },
  { label: "الأنظمة", href: "/products", description: "خطوط الأنظمة المؤسسية" },
  { label: "الحوكمة", href: "/governance", description: "بنية الثقة والأدلة" },
  { label: "الإثبات", href: "/proof-library", description: "دراسات الحالة والدليل" },
  { label: "من نحن", href: "/about", description: "" },
  { label: "تواصل", href: "/contact", description: "" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentLocale = getCookie("NEXT_LOCALE") ?? "ar";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      {/* Institutional top bar */}
      <div className="hidden border-b border-border/30 bg-muted/20 md:block">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
            Private Governed Institutional Intelligence Platform
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
              السحابة متاحة الآن
            </span>
            <a
              href="mailto:ragheed@aqliya.com"
              className="text-[10px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              ragheed@aqliya.com
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
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

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="التنقل الرئيسي"
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px rounded-full bg-primary/50" />
                )}
              </Link>
            );
          })}

          <span className="mx-3 h-4 w-px bg-border" />

          {/* Language switcher — AR/EN only */}
          {[
            { label: "ع", value: "ar" },
            { label: "EN", value: "en" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setCookie("NEXT_LOCALE", value);
                window.location.reload();
              }}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                value === currentLocale
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Switch to ${value}`}
              aria-pressed={value === currentLocale}
              lang={value}
            >
              {label}
            </button>
          ))}

          {/* Secondary CTA — Demo */}
          <Link
            href="/demo"
            className="mr-1 inline-flex h-9 items-center rounded-lg border border-border/60 px-3.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary"
          >
            الديمو
          </Link>

          {/* Primary CTA */}
          <Link
            href="/contact"
            className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/15 transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            طلب جلسة تنفيذية
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 md:hidden"
          aria-label="فتح القائمة"
          aria-expanded={open}
          aria-controls="mobile-main-menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border/40 bg-background/98 backdrop-blur-xl md:hidden">
          <nav
            id="mobile-main-menu"
            className="flex flex-col gap-0.5 px-4 py-3"
            aria-label="التنقل الرئيسي للجوال"
          >
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-[11px] text-muted-foreground/50">
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-3">
              {[
                { label: "ع", value: "ar" },
                { label: "EN", value: "en" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => {
                    setCookie("NEXT_LOCALE", value);
                    window.location.reload();
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    value === currentLocale
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={value === currentLocale}
                  lang={value}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="btn-outline mt-2 h-11 text-sm"
            >
              مشاهدة الديمو
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary mt-1 h-11 text-sm"
            >
              طلب جلسة تنفيذية
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
