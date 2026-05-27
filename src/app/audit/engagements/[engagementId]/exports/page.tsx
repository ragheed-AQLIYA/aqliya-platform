import { notFound } from "next/navigation";
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { getEngagement, getFinancialStatements } from "@/lib/audit/services";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDownloadButton } from "@/components/audit/exports/export-download-button";

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
          تصدير مخرجات التكليف بصيغ متاحة
        </p>
      </div>

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
              </p>
            </div>
            <ExportDownloadButton
              label="PDF"
              filename={`audit-${engagement.fiscalPeriod}-${engagementId.substring(0, 8)}.pdf`}
              format="pdf"
              engagementId={engagementId}
              disabled={!hasStatements}
              disabledReason={
                hasStatements ? undefined : "أكمل تصنيف الحسابات أولاً"
              }
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">XLSX</p>
              <p className="text-xs text-muted-foreground">
                جداول البيانات المالية بصيغة إكسل
              </p>
            </div>
            <ExportDownloadButton
              label="XLSX"
              filename={`audit-${engagement.fiscalPeriod}-${engagementId.substring(0, 8)}.xlsx`}
              format="xlsx"
              engagementId={engagementId}
              disabled={!hasStatements}
              disabledReason={
                hasStatements ? undefined : "أكمل تصنيف الحسابات أولاً"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-bold">حالة المخرجات</h2>
        </div>
        <CardContent className="space-y-2 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">حالة التكليف</span>
            <span className="font-medium">{engagement.status}</span>
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
              {isApprovedOrPublished ? "نهائي" : "مسودة"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
