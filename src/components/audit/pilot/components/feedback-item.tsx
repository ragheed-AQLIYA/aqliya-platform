"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PilotFeedback } from "@/types/audit";

export const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_review: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-600",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

interface FeedbackItemProps {
  item: PilotFeedback;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  sourceLabel: string;
  decisionLabel: string;
  ownerLabel: string;
  nextActionLabel: string;
  markInReviewLabel: string;
  acceptLabel: string;
  dismissLabel: string;
  markResolvedLabel: string;
}

export function FeedbackItem({
  item,
  expanded,
  onToggle,
  onUpdateStatus,
  sourceLabel,
  decisionLabel,
  ownerLabel,
  nextActionLabel,
  markInReviewLabel,
  acceptLabel,
  dismissLabel,
  markResolvedLabel,
}: FeedbackItemProps) {
  return (
    <div className="py-2.5">
      <div
        className="flex items-start justify-between cursor-pointer gap-2"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium break-words">
              {item.title}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${severityColors[item.severity] ?? ""}`}
            >
              {item.severity}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] bg-gray-50 shrink-0"
            >
              {item.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 ${statusColors[item.status] ?? ""}`}
            >
              {item.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 break-words">
            {sourceLabel} {item.source} —{" "}
            {new Date(item.createdAt).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <div className="shrink-0">
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          <p className="text-sm break-words">{item.description}</p>
          {item.decision && (
            <p className="text-xs break-words">
              <span className="font-medium">{decisionLabel}</span>{" "}
              {item.decision}
            </p>
          )}
          {item.owner && (
            <p className="text-xs break-words">
              <span className="font-medium">{ownerLabel}</span>{" "}
              {item.owner}
            </p>
          )}
          {item.nextAction && (
            <p className="text-xs break-words">
              <span className="font-medium">{nextActionLabel}</span>{" "}
              {item.nextAction}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1">
            {item.status === "open" && (
              <Button
                size="xs"
                variant="outline"
                className="text-[10px]"
                onClick={() => onUpdateStatus(item.id, "in_review")}
              >
                {markInReviewLabel}
              </Button>
            )}
            {item.status === "in_review" && (
              <Button
                size="xs"
                variant="outline"
                className="text-[10px]"
                onClick={() => onUpdateStatus(item.id, "accepted")}
              >
                {acceptLabel}
              </Button>
            )}
            {(item.status === "open" || item.status === "in_review") && (
              <Button
                size="xs"
                variant="outline"
                className="text-[10px]"
                onClick={() => onUpdateStatus(item.id, "dismissed")}
              >
                {dismissLabel}
              </Button>
            )}
            {item.status === "accepted" && (
              <Button
                size="xs"
                variant="outline"
                className="text-[10px]"
                onClick={() => onUpdateStatus(item.id, "resolved")}
              >
                {markResolvedLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
