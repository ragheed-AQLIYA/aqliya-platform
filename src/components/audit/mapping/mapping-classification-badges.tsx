"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MappingClassificationExplanation } from "@/lib/tb-intelligence/classification-explanation";

const SOURCE_CLASSES: Record<
  MappingClassificationExplanation["source"]["type"],
  string
> = {
  firm_memory: "bg-indigo-100 text-indigo-900 border-indigo-300",
  erp_rule: "bg-slate-100 text-slate-900 border-slate-300",
  local_ai: "bg-emerald-100 text-emerald-900 border-emerald-300",
  human: "bg-amber-100 text-amber-900 border-amber-300",
};

const TRUST_CLASSES: Record<string, string> = {
  TRUSTED: "bg-green-100 text-green-800 border-green-400",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  DRAFT: "bg-muted text-muted-foreground border-border",
  DEPRECATED: "bg-red-100 text-red-800 border-red-300",
};

function formatTierLabel(tier: string | undefined, t: (k: string) => string) {
  if (!tier) return "—";
  const key = `tier_${tier.replace(/[^a-z0-9_]/gi, "_")}`;
  const translated = t(key);
  return translated === key ? tier.replace(/_/g, " ") : translated;
}

function formatDate(iso: string | undefined, locale: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

type Props = {
  explanation?: MappingClassificationExplanation;
  locale?: string;
};

export function MappingClassificationBadges({
  explanation,
  locale = "en",
}: Props) {
  const t = useTranslations("audit.mapping");

  if (!explanation) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const { source, memoryGovernance, evidence, autoSuggestEligible } =
    explanation;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="outline"
        className={`text-xs ${SOURCE_CLASSES[source.type]}`}
      >
        {t(`badgeSource_${source.type}`)}
      </Badge>

      {memoryGovernance && source.type === "firm_memory" && (
        <Badge
          variant="outline"
          className={`text-xs ${TRUST_CLASSES[memoryGovernance.status] ?? TRUST_CLASSES.CONFIRMED}`}
        >
          {t(`badgeTrust_${memoryGovernance.status}`)}
        </Badge>
      )}

      {autoSuggestEligible && (
        <Badge
          variant="outline"
          className="text-xs bg-green-50 text-green-700 border-green-400"
        >
          {t("badgeAutoSuggest")}
        </Badge>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            aria-label={t("evidenceTitle")}
          >
            <Info className="size-3.5 me-1" />
            {t("evidenceButton")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 text-sm" align="start">
          <p className="font-medium mb-2">{t("evidenceTitle")}</p>
          <dl className="space-y-2 text-xs">
            {evidence?.matchedBy && (
              <div>
                <dt className="text-muted-foreground">{t("evidenceMatchedBy")}</dt>
                <dd className="font-medium">
                  {formatTierLabel(evidence.matchedBy, t)}
                </dd>
              </div>
            )}
            {(evidence?.erpMap1 || evidence?.erpMap2) && (
              <div>
                <dt className="text-muted-foreground">{t("evidenceErp")}</dt>
                <dd className="font-medium space-y-0.5">
                  {evidence.erpMap1 && (
                    <div>
                      {t("evidenceMap1")} = {evidence.erpMap1}
                    </div>
                  )}
                  {evidence.erpMap2 && (
                    <div>
                      {t("evidenceMap2")} = {evidence.erpMap2}
                    </div>
                  )}
                </dd>
              </div>
            )}
            {memoryGovernance && (
              <>
                <div>
                  <dt className="text-muted-foreground">{t("evidenceUsage")}</dt>
                  <dd className="font-medium">
                    {t("evidenceUsageTimes", {
                      count: memoryGovernance.hitCount,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("evidenceReviewers")}
                  </dt>
                  <dd className="font-medium">{memoryGovernance.reviewerCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t("evidenceLastConfirmed")}
                  </dt>
                  <dd className="font-medium">
                    {formatDate(memoryGovernance.lastConfirmedAt, locale)}
                  </dd>
                </div>
              </>
            )}
            {evidence?.detail && !memoryGovernance && (
              <div>
                <dt className="text-muted-foreground">{t("evidenceDetail")}</dt>
                <dd className="font-medium">{evidence.detail}</dd>
              </div>
            )}
          </dl>
        </PopoverContent>
      </Popover>
    </div>
  );
}
