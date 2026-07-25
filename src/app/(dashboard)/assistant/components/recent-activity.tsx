"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface RecentActivityProps {
  recentActivity: { id: string; title: string | null; taskType: string; status: string; createdAt: Date }[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {recentActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((a) => (
              <Link
                key={a.id}
                href={`/assistant/${a.id}`}
                className="block text-xs hover:bg-muted/50 p-1.5 rounded"
              >
                <span className="font-medium truncate">
                  {a.title || a.taskType}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <StatusBadge status={a.status} />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("en-SA")}
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
