import {
  listLocalContentProjectsAction,
  getLocalContentScoreAction,
} from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  ProjectList,
  EmptyState,
  DevPhaseBadge,
} from "@/components/local-content/local-content-shell";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, Users, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LocalContentDashboardPage() {
  const res = await listLocalContentProjectsAction();
  const projects = res.ok ? res.data : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="LocalContentOS"
        subtitle="نظام المحتوى المحلي — المنتج الاستراتيجي الثاني"
      />
      <DevPhaseBadge />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "المشاريع", value: projects.length, icon: FileText },
          {
            label: "قيد المراجعة",
            value: projects.filter(
              (p: { status: string }) => p.status === "InReview",
            ).length,
            icon: ShieldCheck,
          },
          {
            label: "معتمد",
            value: projects.filter(
              (p: { status: string }) => p.status === "Approved",
            ).length,
            icon: ShieldCheck,
          },
          {
            label: "مسودة",
            value: projects.filter(
              (p: { status: string }) => p.status === "Draft",
            ).length,
            icon: FileText,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="لا توجد مشاريع"
          description="لم يتم إنشاء أي مشروع تقييم محتوى محلي بعد."
        />
      ) : (
        <ProjectList projects={projects} />
      )}

      <div className="mt-8 p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
        جميع صفحات المشروع متاحة حالياً: الموردين، الإنفاق، الأدلة، التصنيف،
        النتائج، المراجعة، الاعتماد، التقارير، وسجل التدقيق.
      </div>
    </DashboardLayout>
  );
}
