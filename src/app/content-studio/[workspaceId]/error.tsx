"use client";

import { clientLogger } from "@/lib/observability/client-logger";

import { FileText, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ContentWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    clientLogger.error("Content Workspace error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <FileText className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">
          تعذر تحميل مساحة المحتوى
        </h2>
        <p className="text-sm text-muted-foreground">
          حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Content Workspace encountered an error. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/40">
            Error ID: {error.digest}
          </p>
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
