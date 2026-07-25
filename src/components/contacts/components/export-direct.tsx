"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportDirectProps {
  loading: string | null;
  onExport: () => void;
}

export function ExportDirect({ loading, onExport }: ExportDirectProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        يمكن تصدير جهة الاتصال هذه بدون موافقة مسبقة.
      </p>
      <Button
        onClick={onExport}
        disabled={loading === "export"}
        className="w-full"
      >
        {loading === "export" ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="ml-2 h-4 w-4" />
        )}
        تصدير الملف الشخصي
      </Button>
    </div>
  );
}
