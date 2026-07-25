"use client";

import { useTranslations } from "next-intl";
import {
  Bot,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { AIAssistanceOutput } from "@/types/audit";

interface AISuggestionsPanelProps {
  suggestions: AIAssistanceOutput[];
  acceptingSuggestionId: string | null;
  onAcceptSuggestion: (ai: AIAssistanceOutput) => void;
  onDismissSuggestion: (id: string) => void;
}

export function AISuggestionsPanel({
  suggestions,
  acceptingSuggestionId,
  onAcceptSuggestion,
  onDismissSuggestion,
}: AISuggestionsPanelProps) {
  const t = useTranslations("audit.evidence");

  if (suggestions.length === 0) return null;

  return (
    <Card className="rounded-[24px] border-violet-200 shadow-sm">
      <CardHeader className="border-b border-violet-100 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-violet-500" />
          {t("aiTitle")}
          <Badge
            variant="outline"
            className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]"
          >
            {t("notFinal")}
          </Badge>
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground">
          {t("aiDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-violet-100 pt-0">
        {suggestions.map((ai) => {
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(ai.outputContent);
          } catch {
            parsed = { reason: ai.outputContent };
          }
          return (
            <div key={ai.id} className="py-3 flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {(parsed.filename as string) ?? t("evidenceDraft")}
                  </span>
                  {ai.confidence !== null && (
                    <span className="text-[10px] text-muted-foreground">
                      {t("confidence", {
                        pct: Math.round(ai.confidence * 100),
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(parsed.reason as string) ?? ""}
                </p>
                {(parsed.accountName as string | undefined) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t("relatedAccount", {
                      account: String(parsed.accountName),
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onAcceptSuggestion(ai)}
                  disabled={acceptingSuggestionId === ai.id}
                  title={t("acceptSuggestion")}
                >
                  {acceptingSuggestionId === ai.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDismissSuggestion(ai.id)}
                  title={t("dismissSuggestion")}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
