"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { generateFoundationDiff } from "@/actions/knowledge-foundation/actions";

export type Version = { id: string; versionNumber: string };

export interface AddedRule {
  phrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
}

export interface ModifiedRule {
  phrase: string;
  canonicalCode: string;
  category: string;
  oldConfidence: number;
  newConfidence: number;
}

export interface RemovedRule {
  phrase: string;
  canonicalCode: string;
  category: string;
  confidence: number;
}

export interface DiffData {
  fromVersionId: string;
  toVersionId: string;
  fromVersionNumber: string;
  toVersionNumber: string;
  addedRules: AddedRule[];
  modifiedRules: ModifiedRule[];
  removedRules: RemovedRule[];
  breakingChange: boolean;
  riskScore: number;
  summary: string;
}

export function useDiffViewer() {
  const router = useRouter();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(async () => {
    if (!fromId || !toId) {
      setError("الرجاء اختيار إصدارين للمقارنة");
      return;
    }
    if (fromId === toId) {
      setError("لا يمكن مقارنة الإصدار بنفسه");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateFoundationDiff({
        fromVersionId: fromId,
        toVersionId: toId,
      });
      setDiff(result);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء المقارنة",
      );
    } finally {
      setLoading(false);
    }
  }, [fromId, toId, router]);

  return { fromId, setFromId, toId, setToId, diff, loading, error, handleCompare };
}
