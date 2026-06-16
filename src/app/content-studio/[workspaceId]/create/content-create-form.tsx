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
import { createContentAction } from "../../actions";

interface TemplateOption {
  id: string;
  name: string;
  bodyTemplate: string;
}

export function ContentCreateForm({
  workspaceId,
  templates,
}: {
  workspaceId: string;
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [bodyTemplate, setBodyTemplate] = useState<string>("");

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setSelectedTemplate(templateId);
      const tpl = templates.find((t) => t.id === templateId);
      setBodyTemplate(tpl?.bodyTemplate ?? "");
    },
    [templates],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
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

      const result = await createContentAction(workspaceId, {
        title,
        body,
        summary,
        locale,
        tags,
        contentType,
        templateId: selectedTemplate || undefined,
      });

      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/content-studio/${workspaceId}`);
      router.refresh();
    },
    [workspaceId, selectedTemplate, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">العنوان *</label>
        <Input name="title" required placeholder="عنوان المحتوى" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">الملخص</label>
        <Textarea
          name="summary"
          placeholder="ملخص مختصر (اختياري)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">المحتوى *</label>
        <Textarea
          name="body"
          required
          placeholder={bodyTemplate || "محتوى النص..."}
          rows={10}
        />
        {selectedTemplate ? (
          <p className="text-xs text-muted-foreground">
            تم تطبيق قالب. استخدم <code>{`{{variable}}`}</code> داخل النص.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">اللغة</label>
          <Select name="locale" defaultValue="ar">
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
          <Select name="contentType" defaultValue="article">
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

      {templates.length > 0 ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">قالب (اختياري)</label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="اختر قالبًا" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">بدون قالب</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium">الوسوم (مفصولة بفاصلة)</label>
        <Input name="tags" placeholder="مثل: تقارير, مالية, ربع سنوي" />
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنشاء المحتوى
        </Button>
        <Link
          href={`/content-studio/${workspaceId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
