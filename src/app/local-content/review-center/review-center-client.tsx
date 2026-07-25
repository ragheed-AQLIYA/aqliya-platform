"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  ReviewQueue,
  ReviewQueueItem,
} from "@/actions/localcontent-review-actions";
import { useReviewCenter } from "./use-review-center";
import { ReviewHeader } from "./components/review-header";
import { BulkReviewBar } from "./components/bulk-review-bar";
import { ReviewQueueItemCard } from "./components/review-queue-item";
import { AuditEvents } from "./components/audit-events";

interface AuditEventItem {
  id: string;
  action: string;
  status: string;
  confidence?: number;
  durationMs: number;
  createdAt: string;
}

interface ReviewCenterProps {
  initialQueue: ReviewQueue;
  organizationId: string;
  projectId?: string;
  workbookId?: string;
  auditEventCount?: number;
  recentAuditEvents?: AuditEventItem[];
}

export function ReviewCenter({
  initialQueue,
  auditEventCount = 0,
  recentAuditEvents = [],
}: ReviewCenterProps) {
  const {
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
  } = useReviewCenter(initialQueue);

  const handleExport = async () => {
    setExporting(true);
    try {
      const mod = await import("@/actions/localcontent-review-export");
      const res = await mod.exportReviewSummaryPdfAction();
      if (res.success && res.data) {
        const binaryStr = atob(res.data.base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: res.data.contentType });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = res.data.filename;
        a.click();
        URL.revokeObjectURL(url);
        showStatus("success", "✅ تم تصدير التقرير بنجاح");
      } else {
        showStatus("error", res.error || "فشل التصدير");
      }
    } catch {
      showStatus("error", "فشل تصدير التقرير");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <ReviewHeader
        queue={queue}
        auditEventCount={auditEventCount}
        exporting={exporting}
        onExport={handleExport}
        statusMessage={statusMessage}
      />

      <BulkReviewBar
        selectedCount={selected.size}
        reviewNotes={reviewNotes}
        onReviewNotesChange={setReviewNotes}
        onApprove={() => handleBulkReview("approved")}
        onReject={() => handleBulkReview("rejected")}
        onClear={() => setSelected(new Set())}
        processing={processingIds.size > 0}
      />

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
          {filteredItems.map((item) => (
            <ReviewQueueItemCard
              key={item.id}
              item={item}
              isSelected={selected.has(item.id)}
              isProcessing={processingIds.has(item.id)}
              reviewNotes={reviewNotes}
              onToggleSelect={toggleSelect}
              onReviewNotesChange={setReviewNotes}
              onReview={handleReview}
            />
          ))}
        </div>
      )}

      <AuditEvents events={recentAuditEvents} />
    </div>
  );
}
