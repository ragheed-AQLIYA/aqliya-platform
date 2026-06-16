import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getWorkspaceAction,
  listTemplatesAction,
} from "../../actions";
import { ContentCreateForm } from "./content-create-form";

export const dynamic = "force-dynamic";

export default async function CreateContentPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  noStore();
  const { workspaceId } = await params;
  const [wsRes, templatesRes] = await Promise.all([
    getWorkspaceAction(workspaceId),
    listTemplatesAction(),
  ]);

  if (!wsRes.ok) notFound();
  const ws = wsRes.data;
  const templates = templatesRes.ok ? templatesRes.data : [];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link
        href={`/content-studio/${workspaceId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى {ws.name}
      </Link>

      <h1 className="text-2xl font-bold mb-1">محتوى جديد</h1>
      <p className="text-sm text-muted-foreground mb-6">
        أنشئ محتوى في مساحة العمل &quot;{ws.name}&quot;
      </p>

      <ContentCreateForm
        workspaceId={workspaceId}
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          bodyTemplate: t.bodyTemplate,
        }))}
      />
    </div>
  );
}
