"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QualityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
        <h2 className="text-lg font-semibold">حدث خطأ في نظام الجودة</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "تعذر تحميل بيانات نظام إدارة الجودة"}
        </p>
        <Button onClick={reset}>إعادة المحاولة</Button>
      </div>
    </div>
  );
}
