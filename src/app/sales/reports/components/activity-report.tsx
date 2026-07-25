"use client";

import type { ActivityReport as ActivityReportData } from "@/actions/sales-report-actions";
import { ReportCard } from "./report-card";
import { Activity, Users, PieChart, TrendingUp } from "lucide-react";

interface ActivityReportProps {
  data: ActivityReportData;
  activityType: string;
  onTypeChange: (type: string) => void;
}

const typeLabels: Record<string, string> = {
  call: "مكالمة",
  meeting: "اجتماع",
  email: "بريد إلكتروني",
  note: "ملاحظة",
  demo: "عرض توضيحي",
  presentation: "عرض تقديمي",
  proposal: "عرض سعر",
  negotiation: "تفاوض",
  follow_up: "متابعة",
  other: "أخرى",
};

export function ActivityReport({
  data,
  activityType,
  onTypeChange,
}: ActivityReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <ReportCard
          label="إجمالي النشاطات"
          value={data.total}
          icon={<Activity className="h-5 w-5" />}
        />
        <ReportCard
          label="أنواع النشاط"
          value={data.byType.length}
          icon={<PieChart className="h-5 w-5" />}
        />
        <ReportCard
          label="المستخدمون النشطون"
          value={data.byUser.length}
          icon={<Users className="h-5 w-5" />}
        />
        <ReportCard
          label="معدل التحويل"
          value={`${data.conversionRate}%`}
          subtitle="نشاطات لكل صفقة"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">تصفية حسب النوع:</label>
        <select
          value={activityType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">الكل</option>
          {data.byType.map((t) => (
            <option key={t.type} value={t.type}>
              {typeLabels[t.type] ?? t.type} ({t.count})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3 text-sm font-medium">
            النشاطات حسب النوع
          </div>
          <div className="p-4">
            {data.byType.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد نشاطات</p>
            ) : (
              <div className="space-y-2">
                {data.byType.map((item) => {
                  const pct =
                    data.total > 0
                      ? Math.round((item.count / data.total) * 100)
                      : 0;
                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{typeLabels[item.type] ?? item.type}</span>
                        <span className="font-medium">
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary/60 transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3 text-sm font-medium">
            النشاطات حسب المستخدم
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="px-4 py-2 text-right">المستخدم</th>
                  <th className="px-4 py-2 text-right">العدد</th>
                  <th className="px-4 py-2 text-right">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {data.byUser.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      لا توجد نشاطات
                    </td>
                  </tr>
                ) : (
                  data.byUser.map((user) => {
                    const pct =
                      data.total > 0
                        ? Math.round((user.count / data.total) * 100)
                        : 0;
                    return (
                      <tr
                        key={user.userId}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-2 font-medium">
                          {user.userName}
                        </td>
                        <td className="px-4 py-2">{user.count}</td>
                        <td className="px-4 py-2">{pct}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
