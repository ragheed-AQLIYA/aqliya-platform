"use client";

import { useState } from "react";
import type { RiskFlag } from "@/actions/contact-actions";

export function useRiskFlags(contactId: string, initialFlags: RiskFlag[]) {
  const [flags, setFlags] = useState<RiskFlag[]>(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("compliance");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const activeFlags = flags.filter((f) => !f.resolvedAt);
  const resolvedFlags = flags.filter((f) => f.resolvedAt);

  async function handleAdd() {
    if (!description.trim()) return;
    setLoading("add");
    setError("");
    try {
      const { addContactRiskFlag } = await import("@/actions/contact-actions");
      const newFlag = await addContactRiskFlag(contactId, {
        type: type as RiskFlag["type"],
        severity: severity as RiskFlag["severity"],
        description: description.trim(),
      });
      if (newFlag && "data" in newFlag) {
        setFlags((prev) => [...prev, newFlag.data as RiskFlag]);
      }
      setDescription("");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إضافة العلم");
    } finally {
      setLoading(null);
    }
  }

  async function handleResolve(flagId: string) {
    setLoading(`resolve-${flagId}`);
    try {
      const { resolveContactRiskFlag } = await import("@/actions/contact-actions");
      await resolveContactRiskFlag(contactId, flagId);
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flagId ? { ...f, resolvedAt: new Date().toISOString() } : f,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حل العلم");
    } finally {
      setLoading(null);
    }
  }

  return {
    flags,
    loading,
    showForm,
    setShowForm,
    type,
    setType,
    severity,
    setSeverity,
    description,
    setDescription,
    error,
    activeFlags,
    resolvedFlags,
    handleAdd,
    handleResolve,
  };
}
