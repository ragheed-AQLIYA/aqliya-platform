"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  generateLeadSchedulesAction,
  getLeadScheduleRollforwardAction,
  isLeadScheduleAutoEnabledAction,
  listLeadSchedulesAction,
  validateLeadSchedulesAction,
} from "@/actions/audit-lead-schedule-actions";
import { WorkflowGuard } from "@/components/audit/layout/workflow-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  LeadScheduleListItem,
  LeadScheduleValidationResult,
  PriorYearRollforwardReport,
} from "@/lib/audit/lead-schedule/types";

export default function LeadSchedulesPage() {
  const params = useParams();
  const engagementId = params.engagementId as string;

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [schedules, setSchedules] = useState<LeadScheduleListItem[]>([]);
  const [validation, setValidation] =
    useState<LeadScheduleValidationResult | null>(null);
  const [rollforward, setRollforward] =
    useState<PriorYearRollforwardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [flagOn, list, val, roll] = await Promise.all([
        isLeadScheduleAutoEnabledAction(),
        listLeadSchedulesAction(engagementId),
        validateLeadSchedulesAction(engagementId),
        getLeadScheduleRollforwardAction(engagementId),
      ]);
      setEnabled(flagOn);
      setSchedules(list);
      setValidation(val);
      setRollforward(roll);
    } finally {
      setLoading(false);
    }
  }, [engagementId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateLeadSchedulesAction(engagementId);
      await load();
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <WorkflowGuard engagementId={engagementId} tabKey="lead-schedules">
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="size-4 text-primary" />
                  قوائم الربط (Lead Schedules)
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  تُولَّد من التعيينات المؤكدة — مجموعة لكل فئة (أصول، خصوم،
                  إيرادات…)
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="size-3 me-1 animate-spin" />
                ) : (
                  <RefreshCw className="size-3 me-1" />
                )}
                توليد / إعادة توليد
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {enabled === false && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                التوليد التلقائي معطّل. فعّل{" "}
                <code className="text-[10px]">FF_AUDIT_LEAD_SCHEDULE_AUTO=true</code>{" "}
                للتوليد بعد تأكيد التعيين، أو استخدم الزر أعلاه يدوياً.
              </p>
            )}

            {validation && (
              <div className="flex flex-wrap items-center gap-2">
                {validation.passed ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="size-3 me-1" />
                    التحقق OK
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="size-3 me-1" />
                    {validation.issueCount} مشكلة
                  </Badge>
                )}
              </div>
            )}

            {validation && validation.issues.length > 0 && (
              <ul className="text-xs space-y-1 border rounded-md p-3 bg-muted/30">
                {validation.issues.map((issue, i) => (
                  <li key={`${issue.code}-${i}`}>
                    <span className="font-mono">{issue.code}</span> —{" "}
                    {issue.messageAr}
                  </li>
                ))}
              </ul>
            )}

            {schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                لا توجد قوائم ربط بعد. أكّد التعيينات ثم اضغط توليد.
              </p>
            ) : (
              <div className="space-y-2">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{s.paperTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.paperNumber} · {s.lineCount} بند
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-mono text-xs">
                        {(s.currentYearBalance ?? 0).toLocaleString("ar-SA")}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {s.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {rollforward && rollforward.rows.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rollforward (PY vs CY)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              {rollforward.rows.map((row) => (
                <div
                  key={row.paperNumber}
                  className="flex justify-between border-b py-1 last:border-0"
                >
                  <span>{row.category}</span>
                  <span className="font-mono">
                    {row.priorYear.toLocaleString("ar-SA")} →{" "}
                    {row.currentYear.toLocaleString("ar-SA")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </WorkflowGuard>
  );
}
