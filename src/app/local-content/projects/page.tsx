import { listLocalContentProjectsAction } from "@/actions/localcontent-actions";
import {
  DashboardLayout,
  PageHeader,
  ProjectList,
  EmptyState,
  DevPhaseBadge,
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
      <ProjectCreateForm />
      {projects.length === 0 ? (
        <EmptyState
          title="لا توجد مشاريع"
          description="لم يتم إنشاء أي مشروع تقييم محتوى محلي بعد."
        />
      ) : (
        <ProjectList projects={projects} />
      )}
    </DashboardLayout>
  );
}
