"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContentStudioItemAction } from "@/actions/local-content-workspace-actions";

export function CampaignContentItemForm({ campaignId }: { campaignId: string }) {
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
      const res = await createContentStudioItemAction(formData);
      if (res.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(res.error || "تعذر إنشاء العنصر");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء العنصر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="border rounded-lg p-4 space-y-3" onSubmit={onFormSubmit}>
      <h3 className="font-semibold text-sm">عنصر محتوى جديد</h3>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="title">الفكرة / العنوان</Label>
        <Input id="title" name="title" required dir="auto" />
      </div>
      <div>
        <Label htmlFor="format">الصيغة</Label>
        <Input id="format" name="format" defaultValue="article" />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "جاري الإنشاء…" : "إنشاء"}
      </Button>
    </form>
  );
}