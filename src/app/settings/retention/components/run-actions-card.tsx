"use client";

import { Eye, Loader2, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = { running: boolean; onRun: () => void; onDryRun: () => void };

export function RunActionsCard({ running, onRun, onDryRun }: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">تشغيل سياسات الاحتفاظ</CardTitle>
        <CardDescription>
          تنفيذ معاينة أو تطبيق فعلي لسياسات الاحتفاظ بالبيانات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onDryRun} disabled={running}>
            {running ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 ml-1" />
            )}
            معاينة الحذف
          </Button>
          <Button onClick={onRun} disabled={running}>
            {running ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 ml-1" />
            )}
            تطبيق السياسات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
