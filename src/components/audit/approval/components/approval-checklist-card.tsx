"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApprovalInfo } from "./use-approval-page";

export function ApprovalChecklistCard({
  approvalInfo,
}: {
  approvalInfo: ApprovalInfo;
}) {
  const t = useTranslations("audit.approval");
  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-4" />
          {t("checklist")}
        </CardTitle>
        <CardDescription>
          {t.rich("checklistDesc", {
            strong: (chunks) => <strong>{chunks}</strong>,
            draft: t("statusDraft"),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvalInfo.checklist.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              {t("checklistNotLoaded")}
            </div>
          ) : (
            approvalInfo.checklist.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                {item.passed ? (
                  <CheckCircle className="size-5 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="size-5 text-red-600 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.detail}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    item.passed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {item.passed ? t("passed") : t("blocker")}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
