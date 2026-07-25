"use client";

import type { AiGovernanceStats } from "@/actions/ai-governance-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, GitBranch } from "lucide-react";
import Link from "next/link";

interface ModelStats {
  total: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  byProvider: Record<string, number>;
  pendingReview: number;
  pendingApproval: number;
  activeDeployments: number;
}

interface Props {
  stats: AiGovernanceStats;
  modelStats: ModelStats | null;
}

export function AiGovernanceModelsSection({ stats, modelStats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            النماذج والمزودون / Models & Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">عدد النماذج الفريدة</span>
              <span className="font-medium">{stats.totalAiModels}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المزودون</span>
              <span className="font-medium">
                {stats.uniqueProviders.length > 0
                  ? stats.uniqueProviders.join("، ")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">متوسط المدة</span>
              <span className="font-medium">
                {stats.lcAvgDurationMs !== null
                  ? `${(stats.lcAvgDurationMs / 1000).toFixed(1)}s`
                  : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-600" />
            سجل النماذج / Model Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!modelStats ? (
            <p className="text-sm text-muted-foreground">جاري تحميل بيانات سجل النماذج...</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي النماذج المسجلة</span>
                <span className="font-medium">{modelStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">نشر نشط</span>
                <span className="font-medium">{modelStats.activeDeployments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">قيد المراجعة</span>
                <span className="font-medium">{modelStats.pendingReview}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">معتمد</span>
                <span className="font-medium">{modelStats.byStatus["APPROVED"] ?? 0}</span>
              </div>
              {modelStats.byProvider && Object.keys(modelStats.byProvider).length > 0 && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1">المزودون:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(modelStats.byProvider).map(([p, c]) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {p}: {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Link href="/settings/models">
                  <Button variant="outline" size="sm">
                    ← إدارة سجل النماذج
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
