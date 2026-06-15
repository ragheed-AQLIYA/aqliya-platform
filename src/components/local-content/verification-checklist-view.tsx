"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { VerificationChecklistReport } from "@/lib/local-content/verification-checklist";
import { updateLocalContentVerificationItemAction } from "@/actions/localcontent-actions";
import { ExternalLink, ClipboardCheck } from "lucide-react";

const SCALE_OPTIONS = [
  { value: "Pending", label: "قيد التحقق" },
  { value: "Verified", label: "مكتمل" },
  { value: "Partial", label: "جزئي" },
  { value: "N/A", label: "لا ينطبق" },
];

function scaleVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.toLowerCase();
  if (s === "verified" || s === "complete" || s === "مكتمل") return "default";
  if (s === "partial" || s === "جزئي") return "secondary";
  if (s === "n/a") return "outline";
  return "destructive";
}

export function VerificationChecklistView({
  projectId,
  report,
  tbSignals,
}: {
  projectId: string;
  report: VerificationChecklistReport;
  tbSignals: {
    engagementId: string;
    signalCount: number;
    totalAmount: number;
    estimatedLocalContentPct: number;
    byCategory: Record<string, { count: number; amount: number }>;
    mappingUrl: string;
  } | null;
}) {
  const [pending, startTransition] = useTransition();

  const sections = Object.entries(report.bySection);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          قائمة التحقق — المحتوى المحلي
        </h1>
        <Badge variant="secondary">
          {report.completedCount}/{report.itemCount} مكتمل
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        مصدر المصفوفة: {report.source} (v{report.version}). التحديث يتطلب
        مراجعة بشرية — لا اعتماد آلي.
      </p>

      {tbSignals ? (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              إشارات ميزان المراجعة (AuditOS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">الارتباط:</span>{" "}
              {tbSignals.engagementId}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Stat
                label="حسابات LC"
                value={String(tbSignals.signalCount)}
              />
              <Stat
                label="إجمالي المبالغ"
                value={`${(tbSignals.totalAmount / 1_000_000).toFixed(1)}M SAR`}
              />
              <Stat
                label="تقدير محلي (افتراضي)"
                value={`${tbSignals.estimatedLocalContentPct}%`}
              />
            </div>
            <Link
              href={tbSignals.mappingUrl}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              فتح تصنيف الحسابات
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-4">
        {sections.map(([key, sec]) => (
          <Card key={key}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{sec.labelAr}</p>
              <p className="text-lg font-bold">
                {sec.completed}/{sec.total}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections.map(([sectionKey, sec]) => {
        const sectionItems = report.items.filter((i) => i.section === sectionKey);
        return (
          <Card key={sectionKey}>
            <CardHeader>
              <CardTitle className="text-base">{sec.labelAr}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionItems.map((item) => (
                <form
                  key={item.id}
                  className="rounded-md border p-3 space-y-2"
                  action={(formData) => {
                    startTransition(async () => {
                      await updateLocalContentVerificationItemAction(
                        projectId,
                        item.id,
                        formData,
                      );
                    });
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {item.id} — {item.criteria}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.action}
                      </p>
                      {item.document ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          مستند: {item.document}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant={scaleVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">
                        الحالة
                      </label>
                      <select
                        name="scale"
                        defaultValue={item.status}
                        className="h-8 w-36 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {SCALE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 flex-1 min-w-[140px]">
                      <label className="text-[10px] text-muted-foreground">
                        مرجع ورقة العمل
                      </label>
                      <Input
                        name="workingPaperRef"
                        defaultValue={item.workingPaperRefResolved}
                        className="h-8"
                        placeholder="WP-..."
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                    >
                      حفظ
                    </Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-background px-2 py-1 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
