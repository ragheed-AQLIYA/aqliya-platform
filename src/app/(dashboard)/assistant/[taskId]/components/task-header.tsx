"use client";

import { Bot, Edit3, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface TaskHeaderProps {
  title: string | null;
  taskType: string;
  language: string;
  createdByName: string | null;
  createdAt: string | Date;
  workspaceName: string | null;
  projectName: string | null;
  isArchived: boolean;
  instructions: string | null;
  onUpdateTask: (formData: FormData) => Promise<void>;
}

export function TaskHeader({
  title,
  taskType,
  language,
  createdByName,
  createdAt,
  workspaceName,
  projectName,
  isArchived,
  instructions,
  onUpdateTask,
}: TaskHeaderProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onUpdateTask(new FormData(e.currentTarget));
  };

  return (
    <>
      <Link
        href="/assistant"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assistant
      </Link>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{title || taskType}</h1>
          <Badge variant="outline" className="text-[10px]">{taskType}</Badge>
        </div>
        {!isArchived && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </summary>
            <form
              onSubmit={handleSubmit}
              className="mt-3 p-3 rounded-md border bg-muted/30 space-y-3 w-80"
            >
              <div>
                <Label htmlFor="edit-title" className="text-[10px]">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={title || ""}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <Label htmlFor="edit-instructions" className="text-[10px]">
                  Instructions
                </Label>
                <textarea
                  id="edit-instructions"
                  name="instructions"
                  rows={2}
                  defaultValue={instructions || ""}
                  className="flex w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background"
                />
              </div>
              <div>
                <Label htmlFor="edit-language" className="text-[10px]">
                  Language
                </Label>
                <select
                  id="edit-language"
                  name="language"
                  defaultValue={language}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Button type="submit" size="sm" className="text-xs w-full">
                Save Changes
              </Button>
            </form>
          </details>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {language === "ar" ? "Arabic" : "English"}
        {createdByName && ` — by ${createdByName}`}
        {` — ${new Date(createdAt).toLocaleDateString("en-SA")}`}
        {workspaceName && ` — ${workspaceName}`}
        {projectName && ` / ${projectName}`}
        {isArchived && <span className="mr-2 text-gray-500">— Archived</span>}
      </p>
    </>
  );
}
