"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  totalLines: number;
  completionPct: number;
  pendingFlagsCount: number;
  pendingSuggestionsCount: number;
}

export function SummaryCards({
  totalLines,
  completionPct,
  pendingFlagsCount,
  pendingSuggestionsCount,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">{totalLines}</CardTitle>
          <CardDescription>إجمالي الأسطر / Total Lines</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-green-600">
            {completionPct}%
          </CardTitle>
          <CardDescription>الإكمال / Completion</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-amber-600">
            {pendingFlagsCount}
          </CardTitle>
          <CardDescription>FP بانتظار المراجعة</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-blue-600">
            {pendingSuggestionsCount}
          </CardTitle>
          <CardDescription>اقتراحات أنماط</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
