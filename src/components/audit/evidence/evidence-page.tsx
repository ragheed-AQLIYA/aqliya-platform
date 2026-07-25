"use client";

import { useEvidencePage } from "./components/use-evidence-page";
import { EvidenceHeader } from "./components/evidence-header";
import { EvidenceInfoCard } from "./components/evidence-info-card";
import { AISuggestionsPanel } from "./components/ai-suggestions-panel";
import { EvidenceTable } from "./components/evidence-table";
import { RequestEvidenceDialog } from "./components/request-evidence-dialog";
import { LinkEvidenceDialog } from "./components/link-evidence-dialog";
import { RejectEvidenceDialog } from "./components/reject-evidence-dialog";
import { EvidenceDetailDrawer } from "./components/evidence-detail-drawer";
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer";
import { EvidenceVersionHistory } from "@/components/audit/evidence/evidence-version-history";

export default function EvidencePage() {
  const page = useEvidencePage();

  if (page.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <EvidenceHeader
        missingCount={page.missingCount}
        suggesting={page.suggesting}
        onGenerateSuggestions={page.handleGenerateSuggestions}
        onRequestEvidence={() => page.setShowRequest(true)}
      />

      <EvidenceInfoCard />

      <AISuggestionsPanel
        suggestions={page.aiSuggestions}
        acceptingSuggestionId={page.acceptingSuggestionId}
        onAcceptSuggestion={page.handleAcceptSuggestion}
        onDismissSuggestion={page.handleDismissSuggestion}
      />

      <EvidenceTable
        evidence={page.evidence}
        filtered={page.filtered}
        search={page.search}
        stateFilter={page.stateFilter}
        evHasMore={page.evHasMore}
        loadingMore={page.loadingMore}
        evTotal={page.evTotal}
        stateLabel={page.stateLabel}
        onSearchChange={page.setSearch}
        onStateFilterChange={page.setStateFilter}
        onSelectEvidence={page.setSelectedEv}
        onRequestEvidence={() => page.setShowRequest(true)}
        onLoadMore={page.handleLoadMore}
      />

      <RequestEvidenceDialog
        open={page.showRequest}
        onClose={() => page.setShowRequest(false)}
        engagementId={page.engagementId}
        onCreated={(ev) => page.setEvidence((prev) => [ev, ...prev])}
      />

      <LinkEvidenceDialog
        open={page.showLinkDialog}
        onClose={() => page.setShowLinkDialog(false)}
        findingsList={page.findingsList}
        onSubmit={async (targetType, targetId) => {
          page.setLinkTargetType(targetType);
          page.setLinkTargetId(targetId);
          await page.handleLinkEvidence();
        }}
      />

      <RejectEvidenceDialog
        open={page.showRejectDialog}
        onClose={() => page.setShowRejectDialog(false)}
        filename={page.selectedEv?.filename ?? null}
        onReject={page.handleRejectEvidence}
      />

      {page.selectedEv && (
        <EvidenceDetailDrawer
          selectedEv={page.selectedEv}
          engagementId={page.engagementId}
          onClose={() => page.setSelectedEv(null)}
          uploadingId={page.uploadingId}
          downloadingId={page.downloadingId}
          actionError={page.actionError}
          traceEvOpen={page.traceEvOpen}
          setTraceEvOpen={page.setTraceEvOpen}
          traceEvData={page.traceEvData}
          setTraceEvData={page.setTraceEvData}
          stateLabel={page.stateLabel}
          onUploadFile={page.handleUploadFile}
          onDownload={page.handleDownload}
          onAccept={page.handleAccept}
          onMarkReviewed={page.handleMarkReviewed}
          onOpenLinkDialog={page.handleOpenLinkDialog}
          onOpenRejectDialog={() => page.setShowRejectDialog(true)}
          onOpenVersionHistory={() => page.setVersionHistoryOpen(true)}
        />
      )}

      {page.selectedEv && (
        <TraceabilityDrawer
          open={page.traceEvOpen}
          onClose={() => page.setTraceEvOpen(false)}
          entityType="evidence"
          entityId={page.selectedEv.id}
          entityLabel={page.selectedEv.filename}
          forwardTrace={page.traceEvData.forward}
          backwardTrace={page.traceEvData.backward}
        />
      )}

      {page.selectedEv && (
        <EvidenceVersionHistory
          evidenceId={page.selectedEv.id}
          engagementId={page.engagementId}
          open={page.versionHistoryOpen}
          onClose={() => page.setVersionHistoryOpen(false)}
          onRevert={page.handleVersionRevert}
        />
      )}
    </div>
  );
}
