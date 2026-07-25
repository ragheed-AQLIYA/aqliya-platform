"use client";

import { useTranslations } from "next-intl";
import { History, Share2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actionIcons } from "./use-approval-page";
import type { ApprovalRecord } from "@/types/audit";

export function ApprovalHistoryCard({
  records,
  onTraceOpen,
}: {
  records: ApprovalRecord[];
  onTraceOpen: (rec: ApprovalRecord) => void;
}) {
  const t = useTranslations("audit.approval");
  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          {t("approvalHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            {t("noRecords")}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute right-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {records.map((rec) => (
                <div key={rec.id} className="relative pr-10">
                  <div className="absolute right-2.5 top-1 bg-background p-0.5">
                    {actionIcons[rec.action]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {rec.approverName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {rec.approverRole}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rec.action.replace(/_/g, " ")} {t("on")}{" "}
                      {rec.targetType === "engagement"
                        ? t("engagement")
                        : rec.targetType}
                    </div>
                    {rec.rationale && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        &ldquo;{rec.rationale}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-muted-foreground">
                        {new Date(rec.createdAt).toLocaleDateString("ar-SA", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onTraceOpen(rec)}
                      >
                        <Share2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
