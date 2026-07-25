"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const BUCKETS = [
  { label: "0–25%", color: "bg-red-400", idx: 0 },
  { label: "25–50%", color: "bg-amber-400", idx: 1 },
  { label: "50–75%", color: "bg-blue-400", idx: 2 },
  { label: "75–100%", color: "bg-green-400", idx: 3 },
];

function BucketBars({ buckets }: { buckets: number[] }) {
  const total = Math.max(1, buckets.reduce((a, b) => a + b, 0));
  return (
    <div className="space-y-1.5">
      {BUCKETS.map(({ label, color, idx }) => {
        const count = buckets[idx];
        const pct = (count / total) * 100;
        return (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="w-12 shrink-0 text-muted-foreground">{label}</span>
            <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded ${color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-left font-medium">
              {count} ({Math.round(pct)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ConfidenceDistribution({
  suggestionConfidenceBuckets,
  explanationConfidenceBuckets,
}: {
  suggestionConfidenceBuckets: number[];
  explanationConfidenceBuckets: number[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          توزيع الثقة / Confidence Distribution
        </CardTitle>
        <CardDescription className="text-xs">
          عدد العناصر في كل نطاق ثقة (الاقتراحات والتفسيرات)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              الاقتراحات / Suggestions
            </p>
            <BucketBars buckets={suggestionConfidenceBuckets} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              التفسيرات / Explanations
            </p>
            <BucketBars buckets={explanationConfidenceBuckets} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
