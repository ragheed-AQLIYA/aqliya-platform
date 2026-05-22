import { notFound } from "next/navigation";
import {
  getLocalContentProjectAction,
  getLocalContentScoreAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  DevPhaseBadge,
  LocalContentStatusBadge,
} from "@/components/local-content/local-content-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Users,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  Upload,
  ClipboardCheck,
  FileBarChart,
  History,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectRes = await getLocalContentProjectAction(projectId);
  if (!projectRes.ok || !projectRes.data) notFound();

  const project = projectRes.data;
  const scoreRes = await getLocalContentScoreAction(projectId);
  const score = scoreRes.ok ? scoreRes.data : null;

  const totalSpend = score?.totalSpend ?? 0;

  return (
    <DashboardLayout>
      <div dir="rtl">
        <Link
          href="/local-content"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> العودة للمشاريع
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{project.name}</h1>
            <LocalContentStatusBadge status={project.status} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {project.reportingPeriod} | {project.scopeDescription || "بدون وصف"}
        </p>

        <DevPhaseBadge />

        {score && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "إجمالي الإنفاق",
                value: `${(totalSpend / 1000000).toFixed(1)}M SAR`,
                icon: TrendingUp,
              },
              {
                label: "نسبة المحتوى المحلي",
                value: `${score.localContentPercentage.toFixed(1)}%`,
                icon: BarChart3,
              },
              {
                label: "الموردين",
                value: `${score.supplierCounts.local} محلي / ${score.supplierCounts.total}`,
                icon: Users,
              },
              {
                label: "تغطية الأدلة",
                value: `${score.evidenceStats.coveragePercentage.toFixed(0)}%`,
                icon: ShieldCheck,
              },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="p-3 text-center">
                  <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "الموردين",
              href: `/local-content/projects/${projectId}/suppliers`,
              icon: Users,
              count: project.suppliers?.length ?? 0,
            },
            {
              label: "الإنفاق",
              href: `/local-content/projects/${projectId}/spend`,
              icon: FileText,
              count: project.spendRecords?.length ?? 0,
            },
            {
              label: "الأدلة",
              href: `/local-content/projects/${projectId}/evidence`,
              icon: Upload,
              count: project.evidence?.length ?? 0,
            },
            {
              label: "التصنيف",
              href: `/local-content/projects/${projectId}/classification`,
              icon: BarChart3,
              count: project.classifications?.length ?? 0,
            },
            {
              label: "النتائج",
              href: `/local-content/projects/${projectId}/findings`,
              icon: AlertTriangle,
              count: project.findings?.length ?? 0,
            },
            {
              label: "المراجعة",
              href: `/local-content/projects/${projectId}/review`,
              icon: ClipboardCheck,
              count: project.reviews?.length ?? 0,
            },
            {
              label: "الاعتماد",
              href: `/local-content/projects/${projectId}/approval`,
              icon: ShieldCheck,
              count: project.approvals?.length ?? 0,
            },
            {
              label: "التقارير",
              href: `/local-content/projects/${projectId}/reports`,
              icon: FileBarChart,
              count: project.reports?.length ?? 0,
            },
            {
              label: "سجل التدقيق",
              href: `/local-content/projects/${projectId}/audit-trail`,
              icon: History,
            },
          ].map(({ label, href, icon: Icon, count }) => (
            <Link key={label} href={href!}>
              <Card className="p-4 text-center hover:border-primary transition-colors">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-sm font-medium">{label}</p>
                {count !== undefined && (
                  <p className="text-xs text-muted-foreground">{count}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
