"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { scoreDealLeadsAction } from "@/actions/sales-intel-actions";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCcw,
  Loader2,
  Flame,
  Thermometer,
  Snowflake,
  Database,
  DollarSign,
  GitBranch,
  MessageSquare,
} from "lucide-react";

interface DealScore {
  score: number;
  level: "hot" | "warm" | "cold";
  factors: Array<{ name: string; score: number; weight: number }>;
  recommendation: string;
}

const LEVEL_CONFIG = {
  hot: {
    icon: <Flame className="h-5 w-5" />,
    label: "ساخنة 🔥",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    progressColor: "bg-red-500",
  },
  warm: {
    icon: <Thermometer className="h-5 w-5" />,
    label: "دافئة 🌡️",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    progressColor: "bg-amber-500",
  },
  cold: {
    icon: <Snowflake className="h-5 w-5" />,
    label: "باردة ❄️",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    progressColor: "bg-blue-500",
  },
};

const FACTOR_ICONS: Record<string, React.ReactNode> = {
  "بيانات مُثراة": <Database className="h-4 w-4" />,
  "قيمة الصفقة": <DollarSign className="h-4 w-4" />,
  "مرحلة الصفقة": <GitBranch className="h-4 w-4" />,
  "تفاعل التواصل": <MessageSquare className="h-4 w-4" />,
};

export function DealHealthCard({ dealId }: { dealId: string }) {
  const [score, setScore] = useState<DealScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await scoreDealLeadsAction(dealId);
      if (result.success && result.data) {
        setScore(result.data);
      } else {
        setError(result.error ?? "فشل تحليل الصفقة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadScore();
  }, [dealId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">جاري تحليل الصفقة...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">{error}</span>
            <Button variant="ghost" size="sm" onClick={loadScore}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score) return null;

  const config = LEVEL_CONFIG[score.level];

  return (
    <Card className={config.bg}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className={`text-base ${config.color}`}>
              {config.label}
            </CardTitle>
            <Badge variant="outline" className="text-sm font-bold">
              {score.score}/100
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={loadScore}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <Progress
          value={score.score}
          className={`h-3 ${score.score >= 70 ? "[&>div]:bg-red-500" : score.score >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-500"}`}
        />

        {/* Factors */}
        <div className="space-y-2">
          {score.factors.map((f) => (
            <div key={f.name} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-5">
                {FACTOR_ICONS[f.name] ?? <Minus className="h-4 w-4" />}
              </span>
              <span className="flex-1">{f.name}</span>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      f.score >= 70 ? "bg-green-500" : f.score >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-8 text-right">
                  {Math.round(f.score * f.weight)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="p-2 rounded bg-background/50 text-sm">
          {score.recommendation}
        </div>
      </CardContent>
    </Card>
  );
}
