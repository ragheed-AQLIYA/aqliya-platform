import { listLocalContentProjectsAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  ProjectList,
  EmptyState,
  DevPhaseBadge,
  InlineNotice,
} from "@/components/local-content/local-content-shell";
import { ProjectCreateForm } from "@/components/local-content/project-create-form";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const res = await listLocalContentProjectsAction();
  const projects = res.ok ? res.data : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="المشاريع / Projects"
        subtitle="مشاريع تقييم المحتوى المحلي"
      />
      <DevPhaseBadge />

      {!res.ok ? (
        <InlineNotice
          variant="error"
          title="تعذر تحميل المشاريع"
          description={res.error || "حدث خطأ أثناء تحميل قائمة المشاريع."}
        />
      ) : null}

      <ProjectCreateForm />

      {res.ok && projects.length === 0 ? (
        <EmptyState
          title="لا توجد مشاريع"
          description="لم يتم إنشاء أي مشروع تقييم محتوى محلي بعد."
        />
      ) : res.ok ? (
        <ProjectList projects={projects} />
      ) : null}
    </DashboardLayout>
  );
}
