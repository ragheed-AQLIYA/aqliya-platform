"use client";

import { useTranslations } from "next-intl";
import PilotDemoFlow from "@/components/audit/pilot/pilot-demo-flow";
import { usePilotPage } from "@/components/audit/pilot/use-pilot-page";
import { StatusSummary } from "@/components/audit/pilot/components/status-summary";
import { SignoffChecklist } from "@/components/audit/pilot/components/signoff-checklist";
import { FeedbackBoard } from "@/components/audit/pilot/components/feedback-board";
import { ProductionBlockers } from "@/components/audit/pilot/components/production-blockers";
import { AddFeedbackDialog } from "@/components/audit/pilot/components/add-feedback-dialog";

export default function PilotPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PilotDemoFlow />
      <PilotPageContent />
    </div>
  );
}

function PilotPageContent() {
  const t = useTranslations("audit.pilot");
  const pilot = usePilotPage();

  if (pilot.loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground break-words">
          {pilot.engagement?.client?.name} - {pilot.engagement?.fiscalPeriod}
        </p>
      </div>

      <StatusSummary
        openBlockers={pilot.openBlockers}
        feedbackCount={pilot.feedback.length}
        openFeedbacks={pilot.openFeedbacks}
        blockerCount={pilot.blockers.length}
        approvedSignoffs={pilot.signoffs.filter((s) => s.status === "approved").length}
        totalSignoffItems={7}
        allApproved={pilot.allApproved}
        readyLabel={t("ready")}
        blockersLabel={t("blockers")}
        productionReadinessLabel={t("productionReadiness")}
        feedbackItemsLabel={t("feedbackItems")}
        openLabel={t("open")}
        blockersTitleLabel={t("blockersTitle")}
        signoffChecklistLabel={t("signoffChecklist")}
      />

      <SignoffChecklist
        signoffs={pilot.signoffs}
        allApproved={pilot.allApproved}
        onToggleSignoff={pilot.handleToggleSignoff}
        title={t("signoffChecklist")}
        byLabel={t("by")}
        undoLabel={t("undo")}
        approveLabel={t("approve")}
        allCompleteLabel={t("allComplete")}
        itemsRemainingLabel={t("itemsRemaining")}
      />

      <FeedbackBoard
        feedback={pilot.feedback}
        expandedId={pilot.fbExpanded}
        filterCat={pilot.fbFilterCat}
        filterStatus={pilot.fbFilterStatus}
        onUpdateStatus={pilot.handleUpdateFeedbackStatus}
        onToggleExpanded={pilot.setFbExpanded}
        onSetFilterCat={pilot.setFbFilterCat}
        onSetFilterStatus={pilot.setFbFilterStatus}
        onOpenDialog={() => pilot.setShowFeedbackDialog(true)}
        title={t("feedbackBoard")}
        addFeedbackLabel={t("addFeedback")}
        categoryFieldLabel={t("categoryField")}
        allCategoriesLabel={t("allCategories")}
        statusFieldLabel={t("statusField")}
        allStatusesLabel={t("allStatuses")}
        openLabel={t("statusOpen")}
        inReviewLabel={t("statusInReview")}
        acceptedLabel={t("statusAccepted")}
        resolvedLabel={t("statusResolved")}
        dismissedLabel={t("statusDismissed")}
        noFeedbackLabel={t("noFeedback")}
        sourceLabel={t("source")}
        decisionLabel={t("decision")}
        ownerLabel={t("owner")}
        nextActionLabel={t("nextAction")}
        markInReviewLabel={t("markInReview")}
        acceptLabel={t("accept")}
        dismissLabel={t("dismiss")}
        markResolvedLabel={t("markResolved")}
      />

      <ProductionBlockers
        blockers={pilot.blockers}
        openBlockers={pilot.openBlockers}
        expandedId={pilot.blockerExpanded}
        onToggleExpanded={pilot.setBlockerExpanded}
        onUpdateStatus={pilot.handleUpdateBlockerStatus}
        title={t("productionBlockers")}
        openLabel={t("open")}
        noBlockersLabel={t("noBlockers")}
        beforeLabel={t("before")}
        ownerLabel={t("owner")}
        planLabel={t("plan")}
        inProgressLabel={t("inProgress")}
        resolveLabel={t("resolve")}
      />

      <AddFeedbackDialog
        open={pilot.showFeedbackDialog}
        onOpenChange={pilot.setShowFeedbackDialog}
        newFeedback={pilot.newFeedback}
        onChange={pilot.setNewFeedback}
        onSubmit={pilot.handleCreateFeedback}
        submitting={pilot.fbSubmitting}
        dialogTitleLabel={t("dialogTitle")}
        dialogDescriptionLabel={t("dialogDescription")}
        titleLabel={t("titleField")}
        titlePlaceholderLabel={t("titlePlaceholder")}
        descriptionLabel={t("descriptionField")}
        descriptionPlaceholderLabel={t("descriptionPlaceholder")}
        sourceLabel={t("sourceField")}
        sourcePlaceholderLabel={t("sourcePlaceholder")}
        categoryFieldLabel={t("categoryField")}
        severityFieldLabel={t("severityField")}
        lowLabel={t("low")}
        mediumLabel={t("medium")}
        highLabel={t("high")}
        criticalLabel={t("critical")}
        cancelLabel={t("cancel")}
        savingLabel={t("saving")}
        saveFeedbackLabel={t("saveFeedback")}
      />
    </div>
  );
}
