"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSalesInteractionAction,
  deleteSalesInteractionAction,
} from "@/actions/sales-actions";
import type { SalesInteractionView } from "@/lib/sales/interactions";

export const TYPE_OPTIONS = [
  { value: "call", label: "مكالمة" },
  { value: "email", label: "بريد" },
  { value: "meeting", label: "اجتماع" },
  { value: "note", label: "ملاحظة" },
  { value: "other", label: "أخرى" },
] as const;

export const ALL_TYPES_VALUE = "all";

export function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تسجيل التفاعل";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  return error || "تعذر تسجيل التفاعل";
}

export function formatTypeLabel(type: string): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useDealInteractionPanel(
  dealId: string,
  accountId: string,
  interactions: SalesInteractionView[],
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES_VALUE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredInteractions = useMemo(() => {
    if (typeFilter === ALL_TYPES_VALUE) return interactions;
    return interactions.filter((item) => item.type === typeFilter);
  }, [interactions, typeFilter]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("dealId", dealId);
    formData.set("accountId", accountId);

    try {
      const res = await createSalesInteractionAction(formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تسجيل التفاعل");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(interactionId: string) {
    if (!window.confirm("حذف هذا التفاعل؟")) return;
    setDeletingId(interactionId);
    setError(null);
    try {
      const res = await deleteSalesInteractionAction(interactionId);
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حذف التفاعل");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEditSaved() {
    setEditingId(null);
    router.refresh();
  }

  function handleEditError(message: string) {
    setError(message || "تعذر تحديث التفاعل");
  }

  return {
    loading,
    error,
    typeFilter,
    setTypeFilter,
    editingId,
    setEditingId,
    deletingId,
    filteredInteractions,
    handleSubmit,
    handleDelete,
    handleEditSaved,
    handleEditError,
  };
}
