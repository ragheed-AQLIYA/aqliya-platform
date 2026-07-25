"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ReviewFilterBarProps {
  filter: "all" | "open" | "resolved";
  totalCount: number;
  openCount: number;
  onFilterChange: (filter: "all" | "open" | "resolved") => void;
}

export function ReviewFilterBar({ filter, totalCount, openCount, onFilterChange }: ReviewFilterBarProps) {
  const t = useTranslations("audit.review");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["all", "open", "resolved"] as const).map((f) => (
        <Button
          key={f}
          variant={filter === f ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(f)}
        >
          {f === "all"
            ? t("all", { count: totalCount })
            : f === "open"
              ? t("open", { count: openCount })
              : t("resolved", { count: totalCount - openCount })}
        </Button>
      ))}
    </div>
  );
}
