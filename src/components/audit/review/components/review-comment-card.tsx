"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, AlertTriangle, CheckCircle, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReviewComment } from "@/types/audit";

interface ReviewCommentCardProps {
  comment: ReviewComment;
  targetLabel: string;
  onTrace: (c: ReviewComment) => void;
  onResolve?: (c: ReviewComment) => void;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-300",
  resolved: "bg-green-100 text-green-700 border-green-300",
  acknowledged: "bg-gray-100 text-gray-600 border-gray-300",
};

const targetIcons: Record<string, React.ReactNode> = {
  statement: <MessageSquare className="size-4" />,
  note: <MessageSquare className="size-4" />,
  finding: <AlertTriangle className="size-4" />,
  recommendation: <CheckCircle className="size-4" />,
  evidence: <MessageSquare className="size-4" />,
};

export function ReviewCommentCard({
  comment,
  targetLabel,
  onTrace,
  onResolve,
}: ReviewCommentCardProps) {
  const t = useTranslations("audit.review");

  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{targetIcons[comment.targetType]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.reviewerName}</span>
              <Badge variant="outline" className="text-[10px]">
                {comment.targetType}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] ${statusColors[comment.status]}`}
              >
                {comment.status}
              </Badge>
              {comment.requiredAction && comment.requiredAction !== "none" && (
                <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700">
                  {comment.requiredAction.replace(/_/g, " ")}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground mr-auto">
                {new Date(comment.createdAt).toLocaleDateString("ar-SA", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm mt-1">{comment.comment}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {t("on")} {targetLabel}
              </span>
            </div>
            {comment.resolution && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                {t("resolved", { count: "" }).replace(/\(\)/g, "").trim()}:{" "}
                {comment.resolution}
                {comment.resolvedAt && (
                  <span className="mr-1">
                    ({new Date(comment.resolvedAt).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}
            {comment.status === "open" ? (
              <div className="flex items-center gap-1 mt-2">
                <Button
                  size="xs"
                  variant="outline"
                  className="text-green-600 border-green-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve?.(comment);
                  }}
                >
                  <CheckCircle className="size-3 me-1" />
                  {t("resolve")}
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrace(comment);
                  }}
                >
                  <Share2 className="size-3 me-1" />
                  {t("trace")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrace(comment);
                  }}
                >
                  <Share2 className="size-3 me-1" />
                  {t("trace")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
