"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";

const productItems = [
  { label: "DecisionOS", href: "/products/decision", description: "نظام تشغيل القرارات المؤسسية" },
  { label: "SalesOS", href: "/products/sales", description: "نظام تشغيل تطوير الأعمال والمبيعات" },
  { label: "AuditOS", href: "/products/audit", description: "نظام تشغيل المراجعة والالتزام" },
  { label: "LocalContentOS", href: "/products/local-content", description: "نظام تشغيل المحتوى المحلي وسلاسل التوريد" },
];

const resourceItems = [
  { label: "رؤى ومقالات", href: "/insights", description: "تحليلات بدون تسويق" },
  { label: "دراسات الحالة", href: "/case-studies", description: "قصص نجاح وإثبات" },
  { label: "دليل المشتري", href: "/buyers", description: "للمدير المالي وشركاء التدقيق" },
  { label: "الملخص التنفيذي", href: "/executive-brief", description: "قراءة سريعة للمنصة" },
];

function DropdownMenu({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: { label: string; href: string; description: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/70 hover:text-foreground"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-border/60 bg-background p-2 shadow-xl backdrop-blur-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"
            >
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              <span className="text-[11px] text-muted-foreground">{item.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const currentLocale = getCookie("NEXT_LOCALE") ?? "ar";

  const navItems = [
    { label: "الحلول", href: "/solutions", isNew: true },
    {
      label: "المنتجات",
      dropdown: true,
      items: productItems,
      open: productsOpen,
      setOpen: setProductsOpen,
    },
    { label: "المنصة", href: "/platform" },
    {
      label: "الموارد",
      dropdown: true,
      items: resourceItems,
      open: resourcesOpen,
      setOpen: setResourcesOpen,
    },
    { label: "من نحن", href: "/about" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

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
            if ("dropdown" in item && item.dropdown) {
              return (
                <DropdownMenu
                  key={item.label}
                  label={item.label}
                  items={item.items!}
                  isOpen={item.open}
                  onToggle={() => {
                    item.setOpen(!item.open);
                    // Close other dropdown
                    if (item.label === "المنتجات") setResourcesOpen(false);
                    if (item.label === "الموارد") setProductsOpen(false);
                  }}
                  onClose={() => item.setOpen(false)}
                />
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  isActive(item.href!)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                aria-current={isActive(item.href!) ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <span className="mx-3 h-4 w-px bg-border" />

          {/* Language switcher */}
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
            طلب تجربة
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
            {/* Solutions */}
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <span>الحلول</span>
              <span className="text-[11px] text-muted-foreground/50">حسب تحدياتك التشغيلية</span>
            </Link>

            {/* Products Group */}
            <div className="border-t border-border/20 pt-2 mt-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                المنتجات
              </p>
              {productItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] text-muted-foreground/50">{item.description}</span>
                </Link>
              ))}
            </div>

            {/* Platform */}
            <Link
              href="/platform"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-3 text-sm font-medium",
                isActive("/platform")
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              المنصة
            </Link>

            {/* Resources Group */}
            <div className="border-t border-border/20 pt-2">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                الموارد
              </p>
              {resourceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* About */}
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-3 text-sm font-medium",
                isActive("/about")
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              من نحن
            </Link>

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
              طلب تجربة
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
