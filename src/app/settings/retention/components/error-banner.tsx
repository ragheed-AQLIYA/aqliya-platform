"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = { error: string; onDismiss: () => void };

export function ErrorBanner({ error, onDismiss }: Props) {
  return (
    <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
      <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {error}
        <Button
          variant="ghost"
          size="sm"
          className="mr-auto"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
