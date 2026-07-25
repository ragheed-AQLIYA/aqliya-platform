"use client";

import { DecisionTabs } from "@/components/decisions/decision-tabs";
import { useGovernancePage } from "./components/use-governance-page";
import { StatusHeader } from "./components/status-header";
import { GovernanceReadinessCard } from "./components/governance-readiness-card";
import { GovernanceWarnings } from "./components/governance-warnings";
import { RecommendationDiffCard } from "./components/recommendation-diff-card";
import { LegacySnapshotAlert } from "./components/legacy-snapshot-alert";
import { MissingRecommendationAlert } from "./components/missing-recommendation-alert";
import { DecisionRoles } from "./components/decision-roles";
import { ApprovedSnapshot } from "./components/approved-snapshot";
import { RecommendationSummary } from "./components/recommendation-summary";
import { ApprovalActions } from "./components/approval-actions";
import { ApprovalHistory } from "./components/approval-history";
import { DecisionTimeline } from "./components/decision-timeline";
import { ExportSection } from "./components/export-section";

function getGovernanceNextStep(
  status: string,
  canApprove: boolean,
  canSubmitForReview: boolean,
) {
  if (canSubmitForReview) return "استكمال مواد الدعم ثم إرسال القرار للمراجعة";
  if (canApprove)
    return "مراجعة التوصية والأدلة ثم الاعتماد أو إعادة القرار للمراجعة";
  if (status === "IN_REVIEW") return "القرار بانتظار إجراء من المعتمِد";
  if (status === "APPROVED")
    return "يمكن تجهيز سجل التصدير أو متابعة النشر وفق الحوكمة";
  if (status === "REJECTED")
    return "يتطلب القرار إعادة عمل قبل دورة اعتماد جديدة";
  return "استكمل مسار القرار قبل الاعتماد";
}

export default function GovernancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { state, actions } = useGovernancePage(params);

  if (state.loading || !state.id) {
    return (
      <div>
        <DecisionTabs decisionId={state.id || ""} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    );
  }

  if (!state.decision) {
    return (
      <div>
        <DecisionTabs decisionId={state.id} />
        <div className="mt-6 text-center text-muted-foreground">
          القرار غير موجود
        </div>
      </div>
    );
  }

  const status = state.approvalStatus?.status || state.decision.status;
  const canSubmitForReview = state.userRole === "OPERATOR" && status === "DRAFT";
  const canApprove = state.userRole === "ADMIN" && status === "IN_REVIEW";
  const hasRecommendation = state.approvalStatus?.hasRecommendation;
  const approvedSnapshot = state.approvalStatus?.approvedSnapshot;
  const recommendationDiffers = state.approvalStatus?.recommendationDiffers;
  const isLegacySnapshot = state.approvalStatus?.isLegacySnapshot;
  const evidenceCount = state.approvalStatus?.evidenceCount || 0;
  const latestEvidenceAt = state.approvalStatus?.latestEvidenceAt;
  const humanReviewRequired =
    state.approvalStatus?.recommendationSummary?.humanReviewRequired ??
    state.decision.recommendation?.humanReviewRequired ??
    true;
  const nextStep = getGovernanceNextStep(status, canApprove, canSubmitForReview);
  const governanceWarnings = [
    !hasRecommendation ? "لا توجد توصية حالية مرتبطة بهذا القرار." : null,
    evidenceCount === 0
      ? "لا توجد أدلة دعم مرفقة حتى الآن، ما يضعف قابلية المراجعة والتتبع."
      : null,
    humanReviewRequired
      ? "هذا القرار يتطلب مراجعة بشرية صريحة قبل الاعتماد أو الاعتماد على التصدير."
      : null,
    status !== "APPROVED"
      ? "أي تصدير يتم تجهيزه الآن يجب التعامل معه كمسودة تشغيلية غير نهائية."
      : null,
  ].filter(Boolean) as string[];

  return (
    <div>
      <DecisionTabs decisionId={state.id} decisionType={state.decision.type} />
      <div className="mt-6 max-w-4xl mx-auto">
        <StatusHeader status={status} />

        {state.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
            {state.success}
          </div>
        )}

        <GovernanceReadinessCard
          hasRecommendation={hasRecommendation}
          evidenceCount={evidenceCount}
          latestEvidenceAt={latestEvidenceAt}
          humanReviewRequired={humanReviewRequired}
          status={status}
          nextStep={nextStep}
          governanceWarnings={governanceWarnings}
        />

        <GovernanceWarnings warnings={governanceWarnings} />

        <RecommendationDiffCard
          recommendationDiffers={recommendationDiffers}
          diffData={state.diffData}
          showDiff={state.showDiff}
          loadingDiff={state.loadingDiff}
          showReReviewForm={state.showReReviewForm}
          reReviewReason={state.reReviewReason}
          status={status}
          saving={state.saving}
          onToggleDiff={() => {
            actions.setShowDiff(!state.showDiff);
            if (!state.showDiff && !state.diffData) actions.handleLoadDiff();
          }}
          onToggleReReviewForm={() => actions.setShowReReviewForm(!state.showReReviewForm)}
          onReReviewReasonChange={actions.setReReviewReason}
          onSubmitReReview={actions.handleRequestReReview}
        />

        <LegacySnapshotAlert
          isLegacySnapshot={isLegacySnapshot}
          approvedSnapshot={approvedSnapshot}
        />

        <MissingRecommendationAlert
          hasRecommendation={hasRecommendation}
          status={status}
        />

        <DecisionRoles
          owner={state.decision.owner}
          reviewer={state.decision.reviewer}
          approver={state.decision.approver}
        />

        <ApprovedSnapshot
          approvedSnapshot={approvedSnapshot}
          recommendationDiffers={recommendationDiffers}
          recommendationSummary={state.approvalStatus?.recommendationSummary}
        />

        <RecommendationSummary
          recommendationSummary={state.approvalStatus?.recommendationSummary}
        />

        <ApprovalActions
          canSubmitForReview={canSubmitForReview}
          canApprove={canApprove}
          hasRecommendation={hasRecommendation}
          evidenceCount={evidenceCount}
          saving={state.saving}
          notes={state.notes}
          conditions={state.conditions}
          overrideReason={state.overrideReason}
          showApproveForm={state.showApproveForm}
          showRejectForm={state.showRejectForm}
          showConditionsForm={state.showConditionsForm}
          onSubmitForReview={actions.handleSubmitForReview}
          onApprove={actions.handleApprove}
          onApproveWithConditions={actions.handleApproveWithConditions}
          onReject={actions.handleReject}
          onRequestRevision={actions.handleRequestRevision}
          onNotesChange={actions.setNotes}
          onConditionsChange={actions.setConditions}
          onOverrideReasonChange={actions.setOverrideReason}
          onToggleApproveForm={() => actions.setShowApproveForm(!state.showApproveForm)}
          onToggleRejectForm={() => actions.setShowRejectForm(!state.showRejectForm)}
          onToggleConditionsForm={() => actions.setShowConditionsForm(!state.showConditionsForm)}
        />

        <ApprovalHistory
          latestApproval={state.approvalStatus?.latestApproval}
          approvals={state.approvalStatus?.approvals}
          reviewActions={state.approvalStatus?.reviewActions}
        />

        <DecisionTimeline
          timeline={state.timeline}
          loadingTimeline={state.loadingTimeline}
          onLoadTimeline={actions.handleLoadTimeline}
        />

        <ExportSection
          status={status}
          loadingExport={state.loadingExport}
          exportData={state.exportData}
          copied={state.copied}
          onExport={actions.handleExport}
          onCopy={actions.handleCopyExport}
          onDownload={actions.handleDownloadExport}
        />
      </div>
    </div>
  );
}
