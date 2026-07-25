"use client";

import { Loader2, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RecommendationTableRow } from "./recommendation-table-row";
import type { Recommendation } from "@/types/audit";

interface Props {
  sorted: Recommendation[];
  expandedId: string | null;
  recHasMore: boolean;
  loadingRecMore: boolean;
  recTotal: number;
  recommendationsLength: number;
  t: (key: string, values?: Record<string, string | number | Date> | undefined) => string;
  onToggleExpand: (id: string) => void;
  onTraceability: (rec: Recommendation) => void;
  onAcceptStatus: (rec: Recommendation) => void;
  onRejectStatus: (rec: Recommendation) => void;
  onLoadMore: () => void;
}

export function RecommendationsTable({
  sorted,
  expandedId,
  recHasMore,
  loadingRecMore,
  recTotal,
  recommendationsLength,
  t,
  onToggleExpand,
  onTraceability,
  onAcceptStatus,
  onRejectStatus,
  onLoadMore,
}: Props) {
  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-[24px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("titleCol")}</TableHead>
                <TableHead>{t("linkedFinding")}</TableHead>
                <TableHead>{t("riskLevel")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("ai")}</TableHead>
                <TableHead>{t("created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((rec) => (
                <RecommendationTableRow
                  key={rec.id}
                  rec={rec}
                  expanded={expandedId === rec.id}
                  t={t}
                  onToggle={() => onToggleExpand(rec.id)}
                  onTraceability={() => onTraceability(rec)}
                  onAcceptStatus={() => onAcceptStatus(rec)}
                  onRejectStatus={() => onRejectStatus(rec)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {recHasMore && (
        <div className="flex justify-center border-t py-3">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingRecMore}
            onClick={onLoadMore}
          >
            {loadingRecMore ? (
              <Loader2 className="me-1 size-4 animate-spin" />
            ) : (
              <RefreshCw className="me-1 size-4" />
            )}
            {t("loadMore", { remaining: recTotal - recommendationsLength })}
          </Button>
        </div>
      )}
    </Card>
  );
}
