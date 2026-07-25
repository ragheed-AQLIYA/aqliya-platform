"use client";

import {
  Sparkles,
  Target,
  ExternalLink,
  Share2,
  CheckCircle,
  XCircle,
  Edit3,
} from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskColors, statusColors } from "../use-recommendations-page";
import type { Recommendation } from "@/types/audit";

interface Props {
  rec: Recommendation;
  expanded: boolean;
  t: (key: string, values?: Record<string, string | number | Date> | undefined) => string;
  onToggle: () => void;
  onTraceability: () => void;
  onAcceptStatus: () => void;
  onRejectStatus: () => void;
}

export function RecommendationTableRow({
  rec,
  expanded,
  t,
  onToggle,
  onTraceability,
  onAcceptStatus,
  onRejectStatus,
}: Props) {
  const statusLocked = rec.status === "accepted" || rec.status === "rejected";

  return (
    <>
      <TableRow className="cursor-pointer" onClick={onToggle}>
        <TableCell className="font-medium">{rec.title}</TableCell>
        <TableCell>
          {rec.finding ? (
            <span className="flex items-center gap-1 text-xs">
              <Target className="size-3" />
              {rec.finding.title}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {rec.findingId}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={riskColors[rec.riskLevel]}>
            {rec.riskLevel}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={statusColors[rec.status]}>
            {rec.status.replace(/_/g, " ")}
          </Badge>
        </TableCell>
        <TableCell>
          {rec.aiContributed ? (
            <Sparkles className="size-4 text-purple-500" />
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {new Date(rec.createdAt).toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
          })}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30">
            <div className="space-y-3 p-4 text-sm">
              <div>
                <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {t("description")}
                </div>
                <p>{rec.description}</p>
              </div>
              <div>
                <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {t("recommendedAction")}
                </div>
                <p>{rec.recommendedAction}</p>
              </div>
              {rec.impactAssessment && (
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {t("impactAssessment")}
                  </div>
                  <p>{rec.impactAssessment}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {t("finding")}{" "}
                  <button className="inline-flex items-center gap-0.5 text-blue-600 hover:underline">
                    {rec.finding?.title || rec.findingId}
                    <ExternalLink className="size-3" />
                  </button>
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTraceability();
                  }}
                >
                  <Share2 className="me-1 size-3" />
                  {t("traceability")}
                </Button>
              </div>
              {rec.aiContributed && (
                <div className="space-y-2 rounded-lg border-2 border-purple-300 bg-purple-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-700">
                      <Sparkles className="size-3" />
                      {t("aiSuggestion")}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        className="border-green-300 text-green-600"
                        disabled={statusLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptStatus();
                        }}
                      >
                        <CheckCircle className="me-1 size-3" />
                        {t("accept")}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="border-red-300 text-red-600"
                        disabled={statusLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRejectStatus();
                        }}
                      >
                        <XCircle className="me-1 size-3" />
                        {t("reject")}
                      </Button>
                      <Button size="xs" variant="outline">
                        <Edit3 className="me-1 size-3" />
                        {t("edit")}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-purple-900">{rec.description}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
