import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentAuditEventsAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  EmptyState,
} from "@/components/local-content/local-content-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  User,
  FileText,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "project.created": "إنشاء مشروع",
  "project.updated": "تحديث مشروع",
  "supplier.created": "إضافة مورد",
  "supplier.updated": "تحديث مورد",
  "spend.created": "إضافة إنفاق",
  "spend.imported": "استيراد إنفاق",
  "classification.created": "تصنيف",
  "classifications.completed": "اكتمال التصنيف",
  "evidence.uploaded": "رفع دليل",
  "evidence.status_updated": "تحديث دليل",
  "finding.created": "إضافة نتيجة",
  "review.submitted": "تقديم مراجعة",
  "review.returned": "إرجاع مراجعة",
  "approval.decided": "قرار اعتماد",
  "report.generated": "توليد تقرير",
};

export default async function AuditTrailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const eventsRes = await listLocalContentAuditEventsAction(projectId);
  const events = eventsRes.ok ? eventsRes.data : [];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="سجل التدقيق / Audit Trail"
        subtitle={`${events.length} حدث تدقيقي`}
      />
      <DevPhaseBadge />

      {events.length === 0 ? (
        <EmptyState
          title="لا توجد أحداث تدقيقية"
          description="لم يتم تسجيل أي حدث تدقيقي لهذا المشروع بعد."
        />
      ) : (
        <div className="space-y-1">
          {events.map((e) => (
            <Card key={e.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <History className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-muted/50"
                      >
                        {ACTION_LABELS[e.action] || e.action}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {e.entityType} {e.entityId.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <User className="h-3 w-3" />
                    {e.actorName || e.actorId}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("ar-SA")}
                  </div>
                </div>
              </div>
              {e.metadata && (
                <details className="mt-1">
                  <summary className="text-[10px] text-muted-foreground cursor-pointer">
                    بيانات إضافية
                  </summary>
                  <pre className="text-[9px] text-muted-foreground mt-1 whitespace-pre-wrap">
                    {JSON.stringify(e.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
