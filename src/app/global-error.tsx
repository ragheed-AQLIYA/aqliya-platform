"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html dir="rtl" lang="ar">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="rounded-full bg-destructive/10 p-4 mx-auto w-fit">
              <svg
                className="size-10 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-sm text-muted-foreground">
              عذراً، حدث خطأ غير متوقع. الفريق التقني تم إشعاره.
            </p>
            <button
              onClick={reset}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
