"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ReviewerSignoffChainPanel } from "@/components/audit/approval/reviewer-signoff-chain-panel";
import { useApprovalPage } from "./components/use-approval-page";
import { LoadingState } from "./components/loading-state";
import { ApprovalHeader } from "./components/approval-header";
import { HumanApprovalBanner } from "./components/human-approval-banner";
import { NextActionBanner } from "./components/next-action-banner";
import { ApprovalStatusCard } from "./components/approval-status-card";
import { ApprovalChecklistCard } from "./components/approval-checklist-card";

const TraceabilityDrawer = dynamic(
  () =>
    import("@/components/audit/shared/traceability-drawer").then(
      (m) => ({ default: m.TraceabilityDrawer }),
    ),
  { ssr: false, loading: () => <div className="h-20 animate-pulse rounded-md bg-muted" /> },
);

const ApprovalHistoryCard = dynamic(
  () =>
    import("./components/approval-history-card").then(
      (m) => ({ default: m.ApprovalHistoryCard }),
    ),
  { ssr: false, loading: () => <div className="h-24 animate-pulse rounded-md bg-muted" /> },
);

const ApprovalPermissionsCard = dynamic(
  () =>
    import("./components/approval-permissions-card").then(
      (m) => ({ default: m.ApprovalPermissionsCard }),
    ),
  { ssr: false, loading: () => <div className="h-20 animate-pulse rounded-md bg-muted" /> },
);

const RejectDialog = dynamic(
  () =>
    import("./components/reject-dialog").then(
      (m) => ({ default: m.RejectDialog }),
    ),
  { ssr: false, loading: () => <div className="h-32 animate-pulse rounded-md bg-muted" /> },
);

export default function ApprovalPage() {
  const t = useTranslations("audit.approval");
  const params = useParams();
  const engagementId = params.engagementId as string;
  const {
    records,
    approvalInfo,
    engagement,
    loading,
    approving,
    approveError,
    showRejectDialog,
    rejectReason,
    rejecting,
    rejectError,
    traceApproval,
    traceabilityOpen,
    traceData,
    nextActionHref,
    nextActionLabel,
    nextActionReason,
    canApprove,
    isApproved,
    setShowRejectDialog,
    setRejectReason,
    handleApprove,
    handleRejectConfirm,
    handleTraceOpen,
    handleTraceClose,
  } = useApprovalPage(engagementId);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6" dir="rtl">
      <ReviewerSignoffChainPanel engagementId={engagementId} />
      <ApprovalHeader engagement={engagement} />
      <HumanApprovalBanner />

      {!canApprove && !isApproved && nextActionHref && nextActionLabel && (
        <NextActionBanner
          href={nextActionHref}
          label={nextActionLabel}
          reason={nextActionReason}
        />
      )}

      <ApprovalStatusCard
        approvalInfo={approvalInfo}
        canApprove={canApprove}
        isApproved={isApproved}
        approving={approving}
        approveError={approveError}
        nextActionHref={nextActionHref}
        nextActionLabel={nextActionLabel}
        onApprove={handleApprove}
        onRejectClick={() => setShowRejectDialog(true)}
      />

      <ApprovalChecklistCard approvalInfo={approvalInfo} />
      <ApprovalHistoryCard records={records} onTraceOpen={handleTraceOpen} />
      <ApprovalPermissionsCard engagement={engagement} />

      <RejectDialog
        open={showRejectDialog}
        reason={rejectReason}
        rejecting={rejecting}
        rejectError={rejectError}
        onOpenChange={setShowRejectDialog}
        onReasonChange={setRejectReason}
        onConfirm={handleRejectConfirm}
      />

      <TraceabilityDrawer
        open={traceabilityOpen}
        onClose={handleTraceClose}
        entityType="approval_record"
        entityId={traceApproval?.id || ""}
        entityLabel={t("approvalBy", {
          name: traceApproval?.approverName || "",
        })}
        forwardTrace={traceData.forward}
        backwardTrace={traceData.backward}
      />
    </div>
  );
}
