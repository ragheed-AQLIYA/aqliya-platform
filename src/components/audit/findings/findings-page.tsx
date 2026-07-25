"use client";

import { useTranslations } from "next-intl";
import { useFindingsPage } from "./components/use-findings-page";
import { FindingsHeader } from "./components/findings-header";
import { EvidenceWarningCards } from "./components/evidence-warning-cards";
import { AiDraftsPanel } from "./components/ai-drafts-panel";
import { FindingsFilters } from "./components/findings-filters";
import { FindingsTable } from "./components/findings-table";
import { LinkedEvidenceDialog } from "./components/linked-evidence-dialog";
import { LinkedRecommendationsDialog } from "./components/linked-recommendations-dialog";
import { DismissFindingDialog } from "./components/dismiss-finding-dialog";
import { CreateFindingDialog } from "./components/create-finding-dialog";
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer";

export default function FindingsPage() {
  const { engagementId, state, actions } = useFindingsPage();
  const t = useTranslations("audit.findings");

  if (state.loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6" dir="rtl">
      <FindingsHeader
        engagement={state.engagement}
        generatingFindingDrafts={state.generatingFindingDrafts}
        onGenerateDrafts={actions.handleGenerateDrafts}
        onCreateClick={() => actions.setShowCreate(true)}
      />

      <EvidenceWarningCards
        engagementId={engagementId}
        evidenceCount={state.evidenceCount}
        linkedEvidenceCount={state.linkedEvidenceCount}
      />

      <AiDraftsPanel
        aiDrafts={state.aiDrafts}
        acceptingFindingId={state.acceptingFindingId}
        engagementId={engagementId}
        onAccept={actions.handleAcceptDraft}
        onReject={actions.handleRejectDraft}
      />

      <FindingsFilters
        statusFilter={state.statusFilter}
        onStatusChange={actions.setStatusFilter}
        severityFilter={state.severityFilter}
        onSeverityChange={actions.setSeverityFilter}
        typeFilter={state.typeFilter}
        onTypeChange={actions.setTypeFilter}
      />

      <FindingsTable
        sorted={state.sorted}
        expandedId={state.expandedId}
        engagementId={engagementId}
        findHasMore={state.findHasMore}
        findTotal={state.findTotal}
        findPage={state.findPage}
        loadingFindMore={state.loadingFindMore}
        generatingFindingDrafts={state.generatingFindingDrafts}
        findingsLength={state.findings.length}
        onExpand={actions.setExpandedId}
        onAcceptFinding={actions.handleAcceptFinding}
        onStartReview={actions.handleStartReview}
        onDismiss={(finding) => {
          actions.setDismissTarget(finding);
          actions.setDismissError(null);
          actions.setShowDismissDialog(true);
        }}
        onOpenEvidence={actions.openLinkedEvidence}
        onOpenRecs={actions.openLinkedRecs}
        onOpenTraceability={actions.openTraceability}
        onLoadMore={actions.handleLoadMore}
      />

      <LinkedEvidenceDialog
        finding={state.showLinkedEvidence}
        linkedEvidence={state.linkedEvidence}
        loading={state.loadingLinked}
        onClose={() => actions.setShowLinkedEvidence(null)}
      />

      <LinkedRecommendationsDialog
        finding={state.showLinkedRecs}
        linkedRecs={state.linkedRecs}
        loading={state.loadingLinkedRecs}
        onClose={() => actions.setShowLinkedRecs(null)}
      />

      <TraceabilityDrawer
        open={state.traceabilityOpen}
        onClose={() => {
          actions.setTraceabilityOpen(false);
          actions.setTraceFinding(null);
        }}
        entityType="finding"
        entityId={state.traceFinding?.id || ""}
        entityLabel={state.traceFinding?.title || ""}
        forwardTrace={state.traceData.forward}
        backwardTrace={state.traceData.backward}
      />

      <DismissFindingDialog
        open={state.showDismissDialog}
        onOpenChange={actions.setShowDismissDialog}
        target={state.dismissTarget}
        error={state.dismissError}
        dismissing={state.dismissing}
        onConfirm={actions.handleDismiss}
        onClose={() => {
          actions.setShowDismissDialog(false);
          actions.setDismissTarget(null);
          actions.setDismissError(null);
        }}
      />

      <CreateFindingDialog
        open={state.showCreate}
        onOpenChange={actions.setShowCreate}
        newFinding={state.newFinding}
        onNewFindingChange={actions.setNewFinding}
        onSubmit={actions.handleCreate}
        submitting={state.createSubmitting}
        error={state.createError}
      />
    </div>
  );
}
