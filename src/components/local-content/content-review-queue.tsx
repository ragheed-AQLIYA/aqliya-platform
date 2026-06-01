"use client";

import {
  completeContentStudioReviewAction,
  approveContentStudioItemAction,
} from "@/actions/local-content-workspace-actions";
import type { ContentItem } from "@/lib/local-content/content/types";
import { EmptyState, InlineNotice } from "@/components/local-content/local-content-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  initialQueue: ContentItem[];
  initialError?: string;
};

export function ContentReviewQueue({ initialQueue, initialError }: Props) {
  if (initialError) {
    return <InlineNotice variant="error" title="خطأ" description={initialError} />;
  }

  if (initialQueue.length === 0) {
    return (
      <EmptyState
        title="قائمة المراجعة فارغة"
        description="أرسل عناصر المحتوى من صفحة الحملة بعد المساعدة على المسودة. لا نشر تلقائي — الموافقة البشرية مطلوبة."
        actionHref="/local-content/campaigns"
        actionLabel="الانتقال إلى الحملات"
      />
    );
  }

  return (
    <div className="space-y-4">
      {initialQueue.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.format} · {item.status}
                </p>
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>

            <form
              action={async (fd) => {
                await completeContentStudioReviewAction(fd);
              }}
              className="border-t pt-3 space-y-2"
            >
              <input type="hidden" name="contentItemId" value={item.id} />
              <input type="hidden" name="status" value="approved" />
              <p className="text-xs font-medium">أبعاد المراجعة</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  ["sourceGrounding", "ت grounded بالمصادر"],
                  ["brand", "العلامة"],
                  ["compliance", "الامتثال"],
                  ["factualClaims", "الادعاءات"],
                  ["languageQuality", "اللغة"],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-1">
                    <input type="checkbox" name={name} />
                    {label}
                  </label>
                ))}
              </div>
              <Label className="text-xs">ملاحظات</Label>
              <textarea
                name="notes"
                className="w-full text-sm border rounded p-2 min-h-[60px]"
                dir="auto"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  تسجيل مراجعة
                </Button>
              </div>
            </form>

            <div className="flex gap-2 mt-3 border-t pt-3">
              <form
                action={async () => {
                  await approveContentStudioItemAction(
                    item.id,
                    true,
                    "Approved via review queue",
                  );
                }}
              >
                <Button type="submit" size="sm" variant="default">
                  موافقة (ADMIN)
                </Button>
              </form>
              <form
                action={async () => {
                  await approveContentStudioItemAction(
                    item.id,
                    false,
                    "Changes requested",
                  );
                }}
              >
                <Button type="submit" size="sm" variant="outline">
                  طلب تعديلات
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
