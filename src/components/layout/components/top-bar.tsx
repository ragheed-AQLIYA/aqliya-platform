"use client";

import { useTranslations } from "next-intl";

export function TopBar() {
  const t = useTranslations("common");

  return (
    <div className="hidden border-b border-border/30 bg-muted/20 md:block">
      <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
          {t("topBarTagline")}
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
          {t("topBarStatus")}
        </span>
      </div>
    </div>
  );
}
