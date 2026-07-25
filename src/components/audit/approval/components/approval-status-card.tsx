"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApprovalStatusLabel } from "@/lib/audit/workflow-next-action";
import { statusColors } from "./use-approval-page";
import type { ApprovalInfo } from "./use-approval-page";

export function ApprovalStatusCard({
  approvalInfo,
  canApprove,
  isApproved,
  approving,
  approveError,
  nextActionHref,
  nextActionLabel,
  onApprove,
  onRejectClick,
}: {
  approvalInfo: ApprovalInfo;
  canApprove: boolean;
  isApproved: boolean;
  approving: boolean;
  approveError: string | null;
  nextActionHref: string | null;
  nextActionLabel: string | null;
  onApprove: () => void;
  onRejectClick: () => void;
}) {
  const t = useTranslations("audit.approval");

  const statusLabel =
    approvalInfo.status === "not_ready"
      ? t("statusNotReady")
      : approvalInfo.status === "pending_approval"
        ? t("statusPendingApproval")
        : approvalInfo.status === "approved"
          ? t("statusApproved")
          : approvalInfo.status === "blocked"
            ? t("statusBlocked")
            : approvalInfo.status === "ready"
              ? t("statusReady")
              : getApprovalStatusLabel(approvalInfo.status);

  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>{t("approvalStatus")}</CardTitle>
          <Badge
            variant="outline"
            className={`${statusColors[approvalInfo.status]} text-sm px-3 py-1`}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && (
            <>
              <Button
                variant="outline"
                className="text-red-600 border-red-300"
                onClick={onRejectClick}
                disabled={approving}
              >
                <XCircle className="size-4 me-1" />
                {t("reject")}
              </Button>
              <Button disabled={approving} onClick={onApprove}>
                {approving ? (
                  t("approving")
                ) : (
                  <>
                    <CheckCircle className="size-4 me-1" />
                    {t("approve")}
                  </>
                )}
              </Button>
            </>
          )}
          {isApproved && (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              <CheckCircle className="size-3 me-1" />
              {t("statusApproved")}
            </Badge>
          )}
        </div>
        {approveError && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{t(approveError)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {approvalInfo.blockingIssues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700 mb-1">
              <Ban className="size-4" />
              {t("blockingIssues")}
            </div>
            <ul className="text-xs text-red-600 space-y-1">
              {approvalInfo.blockingIssues.map((issue, i) => (
                <li key={i} className="flex items-center gap-1">
                  <XCircle className="size-3 shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
            {nextActionHref && nextActionLabel && (
              <Link
                href={nextActionHref}
                className="mt-2 inline-flex text-xs font-medium text-red-700 underline underline-offset-2"
              >
                الانتقال إلى: {nextActionLabel}
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
