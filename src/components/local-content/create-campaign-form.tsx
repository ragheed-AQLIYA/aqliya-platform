"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContentStudioCampaignAction } from "@/actions/local-content-workspace-actions";

export function CreateCampaignForm({
  contentProjectId,
}: {
  contentProjectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("contentProjectId", contentProjectId);
    try {
      const res = await createContentStudioCampaignAction(formData);
      if (res.ok) {
        router.refresh();
        router.push(`/local-content/campaigns/${res.data.id}`);
      } else {
        setError(res.error || "تعذر إنشاء الحملة");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إنشاء الحملة");
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
      <h3 className="font-semibold text-sm">حملة جديدة</h3>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="name">اسم الحملة</Label>
        <Input id="name" name="name" required dir="auto" />
      </div>
      <div>
        <Label htmlFor="objective">الهدف</Label>
        <Input id="objective" name="objective" dir="auto" />
      </div>
      <div>
        <Label htmlFor="channels">القنوات (مفصولة بفاصلة)</Label>
        <Input id="channels" name="channels" placeholder="linkedin, x, email" />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "جاري الإنشاء…" : "إنشاء حملة"}
      </Button>
    </form>
  );
}
