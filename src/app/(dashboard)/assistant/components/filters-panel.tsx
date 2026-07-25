"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface FiltersPanelProps {
  workspaces: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  searchQuery: string;
  workspaceFilter: string;
  projectFilter: string;
  taskTypeFilter: string;
}

const TASK_TYPES = [
  "document_summary", "excel_analysis", "report_draft",
  "presentation_outline", "executive_summary", "meeting_notes",
];

const typeLabel = (t: string) =>
  t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function FiltersPanel({
  workspaces, projects, searchQuery, workspaceFilter, projectFilter, taskTypeFilter,
}: FiltersPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <form method="GET" action="/assistant" className="space-y-3">
          <Input
            name="search"
            placeholder="Search tasks..."
            defaultValue={searchQuery}
            className="text-xs h-8"
          />
          <select
            name="workspaceId"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} selected={workspaceFilter === ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <select
            name="projectId"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} selected={projectFilter === p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            name="taskType"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="">All Types</option>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t} selected={taskTypeFilter === t}>
                {typeLabel(t)}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1 text-xs h-8">
              Apply
            </Button>
            <Link
              href="/assistant"
              className="text-xs text-muted-foreground hover:text-foreground self-center"
            >
              Clear
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
