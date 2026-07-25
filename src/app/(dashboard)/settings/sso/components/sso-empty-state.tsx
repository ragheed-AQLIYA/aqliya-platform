"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield } from "lucide-react";

interface SsoEmptyStateProps {
  onAdd: () => void;
}

export function SsoEmptyState({ onAdd }: SsoEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-12 pb-12 text-center space-y-4">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <div>
          <p className="text-lg font-medium">لم يتم تكوين أي مزود دخول موحد بعد</p>
          <p className="text-sm text-muted-foreground mt-1">
            أضف مزود دخول موحد للسماح لأعضاء المنشأة بتسجيل الدخول عبر حساباتهم الخارجية
          </p>
        </div>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مزود دخول موحد
        </Button>
      </CardContent>
    </Card>
  );
}
