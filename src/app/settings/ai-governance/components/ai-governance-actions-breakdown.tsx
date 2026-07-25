"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch } from "lucide-react";

interface Props {
  stats: AiGovernanceStats;
}

export function AiGovernanceActionsBreakdown({ stats }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-blue-600" />
          توزيع الإجراءات / Action Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.lcActionsBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد إجراءات بعد</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {stats.lcActionsBreakdown.map(({ action, count }) => (
              <div key={action} className="flex items-center gap-2 text-sm">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0 max-w-[180px] truncate">
                  {action}
                </code>
                <div className="flex-1 h-3 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded bg-blue-500 transition-all"
                    style={{
                      width: `${(count / stats.lcActionsBreakdown[0].count) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-medium text-xs w-8 text-left">{count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
