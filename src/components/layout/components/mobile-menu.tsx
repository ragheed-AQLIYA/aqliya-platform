"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavItem, HeaderLabels } from "./use-site-header";

type MobileMenuProps = {
  open: boolean;
  locale: "ar" | "en";
  navItems: NavItem[];
  contactHref: string;
  labels: HeaderLabels;
  onSwitchLocale: (target: "ar" | "en") => void;
  onNavClick: () => void;
};

const localeButtons = [
  { label: "ع", value: "ar" as const },
  { label: "EN", value: "en" as const },
];

export function MobileMenu({
  open,
  locale,
  navItems,
  contactHref,
  labels,
  onSwitchLocale,
  onNavClick,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onNavClick();
        triggerRef.current?.focus();
      }
    },
    [open, onNavClick],
  );

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLButtonElement;
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  useEffect(() => {
    if (open) {
      const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label={labels.mobileNavigation}
      className="border-t border-border/40 bg-background/98 backdrop-blur-xl md:hidden"
    >
      <nav
        id="mobile-main-menu"
        className="flex flex-col gap-0.5 px-4 py-3"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "rounded-xl px-3 py-3 text-sm font-medium",
              item.isActive
                ? "bg-primary/8 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-3">
          {localeButtons.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSwitchLocale(value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                value === locale
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={
                value === "en" ? labels.switchToEnglish : labels.switchToArabic
              }
              aria-pressed={value === locale}
              lang={value}
            >
              {label}
            </button>
          ))}
        </div>

        <Link
          href={contactHref}
          onClick={onNavClick}
          className="btn-primary mt-2 h-11 text-sm"
        >
          {labels.bookSession}
        </Link>
      </nav>
    </div>
  );
}
