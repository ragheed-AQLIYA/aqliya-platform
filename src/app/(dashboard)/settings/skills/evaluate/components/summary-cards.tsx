"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SummaryCardsProps {
  summary: {
    total: number;
    withDatasets: number;
    withCriteria: number;
    byLevel: Record<number, number>;
  };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center">
            {summary.total}
          </CardTitle>
          <CardDescription className="text-center">إجمالي المهارات</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            {summary.withDatasets}
          </CardTitle>
          <CardDescription className="text-center">بها بيانات تقييم</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            {summary.withCriteria}
          </CardTitle>
          <CardDescription className="text-center">بها معايير تقييم</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center">
            {Object.keys(summary.byLevel).length}
          </CardTitle>
          <CardDescription className="text-center">مستويات</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
