"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SalesAccountNewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SalesOS Account New Error Boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-4xl p-8" dir="rtl">
      <Card className="border-dashed border-red-200 dark:border-red-900/50">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">تعذر تحميل إنشاء الحساب</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              حدث خطأ أثناء تحميل صفحة إنشاء الحساب. يمكنك إعادة المحاولة أو العودة إلى الحسابات.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshCw className="me-1 h-4 w-4" />
              إعادة المحاولة
            </Button>
            <Link href="/sales/accounts">
              <Button size="sm">العودة للحسابات</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
