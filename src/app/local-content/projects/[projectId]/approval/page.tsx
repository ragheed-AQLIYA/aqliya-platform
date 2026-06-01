import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
  listLocalContentApprovalsAction,
  listLocalContentReviewsAction,
  submitLocalContentApprovalAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  LocalContentStatusBadge,
} from "@/components/local-content/local-content-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApprovalPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projectRes, scoreRes, approvalsRes, reviewsRes] = await Promise.all([
    getLocalContentProjectAction(projectId),
    getLocalContentScoreAction(projectId),
    listLocalContentApprovalsAction(projectId),
    listLocalContentReviewsAction(projectId),
  ]);
  if (!projectRes.ok || !projectRes.data) notFound();

  const project = projectRes.data;
  const score = scoreRes.ok ? scoreRes.data : null;
  const approvals = approvalsRes.ok ? approvalsRes.data : [];
  const reviews = reviewsRes.ok ? reviewsRes.data : [];
  const lastReview = reviews[0];
  const lastApproval = approvals[0];
  const hasSubmittedReview = lastReview?.action === "submitted";
  const canSubmitApproval =
    project.status === "InReview" &&
    hasSubmittedReview &&
    !lastApproval;
  const isApproved = project.status === "Approved" || lastApproval?.decision === "approved";
  const isRejected = project.status === "Rejected" || lastApproval?.decision === "rejected";

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <PageHeader
          title="الاعتماد / Approval"
          subtitle="اعتماد تقييم المحتوى المحلي"
        />
        <LocalContentStatusBadge status={project.status} />
      </div>
      <DevPhaseBadge />

      {!lastReview && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="p-4 text-sm text-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            لا يمكن الاعتماد قبل إكمال المراجعة.{" "}
            <Link
              href={`/local-content/projects/${projectId}/review`}
              className="font-medium underline"
            >
              تقديم المراجعة أولاً
            </Link>
            .
          </CardContent>
        </Card>
      )}

      {lastReview && !hasSubmittedReview && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="p-4 text-sm text-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            آخر مراجعة ليست تقديماً للاعتماد. يجب تقديم مراجعة بحالة «تقديم
            للاعتماد» قبل الاعتماد.
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="p-4 text-sm text-green-900 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4 inline mr-1" />
            المشروع معتمد. حالة المشروع: Approved. يمكن توليد تقارير التصدير
            من{" "}
            <Link
              href={`/local-content/projects/${projectId}/reports`}
              className="font-medium underline"
            >
              صفحة التقارير
            </Link>
            .
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-4 text-sm text-red-900 dark:text-red-200">
            <XCircle className="h-4 w-4 inline mr-1" />
            المشروع مرفوض. حالة المشروع: Rejected. يمكن إعادة التقديم عبر{" "}
            <Link
              href={`/local-content/projects/${projectId}/review`}
              className="font-medium underline"
            >
              صفحة المراجعة
            </Link>
            .
          </CardContent>
        </Card>
      )}

      {score && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "نسبة المحتوى المحلي",
              value: `${score.localContentPercentage.toFixed(1)}%`,
              icon: ShieldCheck,
            },
            {
              label: "إجمالي الإنفاق",
              value: `${(score.totalSpend / 1000000).toFixed(1)}M`,
              icon: ShieldCheck,
            },
            {
              label: "تغطية الأدلة",
              value: `${score.evidenceStats.coveragePercentage.toFixed(0)}%`,
              icon: ShieldCheck,
            },
            { label: "حالة المشروع", value: project.status, icon: ShieldCheck },
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

      {canSubmitApproval && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">قرار الاعتماد</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              المشروع في حالة InReview مع مراجعة مقدمة. قرار الاعتماد بشري
              وموثّق.
            </p>
            <form
              action={async (formData: FormData) => {
                "use server";
                await submitLocalContentApprovalAction(projectId, formData);
              }}
            >
              <div className="space-y-3">
                <div>
                  <label htmlFor="decision" className="text-sm">
                    القرار
                  </label>
                  <select
                    id="decision"
                    name="decision"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                  >
                    <option value="approved">اعتماد — Approved</option>
                    <option value="rejected">رفض — Rejected</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="comments" className="text-sm">
                    ملاحظات المعتمد
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
                  تقديم الاعتماد
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {approvals.length > 0 ? (
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-semibold">سجل الاعتماد</h3>
          {approvals.map((a) => (
            <Card
              key={a.id}
              className={`p-3 ${a.decision === "approved" ? "border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/30" : "border-red-200 bg-red-50/30 dark:border-red-900 dark:bg-red-950/30"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {a.decision === "approved" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">{a.approverName}</span>
                  <Badge
                    variant="outline"
                    className={
                      a.decision === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {a.decision === "approved" ? "معتمد / Approved" : "مرفوض / Rejected"}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
              {a.comments && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {a.comments}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="p-4 text-sm text-red-900 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          هذا التقييم ليس شهادة امتثال نظامي. جميع القرارات بشرية وموثقة.
          LocalContentOS يساعد ولا يعتمد آلياً.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
