"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviewerSignoffChainAction } from "@/actions/audit-read-actions";
import type { ReviewerSignoffChainSnapshot } from "@/lib/audit/reviewer-signoff-chain";

const statusIcon: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  in_progress: <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />,
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  blocked: <AlertCircle className="h-4 w-4 text-red-600" />,
};

export function ReviewerSignoffChainPanel({
  engagementId,
}: {
  engagementId: string;
}) {
  const [chain, setChain] = useState<ReviewerSignoffChainSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getReviewerSignoffChainAction(engagementId);
      setLoading(false);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setChain(res.data);
    })();
  }, [engagementId]);

  if (loading) {
    return (
      <Card dir="rtl">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !chain) {
    return (
      <Card dir="rtl">
        <CardContent className="py-4 text-sm text-red-600">
          {error ?? "تعذر تحميل سلسلة الاعتماد"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between gap-2">
          <span>سلسلة اعتماد المراجعين (A1-08)</span>
          <Badge variant="outline">{chain.overallProgressPct}%</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {chain.stages.map((stage) => (
          <div
            key={stage.key}
            className="flex items-start gap-3 rounded-md border px-3 py-2"
          >
            <span className="mt-0.5">{statusIcon[stage.status]}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{stage.labelAr}</div>
              <div className="text-xs text-muted-foreground">{stage.detailAr}</div>
              {stage.completedBy && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  {stage.completedBy}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {stage.requiredRole}
            </Badge>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground">{chain.disclaimerAr}</p>
      </CardContent>
    </Card>
  );
}
