"use client";

import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountResearchRun } from "@/lib/sales/agents/account-research";
import { RESEARCH_STATUS_LABELS, formatArDate } from "./account-brief-constants";

export function AccountBriefResearchCard({
  research,
}: {
  research: AccountResearchRun | null;
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          موجز البحث
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!research ? (
          <p className="text-muted-foreground">لا موجز بحث بعد.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {RESEARCH_STATUS_LABELS[research.status] ?? research.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                الثقة: {research.confidence}% · {research.sources.length} مصدر
              </span>
            </div>
            <pre className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
              {research.brief}
            </pre>
            {research.sources.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {research.sources.map((source, index) => (
                  <li key={`${source.type}-${index}`}>
                    {source.label}
                    {source.value != null ? ` — ${source.value}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-xs text-muted-foreground">
              توليد: {research.generatedByName ?? research.generatedById} ·{" "}
              {formatArDate(research.generatedAt)}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
