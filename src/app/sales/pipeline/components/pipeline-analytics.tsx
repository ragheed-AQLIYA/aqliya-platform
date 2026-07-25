"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, DollarSign } from "lucide-react";
import type { PipelineAnalyticsData } from "@/actions/sales-analytics-actions";

function formatAmount(amount: number, currency = "SAR"): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
}

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelineAnalytics({ data }: { data: PipelineAnalyticsData }) {
  const { overall, stageAnalytics, conversionRates } = data;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="إجمالي الصفقات"
          value={String(overall.totalDeals)}
          subtitle={`${overall.openDeals} مفتوحة`}
          icon={BarChart3}
        />
        <MetricCard
          title="قيمة المسار"
          value={formatAmount(overall.totalPipelineValue)}
          subtitle={`متوسط ${overall.avgDealSize ? formatAmount(overall.avgDealSize) : "—"}`}
          icon={DollarSign}
        />
        <MetricCard
          title="نسبة الفوز"
          value={overall.winRate != null ? `${overall.winRate}%` : "—"}
          subtitle={`${overall.wonDeals} فوز / ${overall.lostDeals} خسارة`}
          icon={TrendingUp}
        />
        <MetricCard
          title="مدة الدورة"
          value={
            overall.avgWonCycleDays != null
              ? `${overall.avgWonCycleDays} يوم`
              : "—"
          }
          subtitle={
            overall.avgDaysOpen != null
              ? `معدل الفتح ${overall.avgDaysOpen} يوم`
              : undefined
          }
          icon={Clock}
        />
      </div>

      {stageAnalytics.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">تحليل المراحل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">المرحلة</th>
                    <th className="pb-2 font-medium">الصفقات</th>
                    <th className="pb-2 font-medium">القيمة</th>
                    <th className="pb-2 font-medium">المتوسط</th>
                    <th className="pb-2 font-medium">فوز</th>
                    <th className="pb-2 font-medium">خسارة</th>
                    <th className="pb-2 font-medium">نسبة الفوز</th>
                  </tr>
                </thead>
                <tbody>
                  {stageAnalytics.map((s) => (
                    <tr key={s.stageId ?? "unassigned"} className="border-b last:border-0">
                      <td className="py-2 font-medium">{s.stageName}</td>
                      <td className="py-2">{s.dealCount}</td>
                      <td className="py-2">{formatAmount(s.totalValue)}</td>
                      <td className="py-2">
                        {s.avgDealSize != null ? formatAmount(s.avgDealSize) : "—"}
                      </td>
                      <td className="py-2">{s.wonCount}</td>
                      <td className="py-2">{s.lostCount}</td>
                      <td className="py-2">
                        <span
                          className={
                            s.winRate != null && s.winRate >= 50
                              ? "text-status-success font-medium"
                              : s.winRate != null && s.winRate > 0
                                ? "text-status-warning"
                                : ""
                          }
                        >
                          {s.winRate != null ? `${s.winRate}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {conversionRates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">معدلات التحويل بين المراحل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">من</th>
                    <th className="pb-2 font-medium">إلى</th>
                    <th className="pb-2 font-medium">النسبة</th>
                    <th className="pb-2 font-medium">عدد الصفقات</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionRates.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{c.fromStage}</td>
                      <td className="py-2">{c.toStage}</td>
                      <td className="py-2">
                        <span
                          className={
                            c.rate != null && c.rate >= 50
                              ? "text-status-success font-medium"
                              : c.rate != null && c.rate >= 25
                                ? "text-status-warning"
                                : ""
                          }
                        >
                          {c.rate != null ? `${c.rate}%` : "—"}
                        </span>
                      </td>
                      <td className="py-2">
                        {c.fromCount} ← {c.toCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
