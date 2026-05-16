"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنتجات", href: "/products" },
  { label: "منهجية العمل", href: "/how-we-work" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentLocale = getCookie("NEXT_LOCALE") ?? "ar";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/78 backdrop-blur-xl supports-[backdrop-filter]:bg-background/62">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="AQLIYA"
        >
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={120}
            height={36}
            priority
            className="shrink-0 h-9 w-auto"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="التنقل الرئيسي"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-2 h-5 w-px bg-border" />
          {[
            { label: "AR", value: "ar" },
            { label: "EN", value: "en" },
            { label: "TR", value: "tr" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setCookie("NEXT_LOCALE", value);
                window.location.reload();
              }}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors",
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
          <Link
            href="/custom-product"
            className="btn-primary mr-3 h-9 px-4 text-sm"
          >
            صمّم نظامك المؤسسي
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-main-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav
            id="mobile-main-menu"
            className="flex flex-col gap-1 px-4 py-4"
            aria-label="التنقل الرئيسي للجوال"
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-3 flex items-center gap-1 border-t pt-3">
              {[
                { label: "AR", value: "ar" },
                { label: "EN", value: "en" },
                { label: "TR", value: "tr" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => {
                    setCookie("NEXT_LOCALE", value);
                    window.location.reload();
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
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
              href="/custom-product"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 h-10 text-sm"
            >
              صمّم نظامك المؤسسي
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
