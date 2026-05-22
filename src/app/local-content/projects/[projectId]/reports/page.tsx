import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
  listLocalContentReportsAction,
  generateLocalContentReportAction,
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
  FileBarChart,
  FileText,
  Table,
  AlertTriangle,
  ShieldCheck,
  History,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const REPORT_TYPES: { type: string; label: string; icon: React.ReactNode }[] = [
  {
    type: "assessment_summary",
    label: "ملخص تقييم المحتوى المحلي",
    icon: <FileBarChart className="h-5 w-5" />,
  },
  {
    type: "supplier_register",
    label: "سجل الموردين",
    icon: <Table className="h-5 w-5" />,
  },
  {
    type: "spend_classification",
    label: "تقرير تصنيف الإنفاق",
    icon: <Table className="h-5 w-5" />,
  },
  {
    type: "gap_risk",
    label: "سجل الفجوات والمخاطر",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    type: "evidence_index",
    label: "فهرس الأدلة",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: "final_package",
    label: "حزمة التصدير النهائية",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const REPORT_LABELS: Record<string, string> = {
  assessment_summary: "ملخص التقييم",
  supplier_register: "سجل الموردين",
  spend_classification: "تصنيف الإنفاق",
  gap_risk: "فجوات ومخاطر",
  evidence_index: "فهرس الأدلة",
  final_package: "حزمة نهائية",
};

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projectRes, scoreRes, reportsRes] = await Promise.all([
    getLocalContentProjectAction(projectId),
    getLocalContentScoreAction(projectId),
    listLocalContentReportsAction(projectId),
  ]);
  if (!projectRes.ok || !projectRes.data) notFound();

  const score = scoreRes.ok ? scoreRes.data : null;
  const reports = reportsRes.ok ? reportsRes.data : [];

  return (
    <DashboardLayout>
      <Link
        href={`/local-content/projects/${projectId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> العودة للمشروع
      </Link>
      <PageHeader
        title="التقارير والتصدير / Reports"
        subtitle="توليد وتصدير تقارير المحتوى المحلي"
      />
      <DevPhaseBadge />

      {score && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "نسبة المحتوى المحلي",
              value: `${score.localContentPercentage.toFixed(1)}%`,
            },
            {
              label: "تغطية الأدلة",
              value: `${score.evidenceStats.coveragePercentage.toFixed(0)}%`,
            },
            { label: "النتائج", value: `${score.findingStats.total}` },
            { label: "التقارير المولدة", value: `${reports.length}` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <div className="p-3 text-center">
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {REPORT_TYPES.map(({ type, label, icon }) => (
          <form
            key={type}
            action={async () => {
              "use server";
              await generateLocalContentReportAction(projectId, type, "pdf");
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
            >
              {icon}
              <span className="text-sm">{label}</span>
              <Badge variant="outline" className="text-[9px]">
                توليد
              </Badge>
            </Button>
          </form>
        ))}
      </div>

      {reports.length > 0 ? (
        <div className="space-y-2 mb-6">
          <h3 className="text-base font-semibold mb-2">التقارير المولدة</h3>
          {reports.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {REPORT_LABELS[r.reportType] || r.reportType}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {r.format}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/local-content/projects/${projectId}/reports/${r.id}/download`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                  >
                    تحميل
                  </a>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
              {r.disclaimer && (
                <details className="mt-1">
                  <summary className="text-[10px] text-muted-foreground cursor-pointer">
                    إخلاء المسؤولية
                  </summary>
                  <p className="text-[9px] text-muted-foreground mt-1 whitespace-pre-wrap">
                    {r.disclaimer}
                  </p>
                </details>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            لم يتم توليد أي تقارير بعد. اختر نوع التقرير أعلاه للبدء.
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
        <CardContent className="p-4 text-sm text-amber-900 dark:text-amber-200">
          التقارير المولدة هي تقارير منظمة وليست شهادات امتثال. تصدير الملفات
          (PDF/XLSX) قيد التطوير. حالياً، يتم حفظ التقارير كسجلات منظمة داخل
          النظام.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
