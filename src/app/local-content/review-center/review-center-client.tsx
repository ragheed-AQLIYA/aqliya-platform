"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  ReviewQueue,
  ReviewQueueItem,
} from "@/actions/localcontent-review-actions";

// ─── Props ───

interface ReviewCenterProps {
  initialQueue: ReviewQueue;
  organizationId: string;
  projectId?: string;
  workbookId?: string;
}

// ─── Type Badge Config ───

const typeConfig: Record<
  string,
  { label: string; color: string; border: string }
> = {
  explanation: {
    label: "تفسير / Explanation",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    border: "border-l-blue-500",
  },
  suggestion: {
    label: "اقتراح / Suggestion",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    border: "border-l-purple-500",
  },
  false_positive: {
    label: "إيجابية كاذبة / FP",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    border: "border-l-amber-500",
  },
};

// ─── Main Component ───

export function ReviewCenter({
  initialQueue,
  organizationId,
}: ReviewCenterProps) {
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
  // Filter items based on active tab
  const filteredItems =
    activeTab === "all"
      ? queue.items
      : queue.items.filter((item) => item.type === activeTab);

  // Clear status message after 5s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
  };

  // ── Review single item ──
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
    [reviewNotes, router],
  );

  // ── Bulk review ──
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
    [selected, filteredItems, reviewNotes, router],
  );

  // ── Toggle selection ──
  const toggleSelect = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [],
  );

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map((i) => i.id)));
    }
  }, [filteredItems, selected]);

  return (
    <div className="min-h-screen p-6" dir="rtl">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">مركز المراجعة</h1>
            <p className="text-sm text-muted-foreground">
              Review Center — Queued AI outputs awaiting human review
            </p>
          </div>
          <Link href="/local-content/ai-advisor">
            <Button variant="outline" size="sm">
              ← لوحة المستشار / Advisor Panel
            </Button>
          </Link>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-muted-foreground">
                إجمالي المعلقة / Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-3">
              <span className="text-xl font-bold">{queue.total}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-muted-foreground">
                تفسيرات / Explanations
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-3">
              <span className="text-xl font-bold text-blue-600">
                {queue.counts.explanations}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-muted-foreground">
                اقتراحات / Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-3">
              <span className="text-xl font-bold text-purple-600">
                {queue.counts.suggestions}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-muted-foreground">
                ذاكرة المنظمة / Org Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="py-1 px-3">
              <span className="text-xl font-bold text-green-600">
                {queue.stats.totalMemoryRecords}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* ── Status Message ── */}
        {statusMessage && (
          <div
            className={`rounded-md px-4 py-2 text-sm mb-4 ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* ── Bulk Review Bar ── */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 rounded-lg border bg-background p-3 mb-4 flex items-center gap-3 shadow-sm">
          <span className="text-sm font-medium">
            {selected.size} مختارة / selected
          </span>
          <Input
            placeholder="ملاحظات جماعية..."
            className="flex-1 h-8 text-sm"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkReview("approved")}
            disabled={processingIds.size > 0}
          >
            ✅ اعتماد الكل / Approve All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkReview("rejected")}
            disabled={processingIds.size > 0}
          >
            ❌ رفض الكل / Reject All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            إلغاء / Clear
          </Button>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            الكل / All ({queue.items.length})
          </TabsTrigger>
          <TabsTrigger value="explanation">
            تفسيرات ({queue.counts.explanations})
          </TabsTrigger>
          <TabsTrigger value="suggestion">
            اقتراحات ({queue.counts.suggestions})
          </TabsTrigger>
          <TabsTrigger value="false_positive">
            FP ({queue.counts.falsePositives})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Select All toggle ── */}
      {filteredItems.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="select-all"
            checked={selected.size === filteredItems.length && filteredItems.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
            تحديد الكل / Select All ({filteredItems.length})
          </label>
        </div>
      )}

      {/* ── Queue Items ── */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">لا توجد عناصر للمراجعة</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            All AI outputs have been reviewed. Run a new AI analysis to populate the queue.
          </p>
          <Link href="/local-content/ai-advisor" className="mt-4">
            <Button variant="outline">→ الذهاب للمستشار / Go to Advisor</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const cfg = typeConfig[item.type] ?? typeConfig.explanation;
            const isProcessing = processingIds.has(item.id);
            const isSelected = selected.has(item.id);

            return (
              <Card
                key={item.id}
                className={`border-l-4 ${cfg.border} ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-sm font-medium truncate">
                          {item.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-xs ${cfg.color}`}
                        >
                          {cfg.label}
                        </Badge>
                        {item.riskLevel && (
                          <Badge
                            variant={
                              item.riskLevel === "high"
                                ? "destructive"
                                : item.riskLevel === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.riskLevel === "high"
                              ? "عالي"
                              : item.riskLevel === "medium"
                                ? "متوسط"
                                : "منخفض"}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        <span className="font-mono">{item.workbookLineCode}</span>
                        {" · "}
                        <span>{item.detail.substring(0, 120)}</span>
                        {" · "}
                        <span className="text-muted-foreground">
                          {Math.round((Date.now() - item.createdAt.getTime()) / 86400000)}d ago
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="ملاحظات المراجعة..."
                      className="flex-1 h-8 text-sm"
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={isProcessing}
                    />
                    {item.type === "suggestion" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReview(item, "rejected")
                          }
                          disabled={isProcessing}
                        >
                          ❌ رفض / Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleReview(item, "approved")
                          }
                          disabled={isProcessing}
                        >
                          ✅ اعتماد / Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReview(item, "rejected")
                          }
                          disabled={isProcessing}
                        >
                          ❌ رفض / Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleReview(item, "confirmed")
                          }
                          disabled={isProcessing}
                        >
                          ✅ تأكيد / Confirm
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
