"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  submitConversionMemoAction,
  upsertConversionMemoAction,
} from "@/actions/sales-actions";
import { formatActionError } from "./deal-conversion-memo-constants";

export function useDealConversionMemo(dealId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await upsertConversionMemoAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ المذكرة");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(markDecided: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitConversionMemoAction(dealId, markDecided);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إرسال المذكرة");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    loading,
    submitting,
    error,
    setError,
    handleSave,
    handleSubmit,
  };
}
