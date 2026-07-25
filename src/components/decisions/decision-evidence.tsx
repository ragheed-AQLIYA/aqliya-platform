"use client";

import { useDecisionEvidence } from "./components/use-decision-evidence";
import { EvidenceHeader } from "./components/evidence-header";
import { EvidenceGovernanceBanner } from "./components/evidence-governance-banner";
import { EvidenceConstraints } from "./components/evidence-constraints";
import { EvidenceErrorAlert } from "./components/evidence-error-alert";
import { EvidenceUploadButton } from "./components/evidence-upload-button";
import { EvidenceLoadingState } from "./components/evidence-loading-state";
import { EvidenceEmptyState } from "./components/evidence-empty-state";
import { EvidenceListItem } from "./components/evidence-list-item";

interface DecisionEvidenceProps {
  decisionId: string;
}

export function DecisionEvidence({ decisionId }: DecisionEvidenceProps) {
  const {
    evidence,
    loading,
    uploading,
    deletingId,
    error,
    handleUpload,
    handleDelete,
  } = useDecisionEvidence(decisionId);

  return (
    <section className="rounded-lg border p-4">
      <EvidenceHeader count={evidence.length} />
      <EvidenceGovernanceBanner />
      <EvidenceConstraints />
      <EvidenceErrorAlert error={error} />
      <EvidenceUploadButton uploading={uploading} onUpload={handleUpload} />

      {loading ? (
        <EvidenceLoadingState />
      ) : evidence.length === 0 ? (
        <EvidenceEmptyState />
      ) : (
        <div className="space-y-2">
          {evidence.map((item) => (
            <EvidenceListItem
              key={item.id}
              item={item}
              decisionId={decisionId}
              deletingId={deletingId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
