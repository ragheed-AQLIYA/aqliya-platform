"use client";

import { Bot, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Engagement } from "@/types/audit";

interface Props {
  title: string;
  engagement: Engagement | null;
  generatingRecDrafts: boolean;
  t: (key: string, values?: Record<string, string | number | Date> | undefined) => string;
  onGenerateDrafts: () => void;
  onCreateClick: () => void;
}

export function RecommendationsHeader({
  title,
  engagement,
  generatingRecDrafts,
  t,
  onGenerateDrafts,
  onCreateClick,
}: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {engagement?.client?.name} - {engagement?.fiscalPeriod}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={generatingRecDrafts}
          onClick={onGenerateDrafts}
          className="gap-1.5"
        >
          {generatingRecDrafts ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Bot className="size-3" />
          )}
          {t("generateDrafts")}
        </Button>
        <Button onClick={onCreateClick}>
          <Plus className="size-4 me-1" />
          {t("newRecommendation")}
        </Button>
      </div>
    </div>
  );
}
