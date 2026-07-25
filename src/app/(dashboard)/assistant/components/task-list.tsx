"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { StatusBadge } from "./status-badge";

export interface TaskItem {
  id: string;
  title: string | null;
  taskType: string;
  status: string;
  language: string;
  createdAt: Date;
  _count?: { outputs: number; sourceFiles: number };
}

export function TaskList({ recentTasks }: { recentTasks: TaskItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Tasks ({recentTasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No tasks found.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/assistant/${task.id}`}
                className="block p-2.5 rounded-md border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">
                    {task.title || task.taskType}
                  </span>
                  <StatusBadge status={task.status} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{task.taskType}</span>
                  <span>
                    {task.language === "ar" ? "Arabic" : "English"}
                  </span>
                  {task._count && (
                    <span>{task._count.sourceFiles} files</span>
                  )}
                  <span>
                    {new Date(task.createdAt).toLocaleDateString("en-SA")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
