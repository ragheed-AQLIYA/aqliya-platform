import { cn } from "@/lib/utils";
import {
  getOperatorStatusDisplay,
  type OperatorStatusTone,
} from "@/lib/audit/workflow-next-action";

const toneClasses: Record<OperatorStatusTone, string> = {
  neutral: "text-muted-foreground bg-muted border-border",
  warning:
    "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
  error:
    "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
  success:
    "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  info: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
};

interface AuditEngagementStatusBadgeProps {
  engagementStatus: string;
  blockingIssues?: readonly string[];
  size?: "sm" | "md";
  className?: string;
}

export function AuditEngagementStatusBadge({
  engagementStatus,
  blockingIssues = [],
  size = "sm",
  className,
}: AuditEngagementStatusBadgeProps) {
  const { label, tone } = getOperatorStatusDisplay(
    engagementStatus,
    blockingIssues,
  );

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] leading-none"
          : "px-2.5 py-1 text-xs leading-none",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
