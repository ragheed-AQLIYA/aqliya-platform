"use client";

import { Building2, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function OrganizationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Organization detail error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4" dir="rtl">
      <div className="rounded-full bg-destructive/10 p-4">
        <Building2 className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">تعذر تحميل تفاصيل المؤسسة</h2>
        <p className="text-sm text-muted-foreground">
          حدث خطأ أثناء تحميل مساحة عمل المؤسسة. يرجى المحاولة مرة أخرى.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50">Error ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}
