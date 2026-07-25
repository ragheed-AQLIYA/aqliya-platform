"use client";

import { useTranslations } from "next-intl";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Bot,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AIAssistanceOutput } from "@/types/audit";
import { severityColors } from "./constants";

interface AiDraftsPanelProps {
  aiDrafts: AIAssistanceOutput[];
  acceptingFindingId: string | null;
  engagementId: string;
  onAccept: (ai: AIAssistanceOutput) => void;
  onReject: (ai: AIAssistanceOutput) => void;
}

export function AiDraftsPanel({
  aiDrafts,
  acceptingFindingId,
  onAccept,
  onReject,
}: AiDraftsPanelProps) {
  const t = useTranslations("audit.findings");

  const severityLabel: Record<string, string> = {
    low: t("low"),
    medium: t("medium"),
    high: t("high"),
    critical: t("critical"),
  };

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
            <div key={ai.id} className="py-3 flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 shrink-0">
                <Sparkles className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {(parsed.title as string) ?? t("draftFinding")}
                  </span>
                  {parsed.severity != null && String(parsed.severity) && (
                    <Badge
                      variant="outline"
                      className={
                        (severityColors[String(parsed.severity)] ?? "") +
                        " text-[10px]"
                      }
                    >
                      {severityLabel[String(parsed.severity)] ||
                        String(parsed.severity)}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {t("confidence", {
                      pct: Math.round((ai.confidence ?? 0) * 100),
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {String(parsed.description ?? "")}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onAccept(ai)}
                  disabled={acceptingFindingId === ai.id}
                  title={t("accept")}
                >
                  {acceptingFindingId === ai.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
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
