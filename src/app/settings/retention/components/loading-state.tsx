"use client";

import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </main>
  );
}
