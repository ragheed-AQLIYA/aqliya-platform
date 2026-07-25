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
    open,
    switchLocale,
    toggleMenu,
    closeMenu,
  };
}
