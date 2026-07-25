"use client";

import {
  Rocket,
  MessageSquare,
  Bug,
  ListChecks,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusSummaryProps {
  openBlockers: number;
  feedbackCount: number;
  openFeedbacks: number;
  blockerCount: number;
  approvedSignoffs: number;
  totalSignoffItems: number;
  allApproved: boolean;
  readyLabel: string;
  blockersLabel: string;
  productionReadinessLabel: string;
  feedbackItemsLabel: string;
  openLabel: string;
  blockersTitleLabel: string;
  signoffChecklistLabel: string;
}

export function StatusSummary({
  openBlockers,
  feedbackCount,
  openFeedbacks,
  blockerCount,
  approvedSignoffs,
  totalSignoffItems,
  allApproved,
  readyLabel,
  blockersLabel,
  productionReadinessLabel,
  feedbackItemsLabel,
  openLabel,
  blockersTitleLabel,
  signoffChecklistLabel,
}: StatusSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <Card
        className={
          openBlockers === 0 ? "border-emerald-300" : "border-amber-300"
        }
      >
        <CardContent className="p-3 sm:p-4 text-center">
          <Rocket className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
          <div className="text-base sm:text-lg font-bold break-words">
            {openBlockers === 0
              ? readyLabel
              : `${openBlockers} ${blockersLabel}`}
          </div>
          <div className="text-[10px] text-muted-foreground break-words">
            {productionReadinessLabel}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <MessageSquare className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
          <div className="text-base sm:text-lg font-bold">
            {feedbackCount}
          </div>
          <div className="text-[10px] text-muted-foreground break-words">
            {feedbackItemsLabel}{" "}
            {openFeedbacks > 0 ? `(${openFeedbacks} ${openLabel})` : ""}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <Bug className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
          <div className="text-base sm:text-lg font-bold">
            {blockerCount}
          </div>
          <div className="text-[10px] text-muted-foreground break-words">
            {blockersTitleLabel} ({openBlockers} {openLabel})
          </div>
        </CardContent>
      </Card>
      <Card className={allApproved ? "border-emerald-300" : ""}>
        <CardContent className="p-3 sm:p-4 text-center">
          <ListChecks className="size-5 sm:size-6 mx-auto mb-1 text-muted-foreground" />
          <div className="text-base sm:text-lg font-bold">
            {approvedSignoffs}/{totalSignoffItems}
          </div>
          <div className="text-[10px] text-muted-foreground break-words">
            {signoffChecklistLabel}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
