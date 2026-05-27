import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Circle, FileText } from "lucide-react";

const statusConfig: Record<
  string,
  { color: string; icon: React.ElementType; labelAr: string }
> = {
  Draft: { color: "neutral", icon: FileText, labelAr: "مسودة" },
  UnderReview: { color: "warning", icon: Clock, labelAr: "تحت المراجعة" },
  Approved: { color: "success", icon: CheckCircle2, labelAr: "معتمد" },
  Archived: { color: "neutral", icon: XCircle, labelAr: "مؤرشف" },
};

const colorClasses: Record<string, string> = {
  error: "text-status-error bg-status-error/10 border-status-error/20",
  warning: "text-status-warning bg-status-warning/10 border-status-warning/20",
  success: "text-status-success bg-status-success/10 border-status-success/20",
  info: "text-aqliya-blue bg-aqliya-blue/10 border-aqliya-blue/20",
  neutral: "text-muted-foreground bg-muted border-border",
};

export function WorkflowStatusBadge({
  status,
  size = "md",
  className,
}: {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const normalized = status?.toLowerCase() ?? "";
  const matchKey = Object.keys(statusConfig).find(
    (k) => k.toLowerCase() === normalized,
  );
  const config = matchKey
    ? statusConfig[matchKey]
    : { color: "neutral", icon: Circle, labelAr: status };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] [&_svg]:size-2.5",
    md: "px-2.5 py-1 text-xs [&_svg]:size-3",
    lg: "px-3 py-1.5 text-sm [&_svg]:size-3.5",
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        colorClasses[config.color],
        sizeClasses[size],
        className,
      )}
    >
      <Icon className="shrink-0" />
      <span>{config.labelAr}</span>
    </span>
  );
}
