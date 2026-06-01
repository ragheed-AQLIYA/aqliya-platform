"use client";

import { useTransition } from "react";
import { createContentStudioProjectAction } from "@/actions/local-content-workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContentProjectCreateForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mb-6 rounded-lg border p-4 space-y-3"
      action={(fd) => {
        startTransition(() => {
          void createContentStudioProjectAction(fd);
        });
      }}
    >
      <h3 className="font-semibold text-sm">إنشاء مشروع محتوى</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="title">العنوان</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="language">اللغة</Label>
          <Input id="language" name="language" defaultValue="ar" />
        </div>
        <div>
          <Label htmlFor="objective">الهدف</Label>
          <Input id="objective" name="objective" />
        </div>
        <div>
          <Label htmlFor="audience">الجمهور</Label>
          <Input id="audience" name="audience" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "جاري الإنشاء..." : "إنشاء مشروع محتوى"}
      </Button>
    </form>
  );
}
