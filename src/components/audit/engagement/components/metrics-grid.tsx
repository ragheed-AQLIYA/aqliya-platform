"use client";

import type { TrialBalance } from "@/types/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Network,
  FileSearch,
  Scale,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { getApprovalStatusLabel } from "@/lib/audit/workflow-next-action";

const sarFormatter = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface MetricsGridProps {
  tb: TrialBalance | null;
  mappings: { total: number; confirmed: number };
  evidence: { uploaded: number; missing: number };
  findings: { total: number; open: number };
  openReviews: number;
  approvalStatus: { status: string; blockingIssues: string[] };
}

export function MetricsGrid({
  tb,
  mappings,
  evidence,
  findings,
  openReviews,
  approvalStatus,
}: MetricsGridProps) {
  const metrics = [
    {
      label: "ميزان المراجعة",
      icon: FileSpreadsheet,
      content: tb ? (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">إجمالي الديون:</span>
            <span className="font-medium">
              {sarFormatter.format(tb.totalDebits)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">إجمالي الدائنين:</span>
            <span className="font-medium">
              {sarFormatter.format(tb.totalCredits)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-muted-foreground">الفرق:</span>
            <span
              className={`font-medium ${tb.variance !== 0 ? "text-destructive" : "text-emerald-600"}`}
            >
              {sarFormatter.format(tb.variance)}
            </span>
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">غير مستورد</span>
      ),
    },
    {
      label: "تقدم التعيين",
      icon: Network,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {mappings.confirmed}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {mappings.total}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width:
                  mappings.total > 0
                    ? `${(mappings.confirmed / mappings.total) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">حسابات معينة</span>
        </div>
      ),
    },
    {
      label: "الأدلة",
      icon: FileSearch,
      content: (
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-emerald-600">
              {evidence.uploaded}
            </span>
            <span className="text-sm text-muted-foreground">مرفوع</span>
          </div>
          {evidence.missing > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-destructive">
                {evidence.missing}
              </span>
              <span className="text-sm text-muted-foreground">مفقود</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "النتائج",
      icon: Scale,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{findings.total}</div>
          <span className="text-xs text-muted-foreground">
            {findings.open} مفتوحة
          </span>
        </div>
      ),
    },
    {
      label: "حالة المراجعة",
      icon: MessageSquare,
      content: (
        <div className="space-y-1">
          <div className="text-2xl font-bold">{openReviews}</div>
          <span className="text-xs text-muted-foreground">
            {openReviews === 1 ? "تعليق مفتوح" : "تعليقات مفتوحة"}
          </span>
        </div>
      ),
    },
    {
      label: "حالة الاعتماد",
      icon: CheckCircle,
      content: (
        <div className="space-y-1">
          <Badge
            variant={
              approvalStatus.status === "ready"
                ? "default"
                : approvalStatus.status === "blocked"
                  ? "destructive"
                  : "secondary"
            }
          >
            {getApprovalStatusLabel(approvalStatus.status)}
          </Badge>
          {approvalStatus.blockingIssues.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {approvalStatus.blockingIssues.slice(0, 2).map((issue) => (
                <li key={issue} className="text-xs text-destructive">
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <metric.icon className="h-4 w-4 text-muted-foreground" />
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>{metric.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
