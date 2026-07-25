"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SummaryCards({
  pendingFlagsCount,
  pendingSuggestionsCount,
  industryBenchmarksCount,
  orgMemoryCount,
}: {
  pendingFlagsCount: number;
  pendingSuggestionsCount: number;
  industryBenchmarksCount: number;
  orgMemoryCount: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-amber-600">{pendingFlagsCount}</CardTitle>
          <CardDescription>بانتظار المراجعة / Pending FP Flags</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-blue-600">{pendingSuggestionsCount}</CardTitle>
          <CardDescription>اقتراحات أنماط / Pattern Suggestions</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-green-600">{industryBenchmarksCount}</CardTitle>
          <CardDescription>أنماط قطاعية / Industry Patterns</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-purple-600">{orgMemoryCount}</CardTitle>
          <CardDescription>قرارات سابقة / Org Memory</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
