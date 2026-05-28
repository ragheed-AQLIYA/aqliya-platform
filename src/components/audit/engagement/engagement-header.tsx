"use client";

import type { Engagement, WorkflowStatus } from "@/types/audit";
import { AuditEngagementStatusBadge } from "@/components/audit/engagement/audit-engagement-status-badge";

const typeLabels: Record<string, string> = {
  full_audit: "تدقيق كامل",
  review: "مراجعة",
  agreed_upon_procedures: "إجراءات متفق عليها",
};

interface EngagementHeaderProps {
  engagement: Engagement;
  status: WorkflowStatus;
}

export function EngagementHeader({
  engagement,
  status,
}: EngagementHeaderProps) {
  const blockingIssues = status.blockingIssues ?? [];

  return (
    <div
      className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-card p-6 shadow-sm"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">
              {engagement.client?.name || "عميل غير معروف"}
            </h1>
            <AuditEngagementStatusBadge
              engagementStatus={engagement.status}
              blockingIssues={blockingIssues}
              size="md"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              الفترة المالية:{" "}
              <span className="font-medium text-foreground">
                {engagement.fiscalPeriod}
              </span>
            </span>
            <span>
              النوع:{" "}
              <span className="font-medium text-foreground">
                {typeLabels[engagement.engagementType] ||
                  engagement.engagementType}
              </span>
            </span>
            <span>
              الإنجاز:{" "}
              <span className="font-medium text-foreground">
                {status.completionPercentage}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
