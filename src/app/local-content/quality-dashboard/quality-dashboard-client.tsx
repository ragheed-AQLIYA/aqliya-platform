// ─── LocalContentOS — AI Quality Dashboard Client ───
// Displays AI quality metrics: acceptance rates, confidence, health, risk.

"use client";

import Link from "next/link";
import type { AiQualityMetrics } from "@/actions/localcontent-quality-actions";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Brain,
  ShieldCheck,
  FileText,
} from "lucide-react";

import { MetricCard } from "./components/metric-card";
import { QualityScoreBanner } from "./components/quality-score-banner";
import { ConfidenceDistribution } from "./components/confidence-distribution";
import { AcceptanceTrend } from "./components/acceptance-trend";
import { ExplanationsAndHealth } from "./components/explanations-card";
import { PipelineRunsTable } from "./components/pipeline-runs-table";
import { SummaryFooter } from "./components/summary-footer";

interface Props {
  metrics: AiQualityMetrics;
}

export function QualityDashboardClient({ metrics }: Props) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">جودة الذكاء الاصطناعي</h1>
          <p className="text-sm text-muted-foreground">
            AI Quality Dashboard — مقاييس دقة وجودة مخرجات AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/local-content/review-center">
            <Button variant="outline" size="sm">
              ← مركز المراجعة
            </Button>
          </Link>
          <Link href="/local-content/ai-advisor">
            <Button variant="outline" size="sm">
              ← المستشار الذكي
            </Button>
          </Link>
        </div>
      </div>

      {/* Quality Score Banner */}
      <QualityScoreBanner metrics={metrics} />

      {/* Row 1: Overview metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Suggestions"
          titleAr="الاقتراحات"
          value={metrics.totalSuggestions}
          subtitle={`${metrics.approvedSuggestions} معتمد · ${metrics.rejectedSuggestions} مرفوض · ${metrics.pendingSuggestions} معلق`}
          icon={Brain}
          color="text-purple-600"
        />
        <MetricCard
          title="Acceptance Rate"
          titleAr="معدل القبول"
          value={
            metrics.suggestionAcceptanceRate !== null
              ? `${metrics.suggestionAcceptanceRate}%`
              : "—"
          }
          subtitle={`من ${metrics.approvedSuggestions + metrics.rejectedSuggestions} مقترح`}
          icon={ShieldCheck}
          color={
            metrics.suggestionAcceptanceRate !== null &&
            metrics.suggestionAcceptanceRate >= 70
              ? "text-green-600"
              : "text-amber-600"
          }
        />
        <MetricCard
          title="Avg Confidence"
          titleAr="متوسط الثقة"
          value={
            metrics.avgSuggestionConfidence !== null
              ? `${metrics.avgSuggestionConfidence}%`
              : "—"
          }
          subtitle="للاقتراحات"
          icon={Brain}
          color={
            metrics.avgSuggestionConfidence !== null &&
            metrics.avgSuggestionConfidence >= 70
              ? "text-green-600"
              : "text-amber-600"
          }
        />
        <MetricCard
          title="Pipeline Runs"
          titleAr="تشغيلات pipeline"
          value={metrics.totalReviewRuns}
          subtitle={`${metrics.completedRuns} مكتمل · ${metrics.failedRuns} فشل`}
          icon={CheckCircle2}
          color={metrics.failedRuns === 0 ? "text-green-600" : "text-amber-600"}
        />
      </div>

      {/* Row 2: Confidence Distribution */}
      <ConfidenceDistribution
        suggestionConfidenceBuckets={metrics.suggestionConfidenceBuckets}
        explanationConfidenceBuckets={metrics.explanationConfidenceBuckets}
      />

      {/* Row 3: Time-Series Acceptance Rate */}
      <AcceptanceTrend acceptanceOverTime={metrics.acceptanceOverTime} />

      {/* Row 4: Explanations + Health */}
      <ExplanationsAndHealth metrics={metrics} />

      {/* Row 5: Pipeline Runs */}
      <PipelineRunsTable runs={metrics.recentRuns} />

      {/* Row 6: Summary + Actions */}
      <SummaryFooter metrics={metrics} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/local-content/review-center">
          <Button variant="default" size="sm">
            <CheckCircle2 className="ml-1 h-4 w-4" />
            مراجعة الاقتراحات المعلقة ({metrics.pendingSuggestions})
          </Button>
        </Link>
        <Link href="/local-content/ai-advisor">
          <Button variant="outline" size="sm">
            <Brain className="ml-1 h-4 w-4" />
            المستشار الذكي
          </Button>
        </Link>
        <Link href="/local-content/pilot-readiness">
          <Button variant="outline" size="sm">
            <ShieldCheck className="ml-1 h-4 w-4" />
            الجاهزية التشغيلية
          </Button>
        </Link>
        <Link href="/local-content/workbook">
          <Button variant="outline" size="sm">
            <FileText className="ml-1 h-4 w-4" />
            محرك الدفتر
          </Button>
        </Link>
      </div>
    </div>
  );
}
