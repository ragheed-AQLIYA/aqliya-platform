"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Project Error Boundary]", error);
  }, [error]);

  const router = useRouter();

  return (
    <Card className="border-dashed border-red-200 dark:border-red-900/50">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Project Error
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Something went wrong loading this project. The data could not be
            loaded safely.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="size-4 me-1" />
            إعادة المحاولة
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/local-content/projects")}
          >
            <ArrowLeft className="size-4 me-1" />
            العودة للمشاريع
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
