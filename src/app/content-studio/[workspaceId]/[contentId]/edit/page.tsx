import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  getContentAction,
  listTemplatesAction,
} from "../../../actions";
import { ContentEditForm } from "./content-edit-form";

export const dynamic = "force-dynamic";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ workspaceId: string; contentId: string }>;
}) {
  noStore();
  const { workspaceId, contentId } = await params;
  const [contentRes, templatesRes] = await Promise.all([
    getContentAction(contentId),
    listTemplatesAction(),
  ]);

  if (!contentRes.ok) notFound();
  const content = contentRes.data;
  const templates = templatesRes.ok ? templatesRes.data : [];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link
        href={`/content-studio/${workspaceId}/${contentId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى &quot;{content.title}&quot;
      </Link>

      <h1 className="text-2xl font-bold mb-1">تعديل المحتوى</h1>
      <p className="text-sm text-muted-foreground mb-6">
        تعديل &quot;{content.title}&quot; — الإصدار {content.version}
      </p>

      <ContentEditForm
        contentId={contentId}
        workspaceId={workspaceId}
        initialData={{
          title: content.title,
          body: content.body,
          summary: content.summary ?? "",
          locale: content.locale ?? "ar",
          contentType: content.contentType ?? "article",
          tags: Array.isArray(content.tags) ? content.tags.join(", ") : "",
        }}
        templates={templates.map((t: { id: string; name: string; bodyTemplate: string }) => ({
          id: t.id,
          name: t.name,
          bodyTemplate: t.bodyTemplate,
        }))}
      />
    </div>
  );
}
