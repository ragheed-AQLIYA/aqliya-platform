"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center py-12 text-destructive">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
      <p>{message}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        إعادة المحاولة
      </Button>
    </div>
  );
}
