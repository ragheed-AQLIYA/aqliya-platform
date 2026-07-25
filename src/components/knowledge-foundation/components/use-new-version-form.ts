"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createFoundationVersion } from "@/actions/knowledge-foundation/actions";
import type { CandidatePoolOverview } from "@/lib/knowledge-foundation/candidate-pool-overview";
import type { EligibleCandidateOption } from "./types";

export function useNewVersionForm(
  eligibleCandidates: EligibleCandidateOption[],
  poolOverview?: CandidatePoolOverview,
) {
  const router = useRouter();
  const [versionNumber, setVersionNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canonicalFilter, setCanonicalFilter] = useState("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [promotedAfter, setPromotedAfter] = useState("");

  const selectedCount = selectedIds.size;

  const filteredCandidates = useMemo(() => {
    return eligibleCandidates.filter((c) => {
      if (
        canonicalFilter &&
        !c.canonicalCode.toLowerCase().includes(canonicalFilter.toLowerCase()) &&
        !c.candidatePhrase.toLowerCase().includes(canonicalFilter.toLowerCase())
      ) {
        return false;
      }
      if (c.confidence < minConfidence / 100) return false;
      if (promotedAfter && c.promotedAt) {
        if (new Date(c.promotedAt) < new Date(promotedAfter)) return false;
      }
      if (promotedAfter && !c.promotedAt) return false;
      return true;
    });
  }, [eligibleCandidates, canonicalFilter, minConfidence, promotedAfter]);

  const toggleCandidate = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
  }, [filteredCandidates]);

  const summary = useMemo(() => {
    const selected = eligibleCandidates.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return null;
    const avgConfidence =
      selected.reduce((sum, c) => sum + c.confidence, 0) / selected.length;
    const totalOrgs = selected.reduce((sum, c) => sum + c.organizationCount, 0);
    return { avgConfidence, totalOrgs };
  }, [eligibleCandidates, selectedIds]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!versionNumber.trim()) {
        setError("الرجاء إدخال رقم الإصدار");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const version = await createFoundationVersion({
          versionNumber: versionNumber.trim(),
          notes: notes.trim() || undefined,
          candidateIds: [...selectedIds],
        });
        router.push(`/knowledge-foundation/${version.id}`);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الإصدار",
        );
      } finally {
        setLoading(false);
      }
    },
    [versionNumber, notes, selectedIds, router],
  );

  return {
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
  };
}
