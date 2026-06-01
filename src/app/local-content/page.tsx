import { unstable_noStore as noStore } from "next/cache";
import { listLocalContentProjectsAction } from "@/actions/localcontent-actions";
import { getContentStudioSummaryAction } from "@/actions/local-content-workspace-actions";
import {
  DashboardLayout,
  PageHeader,
  ProjectList,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { ContentStudioNav } from "@/components/local-content/content-studio-nav";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ShieldCheck, Megaphone, ClipboardCheck, Package } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LocalContentDashboardPage() {
  noStore();
  const [res, studioRes] = await Promise.all([
    listLocalContentProjectsAction(),
    getContentStudioSummaryAction(),
  ]);
  const projects = res.ok ? res.data : [];
  const studio = studioRes.ok ? studioRes.data : null;

  return (
    <DashboardLayout>
      <PageHeader
        title="LocalContentOS"
        subtitle="مركز القيادة — امتثال المحتوى المحلي + Content Studio"
      />
      <DevPhaseBadge />
      <ContentStudioNav />

      {!res.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل ملخص المشاريع"
          description={
            res.error || "حدث خطأ أثناء تحميل مشاريع المحتوى المحلي."
          }
        />
      ) : null}

      {!studioRes.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل ملخص Content Studio"
          description={studioRes.error}
        />
      ) : null}

      {studio ? (
        <>
          <h2 className="text-sm font-semibold mb-3">Content Studio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "الحملات",
                value: studio.campaignCount,
                icon: Megaphone,
                href: "/local-content/campaigns",
              },
              {
                label: "قائمة المراجعة",
                value: studio.reviewQueueCount,
                icon: ClipboardCheck,
                href: "/local-content/review",
                hint:
                  studio.reviewQueueCount > 0
                    ? "عناصر بانتظار المراجعة"
                    : undefined,
              },
              {
                label: "المصادر",
                value: studio.sourceCount,
                icon: FileText,
                href: "/local-content/campaigns",
                hint:
                  studio.verifiedSourceCount > 0
                    ? `${studio.verifiedSourceCount} موثّق`
                    : undefined,
              },
              {
                label: "المخرجات الجاهزة",
                value: studio.outputReadyCount,
                icon: Package,
                href: "/local-content/outputs?refresh=1",
                hint:
                  studio.approvalQueueCount > 0
                    ? `${studio.approvalQueueCount} بانتظار الاعتماد`
                    : undefined,
              },
            ].map(({ label, value, icon: Icon, href, hint }) => (
              <Link key={label} href={href}>
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {hint ? (
                      <p className="text-[10px] text-muted-foreground/80 mt-1">
                        {hint}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : null}
      <h2 className="text-sm font-semibold mb-3">مشاريع الامتثال (Prisma)</h2>
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

      {res.ok && projects.length === 0 ? (
        <EmptyState
          title="لا توجد مشاريع امتثال"
          description="لم يتم إنشاء أي مشروع تقييم محتوى محلي بعد. ابدأ من مشاريع الامتثال أو Content Studio."
          actionHref="/local-content/projects"
          actionLabel="إنشاء مشروع امتثال"
        />
      ) : res.ok ? (
        <ProjectList projects={projects} />
      ) : null}

      <div className="mt-8 p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
        مسار الامتثال: الموردين، الإنفاق، الأدلة، التصنيف، النتائج، المراجعة،
        الاعتماد، التقارير. مسار Content Studio: مشروع → حملة → مصادر → مسودة →
        مراجعة → موافقة → مخرجات. لا نشر تلقائي.
      </div>
    </DashboardLayout>
  );
}
