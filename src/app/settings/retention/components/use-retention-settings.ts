"use client";

import { useCallback, useEffect, useState } from "react";
import type { DryRunResult, Hold, Policy, RunHistory } from "./types";

export function useRetentionSettings() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [history, setHistory] = useState<RunHistory[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [dryRunResults, setDryRunResults] = useState<DryRunResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"policies" | "holds" | "history">("policies");

  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editDays, setEditDays] = useState(0);
  const [editAction, setEditAction] = useState<"delete" | "archive" | "anonymize">("delete");
  const [editEnabled, setEditEnabled] = useState(true);

  const [newHoldType, setNewHoldType] = useState("");
  const [newHoldId, setNewHoldId] = useState("");
  const [newHoldReason, setNewHoldReason] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [policiesRes, historyRes, holdsRes] = await Promise.all([
        fetch("/api/platform/retention/policies"),
        fetch("/api/platform/retention/history"),
        fetch("/api/platform/retention/holds"),
      ]);

      if (policiesRes.ok) {
        const data = (await policiesRes.json()) as { policies: Policy[] };
        setPolicies(data.policies);
      }
      if (historyRes.ok) {
        const data = (await historyRes.json()) as { history: RunHistory[] };
        setHistory(data.history);
      }
      if (holdsRes.ok) {
        const data = (await holdsRes.json()) as { holds: Hold[] };
        setHolds(data.holds);
      }
    } catch {
      setError("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setDryRunResults(null);
    try {
      const res = await fetch("/api/platform/retention/run", { method: "POST" });
      if (res.ok) {
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في تشغيل سياسات الاحتفاظ");
      }
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setRunning(false);
    }
  }

  async function handleDryRun() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = (await res.json()) as { results: DryRunResult[] };
        setDryRunResults(data.results);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في تشغيل المعاينة");
      }
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setRunning(false);
    }
  }

  async function handleSavePolicy(modelName: string) {
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName,
          retentionDays: editDays,
          action: editAction,
          enabled: editEnabled,
        }),
      });
      if (res.ok) {
        setEditingModel(null);
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في حفظ السياسة");
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleResetPolicy(modelName: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/platform/retention/policies?modelName=${encodeURIComponent(modelName)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleAddHold() {
    if (!newHoldType || !newHoldId || !newHoldReason) return;
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType: newHoldType,
          recordId: newHoldId,
          reason: newHoldReason,
        }),
      });
      if (res.ok) {
        setNewHoldType("");
        setNewHoldId("");
        setNewHoldReason("");
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في إضافة التعليق");
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleRemoveHold(holdId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/platform/retention/holds/${holdId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  function startEdit(policy: Policy) {
    setEditingModel(policy.modelName);
    setEditDays(policy.retentionDays);
    setEditAction(policy.action);
    setEditEnabled(policy.enabled);
  }

  const totalDryRecords =
    dryRunResults?.reduce((s, r) => s + r.recordsFound, 0) ?? 0;

  return {
    policies,
    history,
    holds,
    dryRunResults,
    loading,
    running,
    error,
    activeTab,
    editingModel,
    editDays,
    editAction,
    editEnabled,
    newHoldType,
    newHoldId,
    newHoldReason,
    totalDryRecords,
    fetchData,
    handleRun,
    handleDryRun,
    handleSavePolicy,
    handleResetPolicy,
    handleAddHold,
    handleRemoveHold,
    startEdit,
    setEditingModel,
    setEditDays,
    setEditAction,
    setEditEnabled,
    setNewHoldType,
    setNewHoldId,
    setNewHoldReason,
    setError,
    setActiveTab,
  };
}
