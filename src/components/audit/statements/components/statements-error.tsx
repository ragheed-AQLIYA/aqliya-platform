"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface StatementsErrorProps {
  error: string;
  onRetry: () => void;
}

export function StatementsError({ error, onRetry }: StatementsErrorProps) {
  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] border-red-200 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertTriangle className="size-8 text-red-600" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
