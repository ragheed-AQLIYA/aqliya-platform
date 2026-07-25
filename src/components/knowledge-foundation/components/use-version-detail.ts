"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  approveFoundationVersion,
  activateFoundationVersion,
  deprecateFoundationVersion,
  rollbackFoundationVersion,
  generateFoundationRelease,
} from "@/actions/knowledge-foundation/actions";
import type { VersionData } from "../version-detail-client";

export function useVersionDetail(
  version: VersionData,
  userRole: string,
  versions: Array<{ id: string; versionNumber: string; status: string }>,
) {
  const router = useRouter();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [rollbackId, setRollbackId] = useState("");
  const [rollbackReason, setRollbackReason] = useState("");
  const [showRollback, setShowRollback] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";
  const isOperator = userRole === "OPERATOR" || isAdmin;
  const isActive = version.status === "ACTIVE";

  const doAction = useCallback(
    async (action: string, fn: () => Promise<unknown>) => {
      setLoading(action);
      setActionMsg(null);
      setActionError(null);
      try {
        await fn();
        setActionMsg(`تم ${action} الإصدار بنجاح.`);
        router.refresh();
      } catch (err: unknown) {
        setActionError(
          err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        );
      } finally {
        setLoading(null);
      }
    },
    [router],
  );

  const handleRollback = useCallback(async () => {
    if (!rollbackId || !rollbackReason.trim()) {
      setActionError("الرجاء اختيار إصدار الهدف وذكر السبب");
      return;
    }
    await doAction("الاسترجاع", () =>
      rollbackFoundationVersion({
        versionId: version.id,
        targetVersionId: rollbackId,
        reason: rollbackReason,
      }),
    );
  }, [version.id, rollbackId, rollbackReason, doAction]);

  const targetVersions = versions.filter(
    (v) => v.id !== version.id && v.status !== "DRAFT",
  );

  const handleApprove = useCallback(
    () =>
      doAction("اعتماد", () =>
        approveFoundationVersion({ versionId: version.id }),
      ),
    [version.id, doAction],
  );

  const handleRelease = useCallback(
    () =>
      doAction("إطلاق", () =>
        generateFoundationRelease({
          versionId: version.id,
          versionNumber: version.versionNumber,
          releaseNotes: version.notes ?? undefined,
        }),
      ),
    [version.id, version.versionNumber, version.notes, doAction],
  );

  const handleActivate = useCallback(
    () =>
      doAction("تفعيل", () =>
        activateFoundationVersion({ versionId: version.id }),
      ),
    [version.id, doAction],
  );

  const handleDeprecate = useCallback(
    () =>
      doAction("إيقاف", () =>
        deprecateFoundationVersion({
          versionId: version.id,
          notes: "إيقاف يدوي",
        }),
      ),
    [version.id, doAction],
  );

  const handleExportStart = useCallback((format: string) => {
    setExportLoading(format);
    setActionMsg(null);
    setActionError(null);
  }, []);

  const handleExportError = useCallback((msg: string) => {
    setActionError(msg);
  }, []);

  const handleExportEnd = useCallback(() => {
    setExportLoading(null);
  }, []);

  return {
    actionMsg,
    actionError,
    loading,
    exportLoading,
    rollbackId,
    setRollbackId,
    rollbackReason,
    setRollbackReason,
    showRollback,
    setShowRollback,
    isAdmin,
    isOperator,
    isActive,
    targetVersions,
    doAction,
    handleRollback,
    handleApprove,
    handleRelease,
    handleActivate,
    handleDeprecate,
    handleExportStart,
    handleExportError,
    handleExportEnd,
  };
}
