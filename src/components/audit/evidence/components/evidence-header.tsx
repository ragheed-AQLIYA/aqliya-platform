"use client";

import { useTranslations } from "next-intl";
import { Upload, Bot, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EvidenceHeaderProps {
  missingCount: number;
  suggesting: boolean;
  onGenerateSuggestions: () => void;
  onRequestEvidence: () => void;
}

export function EvidenceHeader({
  missingCount,
  suggesting,
  onGenerateSuggestions,
  onRequestEvidence,
}: EvidenceHeaderProps) {
  const t = useTranslations("audit.evidence");

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
      </div>
      {missingCount > 0 && (
        <Badge variant="outline" className="bg-red-100 text-red-700 w-fit">
          {t("missingCount", { count: missingCount })}
        </Badge>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateSuggestions}
          disabled={suggesting}
          className="gap-1.5"
        >
          {suggesting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Bot className="size-3" />
          )}{" "}
          {t("suggestEvidence")}
        </Button>
        <Button onClick={onRequestEvidence}>
          <Upload className="size-4 me-1" />
          {t("requestEvidence")}
        </Button>
      </div>
    </div>
  );
}
