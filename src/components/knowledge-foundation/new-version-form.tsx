"use client";

import { useNewVersionForm } from "./components/use-new-version-form";
import { ErrorAlert } from "./components/ErrorAlert";
import { FormFields } from "./components/FormFields";
import { PoolOverviewCard } from "./components/PoolOverviewCard";
import { FilterBar } from "./components/FilterBar";
import { CandidateList } from "./components/CandidateList";
import { FormActions } from "./components/FormActions";
import type { CandidatePoolOverview } from "@/lib/knowledge-foundation/candidate-pool-overview";
import type { EligibleCandidateOption } from "./components/types";

export type { EligibleCandidateOption };

export function NewVersionForm({
  eligibleCandidates,
  poolOverview,
}: {
  eligibleCandidates: EligibleCandidateOption[];
  poolOverview?: CandidatePoolOverview;
}) {
  const {
    versionNumber,
    setVersionNumber,
    notes,
    setNotes,
    selectedIds,
    loading,
    error,
    canonicalFilter,
    setCanonicalFilter,
    minConfidence,
    setMinConfidence,
    promotedAfter,
    setPromotedAfter,
    selectedCount,
    filteredCandidates,
    summary,
    toggleCandidate,
    clearSelection,
    selectAll,
    handleSubmit,
  } = useNewVersionForm(eligibleCandidates, poolOverview);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <ErrorAlert error={error} />

      <FormFields
        versionNumber={versionNumber}
        onVersionNumberChange={setVersionNumber}
        notes={notes}
        onNotesChange={setNotes}
      />

      <div className="rounded-xl border bg-muted/20 p-4">
        <PoolOverviewCard poolOverview={poolOverview} />

        <FilterBar
          canonicalFilter={canonicalFilter}
          onCanonicalFilterChange={setCanonicalFilter}
          minConfidence={minConfidence}
          onMinConfidenceChange={setMinConfidence}
          promotedAfter={promotedAfter}
          onPromotedAfterChange={setPromotedAfter}
        />

        <CandidateList
          eligibleCandidates={eligibleCandidates}
          filteredCandidates={filteredCandidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          selectedCount={selectedCount}
          summary={summary}
        />
      </div>

      <FormActions loading={loading} selectedCount={selectedCount} />
    </form>
  );
}
