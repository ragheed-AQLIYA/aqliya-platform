"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  decisionType: string | null;
  isClientVisible: boolean;
  publishedVersion: number;
}

export function RecommendationHeader({ decisionType, isClientVisible, publishedVersion }: Props) {
  const isTender = decisionType === "TENDER";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-black">التوصية</h2>
        <p className="text-sm text-muted-foreground">
          {isTender
            ? "توصية خاصة بالمناقصة مبنية على التحليل المالي والقدرات والمخاطر"
            : "توصية قرار مبنية على نتائج المحاكاة وتقييم المخاطر"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isClientVisible ? "default" : "outline"}>
          {isClientVisible ? "منشورة" : "مسودة داخلية"}
        </Badge>
        <Badge variant="secondary">v{publishedVersion}</Badge>
      </div>
    </div>
  );
}
