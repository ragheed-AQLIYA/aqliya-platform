"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Activity } from "lucide-react";
import { ScoreBar } from "./score-bar";
import type { AiQualityMetrics } from "@/actions/localcontent-quality-actions";

function ExplanationsSection({ metrics }: { metrics: AiQualityMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          تفسيرات الحسابات / Account Explanations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-blue-600">
              {metrics.totalExplanations}
            </p>
            <p className="text-xs text-muted-foreground">إجمالي</p>
          </div>
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-green-600">
              {metrics.confirmedExplanations}
            </p>
            <p className="text-xs text-muted-foreground">مؤكد</p>
          </div>
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-red-600">
              {metrics.falsePositives}
            </p>
            <p className="text-xs text-muted-foreground">FP</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">معدل FP</span>
            <span className="font-bold">
              {metrics.falsePositiveRate !== null
                ? `${metrics.falsePositiveRate}%`
                : "—"}
            </span>
          </div>
          <ScoreBar
            score={
              metrics.falsePositiveRate !== null
                ? 100 - metrics.falsePositiveRate
                : null
            }
            size="sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">متوسط الثقة</span>
            <span className="font-bold">
              {metrics.avgExplanationConfidence !== null
                ? `${metrics.avgExplanationConfidence}%`
                : "—"}
            </span>
          </div>
          <ScoreBar score={metrics.avgExplanationConfidence} size="sm" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">توزيع المخاطر</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              عالي: {metrics.highRiskCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              متوسط: {metrics.mediumRiskCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              منخفض: {metrics.lowRiskCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatternHealthSection({ metrics }: { metrics: AiQualityMetrics }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-600" />
          صحة الأنماط / Pattern Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-green-600">
              {metrics.highPerformingRecords}
            </p>
            <p className="text-xs text-muted-foreground">عالية الأداء</p>
          </div>
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-blue-600">
              {metrics.activeRecords}
            </p>
            <p className="text-xs text-muted-foreground">نشطة</p>
          </div>
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-amber-600">
              {metrics.decayingRecords}
            </p>
            <p className="text-xs text-muted-foreground">متدهورة</p>
          </div>
          <div className="text-center p-2 border rounded">
            <p className="text-lg font-bold text-red-600">
              {metrics.obsoleteRecords}
            </p>
            <p className="text-xs text-muted-foreground">مهملة</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">متوسط درجة الصحة</span>
            <span className="font-bold">
              {metrics.avgHealthScore !== null
                ? `${metrics.avgHealthScore}%`
                : "—"}
            </span>
          </div>
          <ScoreBar score={metrics.avgHealthScore} size="sm" />
        </div>

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">ذاكرة التنظيم</p>
              <p className="font-bold">{metrics.totalOrgMemoryRecords}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">تجاوزات يدوية</p>
              <p className="font-bold">{metrics.manualOverrides}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">أنماط قطاعية</p>
              <p className="font-bold">{metrics.totalIndustryPatterns}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">متوسط الفعالية</p>
              <p className="font-bold">
                {metrics.avgEffectiveness !== null
                  ? `${metrics.avgEffectiveness}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExplanationsAndHealth({
  metrics,
}: {
  metrics: AiQualityMetrics;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ExplanationsSection metrics={metrics} />
      <PatternHealthSection metrics={metrics} />
    </div>
  );
}
