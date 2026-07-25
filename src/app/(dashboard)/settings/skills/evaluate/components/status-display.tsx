"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <Card className="border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950">
      <CardContent className="flex items-center gap-2 pt-4 text-red-700 dark:text-red-300">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-sm">{message}</span>
      </CardContent>
    </Card>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function RunningIndicator() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center gap-3 py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-muted-foreground">جاري التقييم...</span>
      </CardContent>
    </Card>
  );
}
