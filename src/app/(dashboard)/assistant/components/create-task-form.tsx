"use client";
import { createOfficeAiTaskAction } from "@/actions/office-ai-actions";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateTaskFormProps {
  workspaces: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

const TASK_TYPES = [
  { value: "document_summary", label: "Document Summary / تلخيص" },
  { value: "excel_analysis", label: "Excel Analysis / تحليل" },
  { value: "report_draft", label: "Report Draft / تقرير" },
  { value: "presentation_outline", label: "Presentation Outline / عرض" },
  { value: "executive_summary", label: "Executive Summary / تنفيذي" },
  { value: "meeting_notes", label: "Meeting Notes / اجتماع" },
];

export function CreateTaskForm({ workspaces, projects }: CreateTaskFormProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">New Task / مهمة جديدة</CardTitle>
        <CardDescription>Create a new AI-assisted office task</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createOfficeAiTaskAction} className="space-y-4">
          <div>
            <Label htmlFor="taskType">Task Type / نوع المهمة</Label>
            <select
              id="taskType"
              name="taskType"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Select...</option>
              {TASK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="language">Language / اللغة</Label>
            <select
              id="language"
              name="language"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="ar">Arabic / العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <Label htmlFor="clientWorkspaceId">Workspace / مساحة العمل</Label>
            <select
              id="clientWorkspaceId"
              name="clientWorkspaceId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">None / بدون</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="projectId">Project / المشروع</Label>
            <select
              id="projectId"
              name="projectId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">None / بدون</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="title">Title / العنوان</Label>
            <Input id="title" name="title" placeholder="e.g., Summarize Q3 report" />
          </div>
          <div>
            <Label htmlFor="instructions">Instructions / التعليمات</Label>
            <textarea
              id="instructions"
              name="instructions"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              placeholder="Context, key points, or instructions for the AI..."
            />
          </div>
          <Button type="submit" className="w-full">Create Task / إنشاء مهمة</Button>
        </form>
      </CardContent>
    </Card>
  );
}
