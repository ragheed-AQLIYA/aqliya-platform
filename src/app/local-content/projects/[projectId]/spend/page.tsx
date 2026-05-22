import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  listLocalContentSpendRecordsAction,
  listLocalContentSuppliersAction,
  createLocalContentSpendRecordAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  EmptyState,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import { SpendForm } from "@/components/local-content/spend-form";
import { CsvImportForm } from "@/components/local-content/csv-import-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  technology: "تقنية",
  goods: "سلع",
  services: "خدمات",
  construction: "إنشاءات",
  logistics: "لوجستي",
};

export default async function SpendPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const [spendRes, suppliersRes] = await Promise.all([
    listLocalContentSpendRecordsAction(projectId),
    listLocalContentSuppliersAction(projectId),
  ]);
  const spendRecords = spendRes.ok ? spendRes.data : [];
  const suppliers = suppliersRes.ok ? suppliersRes.data : [];
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const totalSpend = spendRecords.reduce((sum, s) => sum + s.amount, 0);

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="سجلات الإنفاق / Spend Records"
        subtitle={`${spendRecords.length} سجل — إجمالي ${totalSpend.toLocaleString("ar-SA")} SAR`}
      />
      <DevPhaseBadge />

      <div className="flex items-center gap-2 mb-4">
        <SpendForm
          projectId={projectId}
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
          createAction={createLocalContentSpendRecordAction}
        />
        <CsvImportForm projectId={projectId} />
      </div>

      {spendRecords.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات إنفاق"
          description="أضف أول سجل إنفاق للمشروع."
        />
      ) : (
        <div className="space-y-1">
          {spendRecords.map((s) => {
            const supplier = s.supplier;
            return (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate">
                      {supplier?.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {s.contractReference && `${s.contractReference} | `}
                      {s.period}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">
                      {s.amount.toLocaleString("ar-SA")} {s.currency}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                      {CATEGORY_LABELS[s.category] || s.category}
                    </Badge>
                  </div>
                </div>
                {s.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
