"use client"

import { Sparkles, Bot, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AIAssistanceOutput } from "@/types/audit"

interface AiDraftsSectionProps {
  aiDrafts: AIAssistanceOutput[]
  acceptingId: string | null
  onAccept: (ai: AIAssistanceOutput) => void
  onReject: (ai: AIAssistanceOutput) => void
}

export function AiDraftsSection({ aiDrafts, acceptingId, onAccept, onReject }: AiDraftsSectionProps) {
  const t = useTranslations("audit.notes")

  return (
    <Card className="border-violet-200">
      <CardHeader className="border-b border-violet-100 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-violet-500" />
          {t("aiDraftTitle")}
          <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">{t("notFinal")}</Badge>
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground">
          {t("aiDraftDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-violet-100 pt-0">
        {aiDrafts.map(ai => {
          let parsed: Record<string, unknown> = {}
          try { parsed = JSON.parse(ai.outputContent) } catch { parsed = { content: ai.outputContent } }
          return (
            <div key={ai.id} className="py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{(parsed.title as string) ?? t("draftNote")}</span>
                    <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">{t("note")} {(parsed.noteNumber as string) ?? "?"}</Badge>
                    {ai.confidence !== null && (
                        <span className="text-[10px] text-muted-foreground">{Math.round(ai.confidence * 100)}%</span>
                    )}
                  </div>
                  <div className="rounded-md bg-violet-50/50 border border-violet-100 p-3 mt-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{(parsed.content as string) ?? ai.outputContent}</p>
                  </div>
                  {Array.isArray(parsed.missingInformation) && (parsed.missingInformation as string[]).length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-semibold text-amber-700">{t("missingInfoNeeded")}</span>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {(parsed.missingInformation as string[]).map((mi: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                            <AlertTriangle className="size-2.5 me-0.5" />{mi}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(parsed.linkedStatementLine as string | undefined) && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {t("source")} {String(parsed.linkedStatementLine)}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {t("generated")} {new Date(ai.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => onAccept(ai)}
                    disabled={acceptingId === ai.id}
                    title={t("acceptDraft")}
                  >
                    {acceptingId === ai.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject(ai)}
                    disabled={acceptingId === ai.id}
                    title={t("rejectDraft")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
