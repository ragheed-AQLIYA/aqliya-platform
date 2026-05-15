import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedRecommendationViewAction } from "@/actions/decisions"
import { format } from "date-fns"

function getSourceBadge(source: string) {
  switch (source) {
    case "approved_snapshot":
      return <Badge className="bg-green-600">لقطة معتمدة</Badge>
    case "legacy":
      return <Badge variant="secondary">توصية سابقة</Badge>
    default:
      return <Badge variant="outline">التوصية الحالية</Badge>
  }
}

export default async function PublishedRecommendationPage({
  params,
}: {
  params: Promise<{ decisionId: string }>
}) {
  const { decisionId } = await params
  if (!decisionId) notFound()
  const result = await getPublishedRecommendationViewAction(decisionId)

  if (!result.success || !result.data?.recommendation) {
    notFound()
  }

  const recommendation = result.data.recommendation
  const title = result.data.title
  const contentSource = result.data.contentSource || "current_recommendation"
  const snapshotMetadata = result.data.snapshotMetadata

  return (
    <main className="mx-auto max-w-4xl p-8" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>التوصية المنشورة</CardTitle>
              <CardDescription>{title}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getSourceBadge(contentSource)}
              <Badge variant="secondary">v{recommendation.publishedVersion}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {contentSource === "approved_snapshot" && snapshotMetadata && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">بيانات الاعتماد</h2>
              <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm">
                <p className="font-medium text-green-800">هذا المحتوى من لقطة معتمدة غير قابلة للتعديل.</p>
                <p className="mt-1 text-green-700">
                  المعتمِد: {snapshotMetadata.approver || "غير معروف"}
                </p>
                <p className="text-green-700">
                  تاريخ الاعتماد:{" "}
                  {snapshotMetadata.approvedAt
                    ? format(new Date(snapshotMetadata.approvedAt), "PPp")
                    : "غير متاح"}
                </p>
                {snapshotMetadata.confidence != null && (
                  <p className="text-green-700">
                    الثقة: {Math.round(snapshotMetadata.confidence * 100)}%
                  </p>
                )}
                {snapshotMetadata.score != null && (
                  <p className="text-green-700">
                    النتيجة: {snapshotMetadata.score.toFixed(1)}
                  </p>
                )}
                {snapshotMetadata.conditions && (
                  <p className="mt-1 text-amber-700">
                    الشروط: {snapshotMetadata.conditions}
                  </p>
                )}
              </div>
            </section>
          )}

          {contentSource === "legacy" && (
            <section className="space-y-2">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
                <p className="font-medium text-amber-800">توصية سابقة</p>
                <p className="mt-1 text-amber-700">
                  نُشرت هذه التوصية قبل تطبيق اللقطات غير القابلة للتعديل. قد يكون المحتوى قد تغير منذ الاعتماد.
                </p>
              </div>
            </section>
          )}

          {contentSource === "current_recommendation" && (
            <section className="space-y-2">
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-800">التوصية الحالية</p>
                <p className="mt-1 text-blue-700">
                  هذه هي التوصية الحالية. لم تُستخدم لقطة معتمدة غير قابلة للتعديل في هذا النشر.
                </p>
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">الإجراء الموصى به</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.recommendedAction}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">المبرّر</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.rationale}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">الحالة التالية المتوقّعة</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.expectedNextState}
            </div>
          </section>

          {recommendation.scopeExclusions && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">استثناءات النطاق</h2>
              <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
                {recommendation.scopeExclusions}
              </div>
            </section>
          )}

          {recommendation.assumptionsUsed && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">الافتراضات المستخدمة</h2>
              <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
                {recommendation.assumptionsUsed}
              </div>
            </section>
          )}

          {recommendation.risksAccepted && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">المخاطر المقبولة</h2>
              <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
                {recommendation.risksAccepted}
              </div>
            </section>
          )}

          {recommendation.risksRejected && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">المخاطر المرفوضة</h2>
              <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
                {recommendation.risksRejected}
              </div>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">بيانات النشر</h2>
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              <p>مصدر المحتوى: {contentSource === "approved_snapshot" ? "لقطة معتمدة غير قابلة للتعديل" : contentSource === "legacy" ? "توصية سابقة" : "التوصية الحالية"}</p>
              <p>الإصدار المنشور: {recommendation.publishedVersion}</p>
              {recommendation.publishedFromSnapshot && (
                <p className="text-green-700">نُشر من لقطة معتمدة: نعم</p>
              )}
              <p>
                تاريخ النشر:{" "}
                {recommendation.publishedAt
                  ? format(new Date(recommendation.publishedAt), "PPp")
                  : "غير متاح"}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
