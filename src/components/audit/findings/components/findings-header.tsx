"use client";

import { useTranslations } from "next-intl";
import { Plus, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Engagement } from "@/types/audit";

interface FindingsHeaderProps {
  engagement: Engagement | null;
  generatingFindingDrafts: boolean;
  onGenerateDrafts: () => void;
  onCreateClick: () => void;
}

export function FindingsHeader({
  engagement,
  generatingFindingDrafts,
  onGenerateDrafts,
  onCreateClick,
}: FindingsHeaderProps) {
  const t = useTranslations("audit.findings");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {engagement?.client?.name} - {engagement?.fiscalPeriod}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={generatingFindingDrafts}
          onClick={onGenerateDrafts}
          className="gap-1.5"
        >
          {generatingFindingDrafts ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Bot className="size-3" />
          )}{" "}
          {t("generateDrafts")}
        </Button>
        <Button onClick={onCreateClick}>
          <Plus className="size-4 me-1" />
          {t("createFinding")}
        </Button>
      </div>
    </div>
  );
}
