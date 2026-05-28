import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
  listLocalContentReportsAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportGenerationButton } from "@/components/local-content/report-generation-button";
import Link from "next/link";
import {
  ArrowLeft,
  FileBarChart,
  FileText,
  Table,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const REPORT_TYPES: {
  type: string;
  label: string;
  format: "pdf" | "xlsx";
  icon: React.ReactNode;
}[] = [
  {
    type: "assessment_summary",
    label: "ملخص تقييم المحتوى المحلي",
    format: "pdf",
    icon: <FileBarChart className="h-5 w-5" />,
  },
  {
    type: "supplier_register",
    label: "سجل الموردين",
    format: "pdf",
    icon: <Table className="h-5 w-5" />,
  },
  {
    type: "spend_classification",
    label: "تقرير تصنيف الإنفاق",
    format: "xlsx",
    icon: <Table className="h-5 w-5" />,
  },
  {
    type: "gap_risk",
    label: "سجل الفجوات والمخاطر",
    format: "pdf",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    type: "evidence_index",
    label: "فهرس الأدلة",
    format: "xlsx",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: "final_package",
    label: "حزمة التصدير للمراجعة",
    format: "pdf",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const REPORT_LABELS: Record<string, string> = {
  assessment_summary: "ملخص التقييم",
  supplier_register: "سجل الموردين",
  spend_classification: "تصنيف الإنفاق",
  gap_risk: "فجوات ومخاطر",
  evidence_index: "فهرس الأدلة",
  final_package: "حزمة التصدير للمراجعة",
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

  const project = projectRes.data;
  const score = scoreRes.ok ? scoreRes.data : null;
  const reports = reportsRes.ok ? reportsRes.data : [];
  const reportsError = reportsRes.ok
    ? null
    : reportsRes.error || "تعذر تحميل التقارير المولدة.";
  const scoreError = scoreRes.ok
    ? null
    : scoreRes.error || "تعذر تحميل مؤشرات الجاهزية للتصدير.";

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

      <InlineNotice
        variant="warning"
        title="مخرجات التصدير الحالية ليست اعتمادًا نهائيًا"
        description="كل ملف يتم توليده هنا يعكس بيانات المشروع الحالية وقت الطلب. التوليد لا يساوي اعتمادًا مؤسسيًا نهائيًا، وما يزال يتطلب مراجعة بشرية صريحة قبل استخدامه كحزمة رسمية أو مرجعية."
      />

      {project.status !== "Approved" ? (
        <InlineNotice
          variant="info"
          title="المشروع ليس في حالة اعتماد نهائي بعد"
          description="يمكنك توليد ملفات تشغيلية ومسوّدات للمراجعة، لكن يجب عدم اعتبارها حزمة معتمدة طالما أن حالة المشروع الحالية ليست معتمدة."
        />
      ) : null}

      {scoreError ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل مؤشرات التصدير"
          description={scoreError}
        />
      ) : null}

      {reportsError ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل سجل التقارير المولدة"
          description={reportsError}
        />
      ) : null}

      {score && !scoreError && (
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
        {REPORT_TYPES.map(({ type, label, format, icon }) => (
          <ReportGenerationButton
            key={type}
            projectId={projectId}
            type={type}
            label={label}
            format={format}
            icon={icon}
          />
        ))}
      </div>

      {!reportsError && reports.length > 0 ? (
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
                    {r.format.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
                  >
                    مراجعة بشرية مطلوبة
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-muted">
                    غير معتمد
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/local-content/projects/${projectId}/reports/${r.id}/download`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                  >
                    تحميل الملف الحالي
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
      ) : !reportsError ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            لم يتم توليد أي تقارير بعد. اختر نوع التقرير أعلاه للبدء.
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="p-4 text-sm text-blue-900 dark:text-blue-200">
          <p className="font-semibold mb-1">ملاحظات التصدير</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              ملفات PDF تُبنى عند التحميل من بيانات المشروع الحالية داخل النظام.
            </li>
            <li>
              ملفات XLSX تتضمن بيانات تشغيلية وتحليلية لمزيد من المراجعة
              الداخلية.
            </li>
            <li>
              كل ملف هنا مسودة تشغيلية ولا يمثل شهادة امتثال أو اعتمادًا
              نهائيًا.
            </li>
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
