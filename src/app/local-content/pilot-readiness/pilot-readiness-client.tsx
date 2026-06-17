// ─── LocalContentOS — Pilot Readiness Client (V3.5 Phase 5) ───
// Displays 11 readiness metrics with GREEN/AMBER/RED indicators
// and an overall status badge.

"use client";

import type { PilotReadinessReport, ReadinessLevel } from "@/lib/local-content/pilot-readiness";

interface Props {
  report: PilotReadinessReport;
}

const LEVEL_COLORS: Record<ReadinessLevel, { bg: string; text: string; border: string }> = {
  GREEN: {
    bg: "bg-green-500/10",
    text: "text-green-600",
    border: "border-green-500/30",
  },
  AMBER: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/30",
  },
  RED: {
    bg: "bg-red-500/10",
    text: "text-red-600",
    border: "border-red-500/30",
  },
};

const OVERALL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Pilot Ready": {
    bg: "bg-green-500/10",
    text: "text-green-600",
    border: "border-green-500/30",
  },
  "Pilot Conditional": {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/30",
  },
  "Not Ready": {
    bg: "bg-red-500/10",
    text: "text-red-600",
    border: "border-red-500/30",
  },
};

function StatusBadge({ level }: { level: ReadinessLevel }) {
  const colors = LEVEL_COLORS[level];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
    >
      {level === "GREEN" ? "سليم" : level === "AMBER" ? "بحاجة تحسين" : "غير جاهز"}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  );
}

export function PilotReadinessClient({ report }: Props) {
  const overallColors = OVERALL_COLORS[report.overallStatus] ?? OVERALL_COLORS["Not Ready"];

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">لوحة الجاهزية التشغيلية</h1>
        <p className="text-muted-foreground mt-1">
          Pilot Readiness Dashboard — {report.generatedAt}
        </p>
      </div>

      {/* Overall Status */}
      <div
        className={`rounded-xl border-2 p-6 ${overallColors.bg} ${overallColors.border}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">الجاهزية الإجمالية</p>
            <h2
              className={`text-2xl font-bold mt-1 ${overallColors.text}`}
            >
              {report.overallStatus === "Pilot Ready"
                ? "جاهز للتجربة"
                : report.overallStatus === "Pilot Conditional"
                  ? "جاهز بشروط"
                  : "غير جاهز"}
            </h2>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${overallColors.text}`}
            >
              {report.overallScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              النتيجة الإجمالية
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ScoreBar score={report.overallScore} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.metrics.map((metric) => {
          const colors = LEVEL_COLORS[metric.level];
          return (
            <div
              key={metric.label}
              className={`rounded-lg border p-4 ${colors.border} ${
                metric.level === "RED" ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {metric.labelAr}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {metric.label}
                  </p>
                </div>
                <StatusBadge level={metric.level} />
              </div>
              <div className="mt-3">
                <ScoreBar score={metric.score} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metric.details}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary Row */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span>
            سليم: {report.metrics.filter((m) => m.level === "GREEN").length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>
            بحاجة تحسين: {report.metrics.filter((m) => m.level === "AMBER").length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>
            غير جاهز: {report.metrics.filter((m) => m.level === "RED").length}
          </span>
        </div>
      </div>
    </div>
  );
}
