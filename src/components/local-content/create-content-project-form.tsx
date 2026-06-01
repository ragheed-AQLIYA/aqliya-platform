"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContentStudioProjectAction } from "@/actions/local-content-workspace-actions";

export function CreateContentProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await createContentStudioProjectAction(formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error || "تعذر إنشاء المشروع");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء المشروع");
    } finally {
      setLoading(false);
    }
  }

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await handleSubmit(new FormData(e.currentTarget));
  }

  return (
    <form className="space-y-3 border rounded-lg p-4" onSubmit={onFormSubmit}>
      <h3 className="font-semibold text-sm">مشروع محتوى جديد</h3>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="title">العنوان</Label>
        <Input id="title" name="title" required dir="auto" />
      </div>
      <div>
        <Label htmlFor="objective">الهدف</Label>
        <Input id="objective" name="objective" dir="auto" />
      </div>
      <div>
        <Label htmlFor="audience">الجمهور</Label>
        <Input id="audience" name="audience" dir="auto" />
      </div>
      <div>
        <Label htmlFor="language">اللغة</Label>
        <Input id="language" name="language" defaultValue="ar" />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "جاري الإنشاء…" : "إنشاء مشروع"}
      </Button>
    </form>
  );
}
