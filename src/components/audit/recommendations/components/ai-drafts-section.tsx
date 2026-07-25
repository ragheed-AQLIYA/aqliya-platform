"use client";

import { Bot, Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskColors } from "../use-recommendations-page";
import type { AIAssistanceOutput } from "@/types/audit";

interface Props {
  aiDrafts: AIAssistanceOutput[];
  acceptingRecId: string | null;
  t: (key: string, values?: Record<string, string | number | Date> | undefined) => string;
  onAccept: (ai: AIAssistanceOutput) => void;
  onReject: (ai: AIAssistanceOutput) => void;
}

export function AiDraftsSection({
  aiDrafts,
  acceptingRecId,
  t,
  onAccept,
  onReject,
}: Props) {
  if (aiDrafts.length === 0) return null;

  return (
    <Card className="rounded-[24px] border-violet-200 shadow-sm">
      <CardHeader className="border-b border-violet-100 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-violet-500" />
          {t("aiDraftTitle")}
          <Badge
            variant="outline"
            className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]"
          >
            {t("notFinal")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-violet-100 pt-0">
        {aiDrafts.map((ai) => {
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(ai.outputContent);
          } catch {
            parsed = { description: ai.outputContent };
          }
          return (
            <div key={ai.id} className="flex items-start gap-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {(parsed.title as string) ?? t("draftRec")}
                  </span>
                  {(() => {
                    const v = parsed.riskLevel;
                    return v != null && v !== "" ? (
                      <Badge
                        variant="outline"
                        className={
                          (riskColors[String(v)] ?? "") + " text-[10px]"
                        }
                      >
                        {String(v)}
                      </Badge>
                    ) : null;
                  })()}
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round((ai.confidence ?? 0) * 100)}%
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {String(parsed.description ?? "")}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {t("action")} {String(parsed.recommendedAction ?? "")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => onAccept(ai)}
                  disabled={acceptingRecId === ai.id}
                  title={t("accept")}
                >
                  {acceptingRecId === ai.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onReject(ai)}
                  title={t("reject")}
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
