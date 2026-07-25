"use client";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { icpBandLabelAr } from "@/lib/sales/icp-types";
import type { AccountIcpAssessment } from "@/lib/sales/icp-types";

export function AccountBriefIcpCard({
  assessment,
}: {
  assessment: AccountIcpAssessment;
}) {
  const icp = assessment.score;

  return (
    <Card className="print:border-0 print:shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          ملاءمة ICP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!assessment.configured || !icp ? (
          <p className="text-muted-foreground">لا يوجد تقييم ICP.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {icp.fitScore}%
                </p>
                <p className="text-muted-foreground">
                  {icpBandLabelAr(icp.band)}
                </p>
              </div>
              {icp.segment ? (
                <span className="rounded-md border px-2 py-1 text-xs font-medium">
                  {icp.segment}
                </span>
              ) : null}
            </div>
            {icp.confidence != null ? (
              <p>
                الثقة:{" "}
                <span className="font-medium">{icp.confidence}%</span>
              </p>
            ) : null}
            {icp.reasoning && icp.reasoning.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {icp.reasoning.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : icp.notes ? (
              <p className="text-muted-foreground">{icp.notes}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
