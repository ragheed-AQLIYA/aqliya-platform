"use client";

import { useEffect, useState, useCallback } from "react";
import {
  compareEvidenceVersionsAction,
  getEvidenceVersionsAction,
  revertEvidenceVersionAction,
} from "@/actions/audit-read-actions";

export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  versionNumber: number;
  changes: Record<string, unknown>;
  changeDescription: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

export function useEvidenceHistory(
  evidenceId: string,
  engagementId: string,
  open: boolean,
  onRevert?: () => void,
) {
  const [versions, setVersions] = useState<EvidenceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<VersionDiff[] | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    const res = await getEvidenceVersionsAction(evidenceId, engagementId);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    setVersions(res.data);
    return res.data;
  }, [evidenceId, engagementId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await loadVersions();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "فشل تحميل سجل الإصدارات",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [evidenceId, engagementId, open, loadVersions]);

  const handleCompare = useCallback(
    async (vid1: string, vid2: string) => {
      setDiffLoading(true);
      setDiffResult(null);
      try {
        const res = await compareEvidenceVersionsAction(
          evidenceId,
          engagementId,
          vid1,
          vid2,
        );
        if (!res.success) {
          setError(res.error);
          return;
        }
        setDiffResult(res.data);
      } catch {
        setError("فشل مقارنة الإصدارات");
      } finally {
        setDiffLoading(false);
      }
    },
    [evidenceId, engagementId],
  );

  const handleCompareClick = useCallback(
    (versionId: string) => {
      const [first, second] = compareIds;
      if (first === null) {
        setCompareIds([versionId, null]);
      } else if (first !== versionId && second === null) {
        setCompareIds([first, versionId]);
        void handleCompare(first, versionId);
      } else {
        setCompareIds([versionId, null]);
        setDiffResult(null);
      }
    },
    [compareIds, handleCompare],
  );

  const handleRevert = useCallback(
    async (versionNumber: number) => {
      setRevertingId(`revert-${versionNumber}`);
      try {
        const res = await revertEvidenceVersionAction(
          evidenceId,
          engagementId,
          versionNumber,
        );
        if (!res.success) {
          setError(res.error);
          return;
        }
        await loadVersions();
        onRevert?.();
      } catch {
        setError("فشل استعادة الإصدار");
      } finally {
        setRevertingId(null);
      }
    },
    [evidenceId, engagementId, loadVersions, onRevert],
  );

  return {
    versions,
    loading,
    error,
    setError,
    expandedVersion,
    setExpandedVersion,
    diffResult,
    diffLoading,
    handleCompareClick,
    handleRevert,
    revertingId,
  };
}
