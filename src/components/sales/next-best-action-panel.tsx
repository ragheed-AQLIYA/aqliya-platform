import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import type { SalesNextBestActionItem } from "@/lib/sales/types";

const PRIORITY_VARIANT: Record<
  SalesNextBestActionItem["priority"],
  "destructive" | "default" | "secondary"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const NBA_DISCLAIMER_AR =
  "مسودة توصيات — ليست قرارات. المراجع البشري يختار الإجراء المناسب؛ الأدلة تحكم.";

const NBA_DISCLAIMER_COMPACT_AR =
  "مسودة توصيات — ليست قرارات.";

export function NextBestActionPanel({
  actions,
  title = "إجراءات مقترحة",
  compact = false,
  disclaimerAr = compact ? NBA_DISCLAIMER_COMPACT_AR : NBA_DISCLAIMER_AR,
}: {
  actions: SalesNextBestActionItem[];
  title?: string;
  compact?: boolean;
  disclaimerAr?: string;
}) {
  if (actions.length === 0) return null;

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader className={compact ? "pb-2" : undefined}>
        <EnterpriseCardTitle className={compact ? "text-sm" : "text-base"}>
          {title}
        </EnterpriseCardTitle>
        <p
          className={
            compact
              ? "mt-1 text-[11px] text-muted-foreground"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {disclaimerAr}
        </p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li
              key={action.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={action.href}
                  className="font-medium text-primary hover:underline"
                >
                  {action.labelAr}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.reasonAr}
                </p>
              </div>
              <Badge variant={PRIORITY_VARIANT[action.priority]}>
                {action.priority === "high"
                  ? "عاجل"
                  : action.priority === "medium"
                    ? "متوسط"
                    : "منخفض"}
              </Badge>
            </li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
