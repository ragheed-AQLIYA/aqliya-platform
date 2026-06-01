"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContentStudioSourceAction } from "@/actions/local-content-workspace-actions";

export function CampaignContentSourceForm({ campaignId }: { campaignId: string }) {
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
      const res = await createContentStudioSourceAction(formData);
      if (res.ok) {
        form.reset();
        router.refresh();
      } else {
        setError(res.error || "تعذر إضافة المصدر");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إضافة المصدر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="border rounded-lg p-4 space-y-3" onSubmit={onFormSubmit}>
      <h3 className="font-semibold text-sm">مصدر / دليل</h3>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="src-title">العنوان</Label>
        <Input id="src-title" name="title" required dir="auto" />
      </div>
      <div>
        <Label htmlFor="type">النوع</Label>
        <Input id="type" name="type" defaultValue="url" />
      </div>
      <div>
        <Label htmlFor="url">الرابط</Label>
        <Input id="url" name="url" dir="ltr" />
      </div>
      <Button type="submit" disabled={loading} size="sm" variant="outline">
        {loading ? "جاري الإضافة…" : "إضافة مصدر"}
      </Button>
    </form>
  );
}