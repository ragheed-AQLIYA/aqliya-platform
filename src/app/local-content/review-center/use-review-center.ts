"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ReviewQueue,
  ReviewQueueItem,
} from "@/actions/localcontent-review-actions";

export interface ReviewCenterState {
  queue: ReviewQueue;
  activeTab: string;
  selected: Set<string>;
  reviewNotes: string;
  processingIds: Set<string>;
  statusMessage: { type: "success" | "error"; text: string } | null;
  exporting: boolean;
  filteredItems: ReviewQueueItem[];
}

export function useReviewCenter(initialQueue: ReviewQueue) {
  const router = useRouter();
  const [queue] = useState<ReviewQueue>(initialQueue);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reviewNotes, setReviewNotes] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  const filteredItems =
    activeTab === "all"
      ? queue.items
      : queue.items.filter((item) => item.type === activeTab);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showStatus = useCallback(
    (type: "success" | "error", text: string) => {
      setStatusMessage({ type, text });
    },
    [],
  );

  const handleReview = useCallback(
    async (item: ReviewQueueItem, decision: string) => {
      setProcessingIds((prev) => new Set(prev).add(item.id));
      setStatusMessage(null);

      try {
        if (item.type === "suggestion") {
          const mod = await import(
            "@/actions/localcontent-review-actions"
          );
          const res = await mod.reviewSuggestionAction(
            item.id,
            decision as "approved" | "rejected",
            reviewNotes || `Reviewed via review center: ${decision}`,
          );
          if (!res.success)
            throw new Error(res.error || "Review failed");
        } else {
          const mod = await import(
            "@/actions/localcontent-review-actions"
          );
          const res = await mod.reviewExplanationAction(
            item.id,
            decision as "confirmed" | "rejected",
            reviewNotes || `Reviewed via review center: ${decision}`,
          );
          if (!res.success)
            throw new Error(res.error || "Review failed");
        }

        showStatus("success", `✅ ${item.title} — ${decision}`);
        router.refresh();
      } catch (err) {
        showStatus(
          "error",
          `❌ ${err instanceof Error ? err.message : "Something went wrong"}`,
        );
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [reviewNotes, router, showStatus],
  );

  const handleBulkReview = useCallback(
    async (decision: string) => {
      if (selected.size === 0) return;
      setStatusMessage(null);

      const items = filteredItems.filter((item) => selected.has(item.id));
      const types = [...new Set(items.map((i) => i.type))];
      const decisionType = types.length === 1 ? types[0] : "mixed";

      try {
        const mod = await import(
          "@/actions/localcontent-review-actions"
        );
        const res = await mod.batchReviewAction(
          decisionType === "suggestion" ? "suggestion" : "explanation",
          Array.from(selected),
          decision as "approved" | "rejected",
          reviewNotes || `Bulk review: ${decision}`,
        );

        if (res.success) {
          showStatus("success", `✅ Bulk review complete: ${res.processed} processed`);
        } else {
          showStatus("error", `⚠️ ${res.errors} errors, ${res.processed} processed`);
        }

        setSelected(new Set());
        router.refresh();
      } catch (err) {
        showStatus(
          "error",
          `❌ ${err instanceof Error ? err.message : "Bulk review failed"}`,
        );
      }
    },
    [selected, filteredItems, reviewNotes, router, showStatus],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map((i) => i.id)));
    }
  }, [filteredItems, selected]);

  return {
    queue,
    activeTab,
    setActiveTab,
    selected,
    setSelected,
    reviewNotes,
    setReviewNotes,
    processingIds,
    statusMessage,
    exporting,
    setExporting,
    filteredItems,
    showStatus,
    handleReview,
    handleBulkReview,
    toggleSelect,
    toggleSelectAll,
  } as const;
}
