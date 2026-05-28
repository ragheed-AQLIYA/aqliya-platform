import Link from "next/link";
import { Building2, Users, AlertCircle, ArrowLeft } from "lucide-react";
import { AuditEngagementStatusBadge } from "@/components/audit/engagement/audit-engagement-status-badge";
import type { NextWorkflowAction } from "@/lib/audit/workflow-next-action";

function daysSince(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86400000,
  );
  if (diff === 0) return "اليوم";
  if (diff === 1) return "منذ يوم";
  return `منذ ${diff} أيام`;
}

interface EngagementListItemProps {
  engagement: {
    id: string;
    status: string;
    fiscalPeriod: string;
    updatedAt: string;
    team: { length: number };
    alerts?: { length: number } | null;
    client?: { name?: string | null } | null;
  };
  nextAction: NextWorkflowAction | null;
  blockingIssues?: readonly string[];
  projectName?: string | null;
  workspaceName?: string | null;
}

export function EngagementListItem({
  engagement,
  nextAction,
  blockingIssues = [],
  projectName,
  workspaceName,
}: EngagementListItemProps) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50 first:pt-4 last:pb-4">
      <Link
        href={`/audit/engagements/${engagement.id}`}
        className="flex min-w-0 flex-1 flex-col gap-1.5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {engagement.client?.name || "غير معروف"}
          </span>
          <AuditEngagementStatusBadge
            engagementStatus={engagement.status}
            blockingIssues={blockingIssues}
          />
          {projectName && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
              <Building2 className="h-2.5 w-2.5" />
              {projectName}
            </span>
          )}
          {workspaceName && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
              {workspaceName}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{engagement.fiscalPeriod}</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {engagement.team.length} فريق
          </span>
          {engagement.alerts && engagement.alerts.length > 0 && (
            <span className="text-status-warning flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {engagement.alerts.length} تنبيه
            </span>
          )}
        </div>
        {nextAction?.reason && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {nextAction.reason}
          </p>
        )}
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-xs text-muted-foreground">
          {daysSince(engagement.updatedAt)}
        </span>
        {nextAction && (
          <Link
            href={nextAction.href}
            className={
              nextAction.urgent
                ? "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-destructive transition-colors hover:bg-destructive/10"
                : "inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-primary transition-colors hover:bg-primary/10"
            }
          >
            {nextAction.label}
            <ArrowLeft className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
