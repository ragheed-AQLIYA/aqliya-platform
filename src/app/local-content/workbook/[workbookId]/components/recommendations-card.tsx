import type { RecommendationResult } from "@/lib/local-content/workbook/recommendation-engine";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainIcon } from "./icons";

interface Props {
  recommendations: RecommendationResult | null;
  isLoading: string | null;
  onGenerate: () => void;
}

function priorityBadge(priority: string) {
  const label =
    priority === "critical"
      ? "حرج"
      : priority === "high"
        ? "عالٍ"
        : priority === "medium"
          ? "متوسط"
          : "منخفض";

  const variant =
    priority === "critical"
      ? "destructive"
      : priority === "high"
        ? "default"
        : "secondary";

  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  );
}

function RecommendationList({
  recommendations,
}: {
  recommendations: RecommendationResult;
}) {
  if (recommendations.recommendations.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        لا توجد توصيات حالياً. أضف المزيد من البيانات للحصول على توصيات.
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {recommendations.recommendations.slice(0, 5).map((rec, idx) => (
        <div key={idx} className="p-2 border rounded text-sm hover:bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-xs">{rec.title}</span>
            <div className="flex items-center gap-1">
              {priorityBadge(rec.priority)}
              <span className="text-xs font-bold">{rec.impactScore}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {rec.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function RecommendationsEmpty({ onGenerate, isLoading }: Props) {
  return (
    <div className="text-center py-4">
      <p className="text-xs text-muted-foreground mb-2">
        لم يتم إنشاء توصيات بعد
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={onGenerate}
        disabled={isLoading === "recommendations"}
      >
        {isLoading === "recommendations" ? "جاري الإنشاء..." : "إنشاء التوصيات"}
      </Button>
    </div>
  );
}

export function RecommendationsCard({
  recommendations,
  isLoading,
  onGenerate,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BrainIcon className="h-4 w-4" />
          توصيات التحسين
        </CardTitle>
        <CardDescription className="text-xs">
          توصيات مبنية على تحليل بيانات الدفتر لتحسين درجة المحتوى المحلي
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              النتيجة الحالية:{" "}
              {recommendations.currentScore !== null
                ? `${recommendations.currentScore}%`
                : "غير متوفرة"}
            </p>
            <RecommendationList recommendations={recommendations} />
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onGenerate}
              disabled={isLoading === "recommendations"}
            >
              {isLoading === "recommendations"
                ? "جاري الإنشاء..."
                : "إنشاء التوصيات"}
            </Button>
          </div>
        ) : (
          <RecommendationsEmpty
            recommendations={null}
            isLoading={isLoading}
            onGenerate={onGenerate}
          />
        )}
      </CardContent>
    </Card>
  );
}
