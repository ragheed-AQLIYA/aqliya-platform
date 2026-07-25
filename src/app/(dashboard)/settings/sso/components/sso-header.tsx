"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SsoHeaderProps {
  onAdd: () => void;
}

export function SsoHeader({ onAdd }: SsoHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">إعدادات الدخول الموحد</h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة مزودي الدخول الموحد (SSO) للمنشأة
        </p>
      </div>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        إضافة مزود
      </Button>
    </div>
  );
}
