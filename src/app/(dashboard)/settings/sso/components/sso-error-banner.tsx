"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface SsoErrorBannerProps {
  error: string;
  onDismiss: () => void;
}

export function SsoErrorBanner({ error, onDismiss }: SsoErrorBannerProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="pt-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>إخفاء</Button>
      </CardContent>
    </Card>
  );
}
