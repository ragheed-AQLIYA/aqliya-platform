"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSpreadsheet,
  GitCompareArrows,
  ShieldCheck,
  FileText,
  StickyNote,
  FolderOpen,
  SearchCheck,
  ListChecks,
  Eye,
  CheckCircle2,
  FileOutput,
  Download,
  History,
  Rocket,
  Lock,
} from "lucide-react";
import type { WorkflowContext } from "@/lib/audit/workflow-gating";
import { evaluateAllTabGates } from "@/lib/audit/workflow-gating";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TabCount {
  key: string;
  count?: number;
}

interface EngagementTabsProps {
  engagementId: string;
  basePath?: string;
  counts?: TabCount[];
  workflowContext?: WorkflowContext;
  className?: string;
}

const tabDefs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "trial-balance", label: "ميزان المراجعة", icon: FileSpreadsheet },
  { key: "mapping", label: "Mapping", icon: GitCompareArrows },
  { key: "validation", label: "Validation", icon: ShieldCheck },
  { key: "statements", label: "Statements", icon: FileText },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "evidence", label: "Evidence", icon: FolderOpen },
  { key: "findings", label: "Findings", icon: SearchCheck },
  { key: "recommendations", label: "Recommendations", icon: ListChecks },
  { key: "review", label: "المراجعات", icon: Eye },
  { key: "approval", label: "Approval", icon: CheckCircle2 },
  { key: "publication", label: "Publication", icon: FileOutput },
  { key: "exports", label: "التصدير", icon: Download },
  { key: "audit-trail", label: "سجل التدقيق", icon: History },
  { key: "pilot", label: "Pilot", icon: Rocket },
];

function EngagementTabs({
  engagementId,
  basePath,
  counts = [],
  workflowContext,
  className,
}: EngagementTabsProps) {
  const pathname = usePathname();
  const base = basePath ?? `/audit/engagements/${engagementId}`;

  const countMap = new Map<string, number>();
  counts.forEach((c) => countMap.set(c.key, c.count ?? 0));

  const tabGates = workflowContext
    ? evaluateAllTabGates(workflowContext)
    : null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("w-full overflow-x-auto", className)}>
        <div className="flex gap-0.5 min-w-max border-b">
          {tabDefs.map((tab) => {
            const gate = tabGates ? tabGates[tab.key] : null;
            const locked = gate?.locked ?? false;
            const reason = gate?.reason;

            const href = tab.key === "overview" ? base : `${base}/${tab.key}`;
            const isActive =
              tab.key === "overview"
                ? pathname === base
                : pathname === href ||
                  pathname?.startsWith(href + "/") ||
                  false;
            const tabCount = countMap.get(tab.key);

            const linkContent = (
              <Link
                key={tab.key}
                href={locked ? "#" : href}
                onClick={locked ? (e) => e.preventDefault() : undefined}
                className={cn(
                  "relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                  locked && "cursor-not-allowed opacity-50",
                  isActive && !locked && "text-primary",
                  !isActive &&
                    !locked &&
                    "text-muted-foreground hover:text-foreground",
                  locked && "text-muted-foreground",
                )}
                aria-disabled={locked}
              >
                {locked ? (
                  <Lock className="h-4 w-4 shrink-0" />
                ) : (
                  <tab.icon className="h-4 w-4 shrink-0" />
                )}
                <span>{tab.label}</span>
                {tabCount !== undefined && tabCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-bold leading-none",
                      isActive &&
                        !locked &&
                        "bg-primary text-primary-foreground",
                      !isActive && "bg-muted text-muted-foreground",
                    )}
                  >
                    {tabCount > 99 ? "99+" : tabCount}
                  </span>
                )}
                {isActive && !locked && (
                  <span className="absolute bottom-0 start-0 end-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );

            if (locked && reason) {
              return (
                <Tooltip key={tab.key}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">
                    <p>{reason}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

export { EngagementTabs, tabDefs };
export type { EngagementTabsProps, TabCount };
