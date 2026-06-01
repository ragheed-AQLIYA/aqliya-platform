"use client";

import { useTransition } from "react";
import { createContentStudioCampaignAction } from "@/actions/local-content-workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProjectOption = { id: string; title: string };

export function CampaignCreateForm({
  projects,
}: {
  projects: ProjectOption[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mb-6 rounded-lg border p-4 space-y-3"
      action={(fd) => {
        startTransition(() => {
          void createContentStudioCampaignAction(fd);
        });
      }}
    >
      <h3 className="font-semibold text-sm">إنشاء حملة محتوى</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="contentProjectId">مشروع المحتوى</Label>
          <Select name="contentProjectId" required>
            <SelectTrigger id="contentProjectId">
              <SelectValue placeholder="اختر المشروع" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">اسم الحملة</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="objective">الهدف</Label>
          <Input id="objective" name="objective" />
        </div>
        <div>
          <Label htmlFor="channels">القنوات (مفصولة بفاصلة)</Label>
          <Input id="channels" name="channels" placeholder="linkedin, x, email" />
        </div>
      </div>
      <Button type="submit" disabled={pending || projects.length === 0}>
        {pending ? "جاري الإنشاء..." : "إنشاء حملة"}
      </Button>
    </form>
  );
}
