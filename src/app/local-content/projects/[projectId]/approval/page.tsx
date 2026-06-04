import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
  listLocalContentApprovalsAction,
  listLocalContentReviewsAction,
  getLocalContentApprovalRoutingAction,
  submitLocalContentApprovalAction,
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
  const [projectRes, scoreRes, approvalsRes, reviewsRes, routingRes] =
    await Promise.all([
      getLocalContentProjectAction(projectId),
      getLocalContentScoreAction(projectId),
      listLocalContentApprovalsAction(projectId),
      listLocalContentReviewsAction(projectId),
      getLocalContentApprovalRoutingAction(projectId),
    ]);
  if (!projectRes.ok || !projectRes.data) notFound();

  const project = projectRes.data;
  const score = scoreRes.ok ? scoreRes.data : null;
  const approvals = approvalsRes.ok ? approvalsRes.data : [];
  const reviews = reviewsRes.ok ? reviewsRes.data : [];
  const routing = routingRes.ok ? routingRes.data : null;
  const canApprove = routing?.canSubmitApproval ?? false;
  const lastApproval = approvals[0];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="الاعتماد / Approval"
        subtitle="اعتماد تقييم المحتوى المحلي"
      />
      <DevPhaseBadge />

      {routing && (
        <Card className="mb-6">
          <CardContent className="p-4 text-sm">
            <p className="flex items-center gap-2 flex-wrap">
              مسار الاعتماد:
              <Badge variant="outline">{routing.phase}</Badge>
              <Badge variant="outline">
                {routing.distinctSubmitters}/{routing.requiredReviewers} مراجعين
              </Badge>
            </p>
            {routing.blockReason && !canApprove && (
              <p className="mt-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {routing.blockReason}
              </p>
            )}
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
            { label: "الحالة", value: project.status, icon: ShieldCheck },
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

      {canApprove && !lastApproval && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">قرار الاعتماد</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <option value="approved">اعتماد</option>
                    <option value="rejected">رفض</option>
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
                    {a.decision === "approved" ? "معتمد" : "مرفوض"}
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
