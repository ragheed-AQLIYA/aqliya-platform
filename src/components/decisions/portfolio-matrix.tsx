import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

export type PortfolioDecisionItem = {
  id: string;
  title: string;
  status: string;
  type: string;
  priority: string | null;
  urgency?: string | null;
  impact?: string | null;
};

type QuadrantDecisions = {
  highUrgencyHighImpact: PortfolioDecisionItem[];
  highUrgencyLowImpact: PortfolioDecisionItem[];
  lowUrgencyHighImpact: PortfolioDecisionItem[];
  lowUrgencyLowImpact: PortfolioDecisionItem[];
};

function getStatusVariant(status: string) {
  switch (status) {
    case "APPROVED": return "default";
    case "DRAFT": return "secondary";
    case "REJECTED": return "destructive";
    default: return "outline";
  }
}

function getUrgencyLabel(priority: string | null) {
  if (!priority) return "LOW";
  if (priority === "CRITICAL" || priority === "HIGH") return "HIGH";
  return "LOW";
}

function getImpactLabel(type: string) {
  const highImpactTypes = new Set(["STRATEGIC", "INVESTMENT", "PARTNERSHIP", "TENDER"]);
  return highImpactTypes.has(type) ? "HIGH" : "LOW";
}

function classifyDecisions(decisions: PortfolioDecisionItem[]): QuadrantDecisions {
  const quads: QuadrantDecisions = {
    highUrgencyHighImpact: [],
    highUrgencyLowImpact: [],
    lowUrgencyHighImpact: [],
    lowUrgencyLowImpact: [],
  };

  for (const d of decisions) {
    const urgency = getUrgencyLabel(d.priority);
    const impact = getImpactLabel(d.type);
    if (urgency === "HIGH" && impact === "HIGH") {
      quads.highUrgencyHighImpact.push(d);
    } else if (urgency === "HIGH" && impact === "LOW") {
      quads.highUrgencyLowImpact.push(d);
    } else if (urgency === "LOW" && impact === "HIGH") {
      quads.lowUrgencyHighImpact.push(d);
    } else {
      quads.lowUrgencyLowImpact.push(d);
    }
  }

  return quads;
}

function QuadrantCard({
  title,
  description,
  decisions,
  borderClass,
  bgClass,
}: {
  title: string;
  description: string;
  decisions: PortfolioDecisionItem[];
  borderClass: string;
  bgClass: string;
}) {
  return (
    <EnterpriseCard className={`border-t-2 ${borderClass} ${bgClass}`}>
      <EnterpriseCardHeader>
        <EnterpriseCardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs">
            {decisions.length}
          </Badge>
        </EnterpriseCardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-1">
        {decisions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">لا توجد قرارات</p>
        ) : (
          decisions.slice(0, 6).map((d) => (
            <Link
              key={d.id}
              href={`/decisions/${d.id}`}
              className="flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted/50"
            >
              <span className="truncate max-w-[180px]">{d.title}</span>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={getStatusVariant(d.status)} className="text-[10px]">
                  {d.status}
                </Badge>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </Link>
          ))
        )}
        {decisions.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{decisions.length - 6} أخرى
          </p>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}

export function DecisionPortfolioMatrix({
  decisions,
}: {
  decisions: PortfolioDecisionItem[];
}) {
  if (decisions.length === 0) {
    return (
      <EnterpriseCard>
        <EnterpriseCardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              لا توجد قرارات لبناء مصفوفة المحفظة.
            </p>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    );
  }

  const quads = classifyDecisions(decisions);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">مصفوفة المحفظة:</span>
        <span>المحور الرأسي: الإلحاح (عالي/منخفض)</span>
        <span>المحور الأفقي: الأثر (عالي/منخفض)</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* High Urgency / High Impact — top-left */}
        <QuadrantCard
          title="إلحاح عالي · أثر عالي"
          description="حرجة — تتطلب اهتماماً فورياً"
          decisions={quads.highUrgencyHighImpact}
          borderClass="border-t-red-500"
          bgClass="bg-red-50/20 dark:bg-red-950/10"
        />

        {/* High Urgency / Low Impact — top-right */}
        <QuadrantCard
          title="إلحاح عالي · أثر منخفض"
          description="طوارئ تشغيلية"
          decisions={quads.highUrgencyLowImpact}
          borderClass="border-t-amber-500"
          bgClass="bg-amber-50/20 dark:bg-amber-950/10"
        />

        {/* Low Urgency / High Impact — bottom-left */}
        <QuadrantCard
          title="إلحاح منخفض · أثر عالي"
          description="استراتيجي — تخطيط طويل المدى"
          decisions={quads.lowUrgencyHighImpact}
          borderClass="border-t-blue-500"
          bgClass="bg-blue-50/20 dark:bg-blue-950/10"
        />

        {/* Low Urgency / Low Impact — bottom-right */}
        <QuadrantCard
          title="إلحاح منخفض · أثر منخفض"
          description="روتيني — جدول زمني مرن"
          decisions={quads.lowUrgencyLowImpact}
          borderClass="border-t-green-500"
          bgClass="bg-green-50/20 dark:bg-green-950/10"
        />
      </div>
    </div>
  );
}
