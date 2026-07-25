"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface TimePoint {
  label: string;
  total: number;
  approved: number;
  rate: number | null;
}

export function AcceptanceTrend({
  acceptanceOverTime,
}: {
  acceptanceOverTime: TimePoint[];
}) {
  const maxTotal = Math.max(...acceptanceOverTime.map((x) => x.total));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          اتجاه معدل القبول / Acceptance Rate Trend
        </CardTitle>
        <CardDescription className="text-xs">
          أسبوعي — عدد المقترحات المعتمدة مقابل الإجمالي
        </CardDescription>
      </CardHeader>
      <CardContent>
        {acceptanceOverTime.every((p) => p.total === 0) ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            لا توجد بيانات كافية لرسم الاتجاه
          </div>
        ) : (
          <div className="flex items-end justify-around gap-3 pt-2">
            {acceptanceOverTime.map((p, i) => {
              const barH =
                p.total > 0 ? Math.max(4, (p.total / maxTotal) * 100) : 4;
              const filledH = p.total > 0 ? (p.approved / p.total) * barH : 0;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <p className="text-[10px] font-medium">
                    {p.rate !== null ? `${p.rate}%` : "—"}
                  </p>
                  <div className="w-full flex justify-center">
                    <div
                      className="w-6 sm:w-8 rounded-t relative"
                      style={{ height: `${Math.max(4, barH)}px` }}
                    >
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-blue-500 transition-all duration-500"
                        style={{ height: `${Math.max(0, filledH)}px` }}
                      />
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-gray-200"
                        style={{
                          height: `${Math.max(0, barH)}px`,
                          zIndex: -1,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>
                      {p.approved}/{p.total}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">{p.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
