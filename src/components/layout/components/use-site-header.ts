"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import {
  isEnglishPath,
  toArabicPath,
  toEnglishPath,
} from "@/lib/marketing/locale-paths";
import { getBookingUrl } from "@/lib/marketing/booking";

const navItemsAr = [
  { label: "المنصة", href: "/platform" },
  { label: "أنظمة التشغيل", href: "/products" },
  { label: "الأسعار", href: "/pricing" },
  { label: "الحوكمة", href: "/governance" },
  { label: "لماذا AQLIYA", href: "/proof" },
  { label: "عن عقلية", href: "/about" },
];

const navItemsEn = [
  { label: "Platform", href: "/en/platform" },
  { label: "Systems", href: "/en/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Governance", href: "/en/governance" },
  { label: "Why AQLIYA", href: "/en/proof" },
  { label: "About", href: "/en/about" },
];

export type NavItem = { label: string; href: string; isActive: boolean };

const headerLabels = {
  ar: {
    bookSession: "احجز جلسة تشخيص",
    mainNavigation: "التنقل الرئيسي",
    mobileNavigation: "التنقل الرئيسي للجوال",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    switchToEnglish: "التبديل إلى الإنجليزية",
    switchToArabic: "التبديل إلى العربية",
  },
  en: {
    bookSession: "Book a Diagnostic Session",
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchToEnglish: "Switch to English",
    switchToArabic: "Switch to Arabic",
  },
} as const;

export type HeaderLabels = Record<keyof (typeof headerLabels)["ar"], string>;

function computeIsActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/" && href !== "/en" && pathname.startsWith(href))
  );
}

export function useSiteHeader(localeProp?: "ar" | "en") {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const locale = localeProp ?? (isEnglishPath(pathname) ? "en" : "ar");
  const baseItems = locale === "en" ? navItemsEn : navItemsAr;
  const navItems: NavItem[] = baseItems.map((item) => ({
    ...item,
    isActive: computeIsActive(pathname, item.href),
  }));
  const homeHref = locale === "en" ? "/en" : "/";
  const contactHref = getBookingUrl(locale);
  const labels: HeaderLabels = locale === "en" ? headerLabels.en : headerLabels.ar;

  const switchLocale = useCallback(
    (target: "ar" | "en") => {
      setCookie("NEXT_LOCALE", target);
      const nextPath =
        target === "en" ? toEnglishPath(pathname) : toArabicPath(pathname);
      router.push(nextPath);
      setOpen(false);
    },
    [pathname, router],
  );

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  const closeMenu = useCallback(() => setOpen(false), []);

  return {
    locale,
    pathname,
    navItems,
    homeHref,
    contactHref,
    labels,
    open,
    switchLocale,
    toggleMenu,
    closeMenu,
  };
}
