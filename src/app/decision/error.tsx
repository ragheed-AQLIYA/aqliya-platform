"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DecisionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة القرارات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          حدث خطأ أثناء تحميل لوحة القرارات
        </p>
      </div>

      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
              تعذر تحميل البيانات
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error.message || "يرجى المحاولة مرة أخرى"}
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
