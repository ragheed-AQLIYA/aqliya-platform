import Link from "next/link";
import {
  completeContentStudioReviewFormAction,
  approveContentStudioItemFormAction,
} from "@/actions/local-content-workspace-actions";
import type { ContentItem } from "@/lib/local-content/content/types";
import { EmptyState } from "@/components/local-content/local-content-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type Props = {
  initialQueue: ContentItem[];
  initialError?: string;
};

export function ContentReviewQueue({ initialQueue, initialError }: Props) {
  if (initialError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {initialError}
      </p>
    );
  }

  if (initialQueue.length === 0) {
    return (
      <EmptyState
        title="قائمة المراجعة فارغة"
        description="أرسل عناصر المحتوى من صفحة الحملة بعد مساعدة المسودة. العناصر ذات الحالة in_review تظهر هنا للمراجعة البشرية."
        actionHref="/local-content/campaigns"
        actionLabel="الانتقال إلى الحملات"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {initialQueue.length} عنصر في قائمة المراجعة
      </p>
      {initialQueue.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.format} · {item.status}
                </p>
                {item.campaignId ? (
                  <Link
                    href={`/local-content/campaigns/${item.campaignId}`}
                    className="text-xs text-primary underline mt-1 inline-block"
                  >
                    عرض الحملة
                  </Link>
                ) : null}
              </div>
              <Badge variant="outline">{item.status}</Badge>
            </div>

            <form
              action={completeContentStudioReviewFormAction}
              className="border-t pt-3 space-y-2"
            >
              <input type="hidden" name="contentItemId" value={item.id} />
              <input type="hidden" name="status" value="approved" />
              <p className="text-xs font-medium">أبعاد المراجعة</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  ["sourceGrounding", "مرتبط بالمصادر"],
                  ["brand", "العلامة"],
                  ["compliance", "الامتثال"],
                  ["factualClaims", "الادعاءات"],
                  ["languageQuality", "اللغة"],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-1">
                    <input type="checkbox" name={name} defaultChecked />
                    {label}
                  </label>
                ))}
              </div>
              <Label className="text-xs">ملاحظات</Label>
              <textarea
                name="notes"
                className="w-full text-sm border rounded p-2 min-h-[60px]"
                dir="auto"
                defaultValue="L6 smoke review dimensions verified"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground"
                >
                  تسجيل مراجعة
                </button>
              </div>
            </form>

            <div className="flex gap-2 mt-3 border-t pt-3">
              <form action={approveContentStudioItemFormAction}>
                <input type="hidden" name="contentItemId" value={item.id} />
                <input type="hidden" name="approved" value="true" />
                <input
                  type="hidden"
                  name="notes"
                  value="Approved via L6 smoke"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-primary text-primary-foreground"
                >
                  موافقة (ADMIN)
                </button>
              </form>
              <form action={approveContentStudioItemFormAction}>
                <input type="hidden" name="contentItemId" value={item.id} />
                <input type="hidden" name="approved" value="false" />
                <input type="hidden" name="notes" value="Changes requested" />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border bg-background"
                >
                  طلب تعديلات
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
