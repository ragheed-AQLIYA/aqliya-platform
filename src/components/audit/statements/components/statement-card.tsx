"use client";

import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { FinancialStatement, FinancialStatementLine, Engagement } from "@/types/audit";
import { StatementLine } from "./statement-line";

interface StatementCardProps {
  statement: FinancialStatement;
  engagement: Engagement | null;
  fsV2Enabled: boolean;
  fsActionLoading: boolean;
  sar: (v: number | null | undefined) => string;
  t: (key: string) => string;
  onLineClick: (statement: FinancialStatement, line: FinancialStatementLine) => void;
  onTransitionStatus: (statementId: string) => void;
}

export function StatementCard({
  statement,
  engagement,
  fsV2Enabled,
  fsActionLoading,
  sar,
  t,
  onLineClick,
  onTransitionStatus,
}: StatementCardProps) {
  const statusLabel =
    statement.status === "draft"
      ? "مسودة"
      : statement.status === "reviewed"
        ? "تمت المراجعة"
        : statement.status === "approved"
          ? "معتمد"
          : statement.status;

  const statusColor =
    statement.status === "draft"
      ? "bg-amber-100 text-amber-700"
      : statement.status === "reviewed"
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{statement.title}</CardTitle>
            <CardDescription>
              {engagement?.client?.name} - {t("asAt")}{" "}
              {engagement?.fiscalPeriod}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(statement.reviewComments?.length ?? 0) > 0 && (
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-700 flex items-center gap-1"
              >
                <MessageSquare className="size-3" />
                {statement.reviewComments?.length ?? 0} {t("comments")}
              </Badge>
            )}
            <Badge variant="outline" className={statusColor}>
              {statusLabel}
            </Badge>
            {fsV2Enabled && statement.status === "draft" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={fsActionLoading}
                onClick={() => onTransitionStatus(statement.id)}
              >
                وضع «تمت المراجعة»
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-sm space-y-0.5">
          {(statement.lines ?? []).map((line) => (
            <StatementLine
              key={line.id}
              line={line}
              sar={sar}
              onClick={() => onLineClick(statement, line)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
