"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./stat-card";

interface Props {
  stats: AiGovernanceStats;
}

export function AiGovernanceOverview({ stats }: Props) {
  const successRate =
    stats.lcTotalEvents > 0
      ? `${Math.round((stats.lcSuccessCount / stats.lcTotalEvents) * 100)}%`
      : "—";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        title="Total AI Actions"
        titleAr="إجمالي إجراءات AI"
        value={stats.totalAiActions}
        subtitle="عبر جميع المنتجات"
        icon={Activity}
        color="text-blue-600"
      />
      <StatCard
        title="Success Rate"
        titleAr="معدل النجاح"
        value={successRate}
        subtitle={`${stats.lcSuccessCount} نجاح · ${stats.lcFailedCount} فشل`}
        icon={TrendingUp}
        color={stats.lcFailedCount === 0 ? "text-green-600" : "text-amber-600"}
      />
      <StatCard
        title="Avg Confidence"
        titleAr="متوسط الثقة"
        value={stats.lcAvgConfidence !== null ? `${stats.lcAvgConfidence}%` : "—"}
        subtitle="لمخرجات LocalContentOS"
        icon={BarChart3}
        color={
          stats.lcAvgConfidence !== null && stats.lcAvgConfidence >= 70
            ? "text-green-600"
            : "text-amber-600"
        }
      />
      <StatCard
        title="Total Warnings"
        titleAr="إجمالي التحذيرات"
        value={stats.totalWarnings}
        subtitle={`من ${stats.lcTotalEvents} حدث`}
        icon={AlertTriangle}
        color={stats.totalWarnings === 0 ? "text-green-600" : "text-amber-600"}
      />
    </div>
  );
}
