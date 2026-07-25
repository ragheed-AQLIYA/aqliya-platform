"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LcWorkbookLine } from "./types";

function LineCard({
  line,
  explanations,
}: {
  line: LcWorkbookLine;
  explanations: any[];
}) {
  const lineExplanations = explanations.filter(
    (e) => e.workbookLineCode === line.code,
  );

  return (
    <Card key={line.id} className="border-l-4 border-l-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
              {line.code}
            </code>
            <span className="text-sm font-medium">{line.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {line.autoFillable && (
              <Badge variant="outline" className="text-xs">
                {line.source === "formula" ? "معادلة" : line.autoFilled ? "تلقائي" : "يدوي"}
              </Badge>
            )}
            <Badge
              variant={
                line.confidence === "high"
                  ? "default"
                  : line.confidence === "medium"
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs"
            >
              {line.confidence === "high"
                ? "عالية"
                : line.confidence === "medium"
                  ? "متوسطة"
                  : "منخفضة"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {line.autoFillSource && (
          <p className="text-xs text-muted-foreground mb-2">
            المصدر: {line.autoFillSource}
            {line.autoFillValue !== null && (
              <> | القيمة: {line.autoFillValue.toLocaleString()}</>
            )}
          </p>
        )}
        {lineExplanations.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              شرح المطابقات / Match Explanations:
            </p>
            {lineExplanations.slice(0, 3).map((exp, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs rounded bg-muted/50 px-2 py-1"
              >
                <code className="font-mono">{exp.accountCode}</code>
                <span className="text-muted-foreground truncate">
                  {exp.accountName}
                </span>
                <Badge
                  variant={
                    exp.riskLevel === "high"
                      ? "destructive"
                      : exp.riskLevel === "medium"
                        ? "default"
                        : "secondary"
                  }
                  className="text-[10px]"
                >
                  {exp.riskLevel}
                </Badge>
              </div>
            ))}
            {lineExplanations.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{lineExplanations.length - 3} أخرى
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Props {
  lines: LcWorkbookLine[];
  explanations: any[];
}

export function LinesTab({ lines, explanations }: Props) {
  if (lines.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          المصنف فارغ. قم بتعبئته أولاً.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {lines.map((line) => (
        <LineCard key={line.id} line={line} explanations={explanations} />
      ))}
    </div>
  );
}
