"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeDealObjectionAction } from "@/actions/sales-actions";
import { formatActionError } from "./follow-up-constants";

export function useDealObjectionAnalysis(dealId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"interaction" | "paste">("paste");
  const [interactionId, setInteractionId] = useState<string>("");
  const [pastedText, setPastedText] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeDealObjectionAction(dealId, {
        interactionId: mode === "interaction" ? interactionId || null : null,
        pastedText: mode === "paste" ? pastedText.trim() || null : null,
      });
      if (res.ok) {
        setPastedText("");
        setInteractionId("");
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحليل الاعتراض");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    mode,
    interactionId,
    pastedText,
    setMode,
    setInteractionId,
    setPastedText,
    handleAnalyze,
  };
}
