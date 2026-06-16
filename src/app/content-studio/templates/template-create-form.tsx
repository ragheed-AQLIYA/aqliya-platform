"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTemplateAction } from "../actions";

export function TemplateCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const form = new FormData(e.currentTarget);
      const name = form.get("name") as string;
      const bodyTemplate = form.get("bodyTemplate") as string;
      const description = (form.get("description") as string) || undefined;
      const category = (form.get("category") as string) || undefined;

      const result = await createTemplateAction({
        name,
        bodyTemplate,
        description,
        category,
      });
      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
      (e.target as HTMLFormElement).reset();
    },
    [router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">الاسم *</label>
        <Input name="name" required placeholder="اسم القالب" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">الوصف</label>
        <Input name="description" placeholder="وصف القالب" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">التصنيف</label>
        <Input name="category" placeholder="مثل: تقارير، مستندات" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">نص القالب *</label>
        <Textarea
          name="bodyTemplate"
          required
          placeholder={`محتوى النص مع {{متغير}}...`}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          استخدم <code>{`{{variable}}`}</code> للحقول المتغيرة
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        إنشاء قالب
      </Button>
    </form>
  );
}
