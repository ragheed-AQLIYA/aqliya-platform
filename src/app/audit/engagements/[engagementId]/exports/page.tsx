import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { getEngagement, getFinancialStatements } from "@/lib/audit/services";
import { getEngagementStatusLabel } from "@/lib/audit/workflow-next-action";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDownloadButton } from "@/components/audit/exports/export-download-button";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default async function ExportsPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const actor = await getAuditActor();
  await assertEngagementAccess(engagementId, actor);

  const [engagement, statements] = await Promise.all([
    getEngagement(actor.organizationId, engagementId),
    getFinancialStatements(engagementId),
  ]);

  if (!engagement) notFound();

  const hasStatements = statements.length > 0;
  const isApprovedOrPublished = ["approved", "published"].includes(
    engagement.status,
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold">التصدير</h1>
        <p className="text-sm text-muted-foreground">
          تصدير مخرجات التكليف بصيغ متاحة — المخرجات غير المعتمدة تُصنّف كمسودة
        </p>
      </div>

      {!isApprovedOrPublished && (
        <Card className="rounded-[24px] border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex gap-3 pt-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                مخرجات مسودة — مراجعة بشرية مطلوبة
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                التصدير متاح للمراجعة الداخلية فقط. لا يُعتبر تقريراً نهائياً أو
                معتمداً حتى يكتمل الاعتماد البشري.
              </p>
              <Link
                href={`/audit/engagements/${engagementId}/approval`}
                className="inline-flex text-xs font-medium text-amber-800 underline underline-offset-2 dark:text-amber-300"
              >
                الانتقال إلى خطوة الاعتماد
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {isApprovedOrPublished && (
        <Card className="rounded-[24px] border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950">
          <CardContent className="flex gap-3 pt-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                تكليف معتمد — مخرجات قابلة للمشاركة الداخلية
              </p>
              <p className="text-emerald-700 dark:text-emerald-400">
                تم اعتماد التكليف. المخرجات لا تزال تخضع لسياسات المؤسسة ولا
                تُعد رأياً تدقيقياً نهائياً خارج سياق AQLIYA.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-bold">البيانات المالية</h2>
        </div>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">PDF</p>
              <p className="text-xs text-muted-foreground">
                تقرير شامل للقوائم المالية والإيضاحات والنتائج
                {!isApprovedOrPublished && " (مسودة)"}
              </p>
            </div>
            <ExportDownloadButton
              label="PDF"
              filename={`audit-${engagement.fiscalPeriod}-${engagementId.substring(0, 8)}.pdf`}
              format="pdf"
              engagementId={engagementId}
              disabled={!hasStatements}
              isDraft={!isApprovedOrPublished}
              disabledReason={
                hasStatements ? undefined : "ولّد القوائم المالية أولاً"
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">XLSX</p>
              <p className="text-xs text-muted-foreground">
                جداول البيانات المالية بصيغة إكسل
                {!isApprovedOrPublished && " (مسودة)"}
              </p>
            </div>
            <ExportDownloadButton
              label="XLSX"
              filename={`audit-${engagement.fiscalPeriod}-${engagementId.substring(0, 8)}.xlsx`}
              format="xlsx"
              engagementId={engagementId}
              disabled={!hasStatements}
              isDraft={!isApprovedOrPublished}
              disabledReason={
                hasStatements ? undefined : "ولّد القوائم المالية أولاً"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-bold">مسودة مقابل معتمد</h2>
        </div>
        <CardContent className="space-y-3 pt-4 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                تصدير للمراجعة الداخلية (مسودة)
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
                <li>متاح قبل الاعتماد إذا وُجدت قوائم مالية</li>
                <li>للاستخدام الداخلي ومراجعة الفريق فقط</li>
                <li>لا يُعد تقريراً نهائياً أو معتمداً</li>
              </ul>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                تصدير بعد الاعتماد البشري
              </p>
              <ul className="mt-2 space-y-1 text-xs text-emerald-700 dark:text-emerald-400">
                <li>يتطلب اعتماداً بشرياً مسجّلاً في النظام</li>
                <li>مناسب للمشاركة الداخلية بعد الاعتماد</li>
                <li>لا يزال خاضعاً لسياسات المؤسسة — ليس رأياً خارجياً</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            فشل التصدير؟ تحقق من اكتمال القوائم المالية، صلاحياتك، وحالة الاتصال
            — ستظهر رسالة الخطأ بجانب زر التنزيل.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-bold">حالة المخرجات</h2>
        </div>
        <CardContent className="space-y-2 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">حالة التكليف</span>
            <span className="font-medium">
              {getEngagementStatusLabel(engagement.status)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">البيانات المالية</span>
            <span className="font-medium">
              {hasStatements ? `${statements.length} قائمة` : "غير متوفرة"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">نوع التقرير</span>
            <span className="font-medium">
              {isApprovedOrPublished ? "معتمد" : "مسودة — للمراجعة الداخلية"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">الحوكمة</span>
            <span className="font-medium">
              {isApprovedOrPublished
                ? "اعتماد بشري مسجّل"
                : "بانتظار الاعتماد البشري"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
