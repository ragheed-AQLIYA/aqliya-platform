"use client";

import { useTransition } from "react";
import {
  approveContentStudioItemAction,
  completeContentStudioReviewAction,
  draftAssistContentItemAction,
  submitContentStudioReviewAction,
} from "@/actions/local-content-workspace-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContentItem } from "@/lib/local-content/content/types";

export function ContentReviewPanel({ items }: { items: ContentItem[] }) {
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">لا توجد عناصر في قائمة المراجعة.</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{item.title}</h3>
            <Badge variant="outline">{item.status}</Badge>
          </div>
          {item.body ? (
            <pre className="text-xs whitespace-pre-wrap bg-muted p-3 rounded max-h-40 overflow-auto">
              {item.body.slice(0, 800)}
            </pre>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  void draftAssistContentItemAction(item.id);
                })
              }
            >
              مساعدة صياغة (AI)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  void submitContentStudioReviewAction(item.id);
                })
              }
            >
              إرسال للمراجعة
            </Button>
          </div>
          <form
            className="grid gap-2 border-t pt-3"
            action={(fd) => {
              startTransition(() => {
                void completeContentStudioReviewAction(fd);
              });
            }}
          >
            <input type="hidden" name="contentItemId" value={item.id} />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="sourceGrounding" /> تغطية المصادر
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="brand" /> الهوية
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="compliance" /> الامتثال
            </label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" name="status" value="approved" type="submit">
                اعتماد مراجعة
              </Button>
              <Button
                size="sm"
                variant="outline"
                name="status"
                value="changes_requested"
                type="submit"
              >
                طلب تعديلات
              </Button>
            </div>
          </form>
          {item.status === "in_review" ? (
            <div className="flex gap-2 border-t pt-3">
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void approveContentStudioItemAction(item.id, true);
                  })
                }
              >
                موافقة نهائية (ADMIN)
              </Button>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
