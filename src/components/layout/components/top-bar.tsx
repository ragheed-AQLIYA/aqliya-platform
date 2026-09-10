"use client";

import { useTranslations } from "next-intl";

const copy = {
  ar: {
    tagline: "منصة تشغيل مؤسسية — السحابة المُدارة",
    status: "المنصة تعمل",
  },
  en: {
    tagline: "Institutional operating platform — managed cloud",
    status: "Platform operational",
  },
} as const;

export function TopBar({ locale }: { locale?: "ar" | "en" } = {}) {
  const t = useTranslations("common");

  // On the EN duplicate-tree the document locale stays "ar", so translations
  // resolve to Arabic. When an explicit locale is passed, use static literals
  // to keep the top bar consistent with the page language.
  const active = locale === "en" ? copy.en : copy.ar;
  const tagline = locale ? active.tagline : t("topBarTagline");
  const status = locale ? active.status : t("topBarStatus");

  return (
    <div className="hidden border-b border-border/30 bg-muted/20 md:block">
      <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
          {tagline}
        </p>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-status-success" />
          {status}
        </span>
      </div>
    </div>
  );
}
