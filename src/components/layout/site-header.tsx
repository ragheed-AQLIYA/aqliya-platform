"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteHeader } from "./components/use-site-header";
import { TopBar } from "./components/top-bar";
import { DesktopNav } from "./components/desktop-nav";
import { MobileToggle } from "./components/mobile-toggle";
import { MobileMenu } from "./components/mobile-menu";

type SiteHeaderProps = {
  locale?: "ar" | "en";
};

export function SiteHeader({ locale }: SiteHeaderProps) {
  const {
    locale: resolvedLocale,
    navItems,
    homeHref,
    contactHref,
    labels,
    open,
    switchLocale,
    toggleMenu,
    closeMenu,
  } = useSiteHeader(locale);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden
      />
      <TopBar locale={resolvedLocale} />

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

        <DesktopNav
          locale={resolvedLocale}
          navItems={navItems}
          contactHref={contactHref}
          labels={labels}
          onSwitchLocale={switchLocale}
        />

        <MobileToggle
          open={open}
          locale={resolvedLocale}
          onToggle={toggleMenu}
          ariaLabelOpen={labels.openMenu}
          ariaLabelClose={labels.closeMenu}
        />
      </div>

      <MobileMenu
        open={open}
        locale={resolvedLocale}
        navItems={navItems}
        contactHref={contactHref}
        labels={labels}
        onSwitchLocale={switchLocale}
        onNavClick={closeMenu}
      />
    </header>
  );
}
