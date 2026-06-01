"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContentStudioOutputAction } from "@/actions/local-content-workspace-actions";

export function CreateContentOutputForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setError(null);
    const formData = new FormData(form);
    formData.set("campaignId", campaignId);
    try {
      const res = await createContentStudioOutputAction(formData);
      if (res.ok) {
        form.reset();
        router.push("/local-content/outputs?refresh=1");
        router.refresh();
      } else {
        setError(res.error || "تعذر إنشاء الحزمة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحزمة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onFormSubmit} className="border rounded-lg p-4 space-y-3 h-fit">
      <h3 className="font-semibold text-sm">حزمة مخرجات جديدة</h3>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="title">العنوان</Label>
        <Input id="title" name="title" required dir="auto" />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "جاري الإنشاء…" : "إنشاء حزمة"}
      </Button>
    </form>
  );
}
