"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { clientLogger } from "@/lib/observability/client-logger";

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon: LucideIcon;
  arTitle: string;
  enTitle: string;
}

export function ProductError({ error, reset, icon: Icon, arTitle, enTitle }: ProductErrorProps) {
  useEffect(() => {
    clientLogger.error(`${enTitle} error`, error);
  }, [error, enTitle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <Icon className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">
          تعذر تحميل {arTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <p className="text-xs text-muted-foreground/60">
          {enTitle} encountered an error. Please try again.
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
