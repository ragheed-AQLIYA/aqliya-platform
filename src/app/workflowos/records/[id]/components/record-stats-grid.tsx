"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecordWithTemplate, SlaInfo } from "./types";

interface Props {
  record: RecordWithTemplate;
  slaInfo: SlaInfo;
}

const SLA_LABELS: Record<string, string> = {
  on_track: "ضمن المدة",
  approaching: "يقترب من الموعد",
  overdue: "متأخر",
  breached: "تجاوز المدة",
};

const SLA_COLORS: Record<string, string> = {
  on_track: "text-green-600",
  approaching: "text-amber-600",
  overdue: "text-orange-600",
  breached: "text-red-600",
};

export function RecordStatsGrid({ record, slaInfo }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">التقدم</CardTitle></CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{record.currentStep}/{Array.isArray(record.steps) ? (record.steps as unknown[]).length : 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">الأولوية</CardTitle></CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{record.priority}</p>
        </CardContent>
      </Card>
      {record.assignedToId && (
        <Card>
          <CardHeader><CardTitle className="text-sm">مسند إلى</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-medium truncate">{record.assignedToId}</p>
          </CardContent>
        </Card>
      )}
      {record.dueDate && (
        <Card>
          <CardHeader><CardTitle className="text-sm">تاريخ الاستحقاق</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {new Date(record.dueDate).toLocaleDateString("ar-SA")}
            </p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-sm">مؤشر SLA</CardTitle></CardHeader>
        <CardContent>
          {slaInfo ? (
            <div>
              <p className={`text-lg font-bold ${SLA_COLORS[slaInfo.status] ?? ""}`}>
                {SLA_LABELS[slaInfo.status] ?? slaInfo.status}
              </p>
              {slaInfo.remainingMinutes !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {slaInfo.remainingMinutes > 0
                    ? `${Math.round(slaInfo.remainingMinutes)} دقيقة متبقية`
                    : "انتهت المدة"}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{slaInfo.stepLabel}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">غير محدد</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
