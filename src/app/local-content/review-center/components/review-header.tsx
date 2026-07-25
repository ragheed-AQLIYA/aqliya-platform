"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewQueue } from "@/actions/localcontent-review-actions";

interface ReviewHeaderProps {
  queue: ReviewQueue;
  auditEventCount: number;
  exporting: boolean;
  onExport: () => void;
  statusMessage: { type: "success" | "error"; text: string } | null;
}

export function ReviewHeader({
  queue,
  auditEventCount,
  exporting,
  onExport,
  statusMessage,
}: ReviewHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">مركز المراجعة</h1>
          <p className="text-sm text-muted-foreground">
            Review Center — Queued AI outputs awaiting human review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={onExport}
          >
            {exporting ? "جاري التصدير..." : "📄 تصدير ملخص PDF"}
          </Button>
          <Link href="/local-content/ai-advisor">
            <Button variant="outline" size="sm">
              ← لوحة المستشار / Advisor Panel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
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
        <Card>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs text-muted-foreground">
              أحداث التدقيق / Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent className="py-1 px-3">
            <span className="text-xl font-bold text-amber-600">
              {auditEventCount}
            </span>
          </CardContent>
        </Card>
      </div>

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
  );
}
