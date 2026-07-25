"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface SsoErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function SsoErrorState({ error, onRetry }: SsoErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" dir="rtl">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
