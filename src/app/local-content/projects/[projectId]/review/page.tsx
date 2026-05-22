import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
  listLocalContentReviewsAction,
  submitLocalContentReviewAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projectRes, scoreRes, reviewsRes] = await Promise.all([
    getLocalContentProjectAction(projectId),
    getLocalContentScoreAction(projectId),
    listLocalContentReviewsAction(projectId),
  ]);
  if (!projectRes.ok || !projectRes.data) notFound();

  const project = projectRes.data;
  const score = scoreRes.ok ? scoreRes.data : null;
  const reviews = reviewsRes.ok ? reviewsRes.data : [];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="المراجعة / Review"
        subtitle="مراجعة تقييم المحتوى المحلي قبل الاعتماد"
      />
      <DevPhaseBadge />

      {score && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "نسبة المحتوى المحلي",
              value: `${score.localContentPercentage.toFixed(1)}%`,
              icon: ShieldCheck,
            },
            {
              label: "تغطية الأدلة",
              value: `${score.evidenceStats.coveragePercentage.toFixed(0)}%`,
              icon: FileText,
            },
            {
              label: "النتائج",
              value: `${score.findingStats.total}`,
              icon: AlertTriangle,
            },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <div className="p-3 text-center">
                <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {reviews.length === 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">لا توجد مراجعات بعد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              لم يتم تقديم أي مراجعة لهذا المشروع حتى الآن.
            </p>
            <form
              action={async (formData: FormData) => {
                "use server";
                await submitLocalContentReviewAction(projectId, formData);
              }}
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="action" className="text-sm">
                    قرار المراجعة
                  </label>
                  <select
                    id="action"
                    name="action"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="submitted">تقديم للاعتماد</option>
                    <option value="returned">إرجاع للتعديل</option>
                    <option value="commented">تعليق فقط</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="comments" className="text-sm">
                    ملاحظات المراجع
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تقديم المراجعة
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 mb-6">
          {reviews.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{r.reviewerName}</span>
                  <Badge variant="outline">
                    {r.action === "submitted"
                      ? "مقدم"
                      : r.action === "returned"
                        ? "مرتجع"
                        : r.action}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50">
                    {r.status === "in_review"
                      ? "قيد المراجعة"
                      : r.status === "completed"
                        ? "مكتمل"
                        : r.status}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
              {r.comments && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.comments}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardContent className="p-4 text-sm text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          المراجعة خطوة بشرية حوكمية. الذكاء الاصطناعي لا يتخذ قرار المراجعة.
          جميع إجراءات المراجعة مسجلة في سجل التدقيق.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
