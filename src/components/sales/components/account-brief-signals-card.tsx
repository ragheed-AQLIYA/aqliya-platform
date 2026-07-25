"use client";

import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  signalSeverityLabelAr,
  signalTypeLabelAr,
  type SalesSignalView,
} from "@/lib/sales/signals-view";
import { SEVERITY_COLORS, formatArDate } from "./account-brief-constants";

export function AccountBriefSignalsCard({
  signals,
}: {
  signals: SalesSignalView[];
}) {
  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          الإشارات ({signals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا إشارات مسجّلة.</p>
        ) : (
          <ul className="space-y-3">
            {signals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-md border p-3 text-sm print:break-inside-avoid"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{signal.title}</span>
                  <Badge variant="outline">
                    {signalTypeLabelAr(signal.type)}
                  </Badge>
                  {signal.severity ? (
                    <Badge
                      className={SEVERITY_COLORS[signal.severity] ?? ""}
                      variant="secondary"
                    >
                      {signalSeverityLabelAr(signal.severity)}
                    </Badge>
                  ) : null}
                </div>
                {signal.summary ? (
                  <p className="text-muted-foreground">{signal.summary}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatArDate(signal.detectedAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
