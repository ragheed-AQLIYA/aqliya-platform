"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { NavItem } from "./use-site-header";

type DesktopNavProps = {
  locale: "ar" | "en";
  navItems: NavItem[];
  contactHref: string;
  onSwitchLocale: (target: "ar" | "en") => void;
};

const localeButtons = [
  { label: "ع", value: "ar" as const },
  { label: "EN", value: "en" as const },
];

export function DesktopNav({
  locale,
  navItems,
  contactHref,
  onSwitchLocale,
}: DesktopNavProps) {
  const t = useTranslations("common");

  return (
    <nav
      className="hidden items-center gap-0.5 md:flex"
      aria-label={t("mainNavigation")}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
            item.isActive
              ? "bg-primary/8 text-primary"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
          )}
          aria-current={item.isActive ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}

      <span className="mx-3 h-4 w-px bg-border" />

      {localeButtons.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSwitchLocale(value)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            value === locale
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={
            value === "en" ? t("switchToEnglish") : t("switchToArabic")
          }
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
        {t("bookSession")}
      </Link>
    </nav>
  );
}
