"use client";

import { KPICard } from "@/components/enterprise/kpi-card";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import type { SalesDashboardStats } from "../sales-dashboard-client";

function formatPipelineValue(stats: SalesDashboardStats | null): string {
  if (!stats) return "—";
  const total = stats.dealsByStage.reduce((sum, stage) => {
    return (
      sum +
      stage.deals.reduce((s, d) => s + (d.amount ?? 0), 0)
    );
  }, 0);
  if (total === 0) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(total);
}

interface SalesKPIRowProps {
  stats: SalesDashboardStats | null;
}

export function SalesKPIRow({ stats }: SalesKPIRowProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="قيمة المسار المفتوح (تقريبي)"
        value={formatPipelineValue(stats)}
        icon={DollarSign}
        module="sales"
      />
      <KPICard
        label="الصفقات المفتوحة"
        value={stats?.openDealCount ?? "—"}
        icon={Target}
        module="sales"
      />
      <KPICard
        label="إجمالي الصفقات"
        value={stats?.dealCount ?? "—"}
        icon={TrendingUp}
        module="sales"
      />
      <KPICard
        label="الحسابات"
        value={stats?.accountCount ?? "—"}
        icon={Users}
        module="sales"
      />
    </div>
  );
}
