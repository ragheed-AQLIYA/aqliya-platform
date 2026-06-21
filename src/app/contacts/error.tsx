"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ContactsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Contacts page error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="rounded-full bg-destructive/10 p-3 w-fit mx-auto">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">حدث خطأ</h2>
        <p className="text-sm text-muted-foreground">
          تعذر تحميل صفحة جهات الاتصال. يرجى المحاولة مرة أخرى.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
