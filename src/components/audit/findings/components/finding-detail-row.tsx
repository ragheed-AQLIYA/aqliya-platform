"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  FileText,
  Share2,
  CheckCircle,
  XCircle,
  ListChecks,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FindingRagCitations } from "@/components/audit/findings/components/finding-rag-citations";
import type { Finding } from "@/types/audit";

interface FindingDetailRowProps {
  finding: Finding;
  engagementId: string;
  onAccept: (f: Finding) => void;
  onStartReview: (f: Finding) => void;
  onDismiss: (f: Finding) => void;
  onOpenEvidence: (f: Finding) => void;
  onOpenRecs: (f: Finding) => void;
  onOpenTraceability: (f: Finding) => void;
}

export function FindingDetailRow({
  finding,
  engagementId,
  onAccept,
  onStartReview,
  onDismiss,
  onOpenEvidence,
  onOpenRecs,
  onOpenTraceability,
}: FindingDetailRowProps) {
  const t = useTranslations("audit.findings");

  return (
    <TableRow key={`${finding.id}-detail`}>
      <TableCell colSpan={7} className="bg-muted/30">
        <div className="p-4 space-y-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
              {t("description")}
            </div>
            <p>{finding.description}</p>
          </div>
          {finding.rootCause && (
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                {t("rootCause")}
              </div>
              <p>{finding.rootCause}</p>
            </div>
          )}
          {finding.impact && (
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                {t("impact")}
              </div>
              <p>{finding.impact}</p>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {t("materiality", { value: finding.materiality ?? "" })}
            </span>
            {finding.assignedTo && (
              <span>
                {t("assignedTo", { name: finding.assignedTo ?? "" })}
              </span>
            )}
            <span>
              {t("updated", {
                date: new Date(finding.updatedAt).toLocaleDateString(),
              })}
            </span>
          </div>
          <FindingRagCitations
            title={finding.title}
            description={finding.description}
          />
          <div className="flex gap-2 pt-1 flex-wrap">
            {finding.status === "draft" && (
              <Button
                size="xs"
                variant="outline"
                className="text-green-600 border-green-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(finding);
                }}
              >
                <CheckCircle className="size-3 me-1" />
                {t("acceptFinding")}
              </Button>
            )}
            {finding.status === "open" && (
              <Button
                size="xs"
                variant="outline"
                className="text-purple-600 border-purple-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartReview(finding);
                }}
              >
                <CheckCircle className="size-3 me-1" />
                {t("startReview")}
              </Button>
            )}
            {finding.status !== "resolved" && finding.status !== "dismissed" && (
              <Button
                size="xs"
                variant="outline"
                className="text-red-600 border-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(finding);
                }}
              >
                <XCircle className="size-3 me-1" />
                {t("dismissFinding")}
              </Button>
            )}
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenEvidence(finding);
              }}
            >
              <FileText className="size-3 me-1" />
              {t("evidenceCount", {
                count: finding.relatedEvidenceIds?.length ?? 0,
              })}
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRecs(finding);
              }}
            >
              <ListChecks className="size-3 me-1" />
              {t("recommendations")}
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTraceability(finding);
              }}
            >
              <Share2 className="size-3 me-1" />
              {t("traceability")}
            </Button>
            {finding.aiSuggested && (
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-700"
              >
                <Sparkles className="size-3 me-1" />
                {t("aiSuggested")}
              </Badge>
            )}
          </div>
          {finding.aiSuggested && (
            <div className="mt-2 rounded border border-purple-200 bg-purple-50 p-2 text-xs text-purple-700">
              {t("requiresHumanConfirmation")}
            </div>
          )}
          {(finding.relatedEvidenceIds?.length ?? 0) === 0 && (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
              لا توجد أدلة مرتبطة بهذه النتيجة.{" "}
              <Link
                href={`/audit/engagements/${engagementId}/evidence`}
                className="font-medium underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                اربط دليلاً من تبويب الأدلة
              </Link>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
