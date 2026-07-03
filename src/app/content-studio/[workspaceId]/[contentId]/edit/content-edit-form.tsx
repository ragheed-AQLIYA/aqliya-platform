"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateContentAction, deleteContentAction } from "../../../actions";

interface TemplateOption {
  id: string;
  name: string;
  bodyTemplate: string;
}

interface InitialData {
  title: string;
  body: string;
  summary: string;
  locale: string;
  contentType: string;
  tags: string;
}

export function ContentEditForm({
  contentId,
  workspaceId,
  initialData,
  templates,
}: {
  contentId: string;
  workspaceId: string;
  initialData: InitialData;
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      const form = new FormData(e.currentTarget);
      const title = form.get("title") as string;
      const body = form.get("body") as string;
      const summary = (form.get("summary") as string) || undefined;
      const locale = (form.get("locale") as string) || "ar";
      const contentType = (form.get("contentType") as string) || "article";
      const tagsRaw = (form.get("tags") as string) || "";
      const tags = tagsRaw
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);

      const result = await updateContentAction(contentId, {
        title,
        body,
        summary,
        locale,
        tags,
        contentType,
      });

      setSaving(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/content-studio/${workspaceId}/${contentId}`);
      router.refresh();
    },
    [contentId, workspaceId, router],
  );

  const handleDelete = useCallback(async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المحتوى؟")) return;
    setDeleting(true);
    setError(null);
    const result = await deleteContentAction(contentId);
    setDeleting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/content-studio/${workspaceId}`);
    router.refresh();
  }, [contentId, workspaceId, router]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">العنوان *</label>
        <Input
          name="title"
          required
          defaultValue={initialData.title}
          placeholder="عنوان المحتوى"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">الملخص</label>
        <Textarea
          name="summary"
          defaultValue={initialData.summary}
          placeholder="ملخص مختصر (اختياري)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">المحتوى *</label>
        <Textarea
          name="body"
          required
          defaultValue={initialData.body}
          placeholder="محتوى النص..."
          rows={12}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اللغة</label>
          <Select name="locale" defaultValue={initialData.locale}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">نوع المحتوى</label>
          <Select name="contentType" defaultValue={initialData.contentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">مقال</SelectItem>
              <SelectItem value="report">تقرير</SelectItem>
              <SelectItem value="document">مستند</SelectItem>
              <SelectItem value="news">خبر</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">الوسوم (مفصولة بفاصلة)</label>
        <Input
          name="tags"
          defaultValue={initialData.tags}
          placeholder="مثل: تقارير, مالية, ربع سنوي"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            حفظ التغييرات
          </Button>
          <Link
            href={`/content-studio/${workspaceId}/${contentId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            إلغاء
          </Link>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          حذف المحتوى
        </Button>
      </div>
    </form>
  );
}
