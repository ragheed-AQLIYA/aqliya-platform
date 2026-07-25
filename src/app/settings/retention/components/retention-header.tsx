"use client";

import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

export function RetentionHeader() {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">سياسات الاحتفاظ بالبيانات</h1>
        <Badge variant="outline">Admin</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        إدارة سياسات الاحتفاظ بالبيانات وحذف السجلات المنتهية صلاحيتها. جميع
        العمليات مسجلة في سجل التدقيق.
      </p>
    </>
  );
}
