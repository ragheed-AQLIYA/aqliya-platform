"use client";

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import type { Finding } from "@/types/audit";
import { severityColors, statusColors, typeColors } from "./constants";
import { FindingDetailRow } from "./finding-detail-row";

interface FindingsTableProps {
  sorted: Finding[];
  expandedId: string | null;
  engagementId: string;
  findHasMore: boolean;
  findTotal: number;
  findPage: number;
  loadingFindMore: boolean;
  generatingFindingDrafts: boolean;
  findingsLength: number;
  onExpand: (id: string | null) => void;
  onAcceptFinding: (f: Finding) => void;
  onStartReview: (f: Finding) => void;
  onDismiss: (f: Finding) => void;
  onOpenEvidence: (f: Finding) => void;
  onOpenRecs: (f: Finding) => void;
  onOpenTraceability: (f: Finding) => void;
  onLoadMore: () => void;
}

export function FindingsTable({
  sorted,
  expandedId,
  engagementId,
  findHasMore,
  findTotal,
  loadingFindMore,
  generatingFindingDrafts,
  findingsLength,
  onExpand,
  onAcceptFinding,
  onStartReview,
  onDismiss,
  onOpenEvidence,
  onOpenRecs,
  onOpenTraceability,
  onLoadMore,
}: FindingsTableProps) {
  const t = useTranslations("audit.findings");

  const statusLabel: Record<string, string> = {
    draft: t("draft"),
    open: t("open"),
    in_review: t("inReview"),
    accepted: t("accepted"),
    resolved: t("resolved"),
    dismissed: t("dismissed"),
  };
  const severityLabel: Record<string, string> = {
    low: t("low"),
    medium: t("medium"),
    high: t("high"),
    critical: t("critical"),
  };
  const typeLabel: Record<string, string> = {
    material_misstatement: t("materialMisStatement"),
    control_deficiency: t("controlDeficiency"),
    disclosure_gap: t("disclosureGap"),
    observation: t("observation"),
  };

  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-[24px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("titleCol")}</TableHead>
                <TableHead>{t("typeCol")}</TableHead>
                <TableHead>{t("severityCol")}</TableHead>
                <TableHead>{t("statusCol")}</TableHead>
                <TableHead>{t("ai")}</TableHead>
                <TableHead>{t("relatedAccount")}</TableHead>
                <TableHead>{t("created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((finding) => (
                <Fragment key={finding.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() =>
                      onExpand(expandedId === finding.id ? null : finding.id)
                    }
                  >
                    <TableCell className="font-medium">
                      {finding.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeColors[finding.findingType]}
                      >
                        {typeLabel[finding.findingType] || t("observation")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={severityColors[finding.severity]}
                      >
                        {severityLabel[finding.severity] || t("critical")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[finding.status]}
                      >
                        {statusLabel[finding.status] || t("dismissed")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {finding.aiSuggested ? (
                        <Sparkles className="size-4 text-purple-500" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {finding.relatedAccountIds.length > 0
                        ? finding.relatedAccountIds.map((id) => (
                            <Badge
                              key={id}
                              variant="outline"
                              className="text-[10px] mr-1"
                            >
                              {id}
                            </Badge>
                          ))
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(finding.createdAt).toLocaleDateString("ar-SA", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                  {expandedId === finding.id && (
                    <FindingDetailRow
                      finding={finding}
                      engagementId={engagementId}
                      onAccept={onAcceptFinding}
                      onStartReview={onStartReview}
                      onDismiss={onDismiss}
                      onOpenEvidence={onOpenEvidence}
                      onOpenRecs={onOpenRecs}
                      onOpenTraceability={onOpenTraceability}
                    />
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {findHasMore && (
        <div className="flex justify-center py-3 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingFindMore || generatingFindingDrafts}
            onClick={onLoadMore}
          >
            {loadingFindMore ? (
              <Loader2 className="size-4 me-1 animate-spin" />
            ) : (
              <RefreshCw className="size-4 me-1" />
            )}
            {t("loadMore", { remaining: findTotal - findingsLength })}
          </Button>
        </div>
      )}
    </Card>
  );
}
