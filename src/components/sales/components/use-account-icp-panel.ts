"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readAccountIcpScore } from "@/lib/sales/icp-types";
import {
  recalculateAccountIcpScoreAction,
  setAccountIcpReviewedAction,
} from "@/actions/sales-actions";

export function formatAssessedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تحديث تقييم ICP";
}

export function useAccountIcpPanel(
  accountId: string,
  metadata: unknown,
  canUpdate: boolean,
) {
  const router = useRouter();
  const assessment = readAccountIcpScore(metadata);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecalculate() {
    setLoading(true);
    setError(null);
    try {
      const res = await recalculateAccountIcpScoreAction(accountId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إعادة حساب ICP");
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewToggle(checked: boolean) {
    setReviewLoading(true);
    setError(null);
    try {
      const res = await setAccountIcpReviewedAction(accountId, checked);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحديث حالة المراجعة");
    } finally {
      setReviewLoading(false);
    }
  }

  return {
    assessment,
    loading,
    reviewLoading,
    error,
    handleRecalculate,
    handleReviewToggle,
  };
}
