"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";

interface ContactExportButtonProps {
  contactId: string;
  disabled?: boolean;
}

export function ContactExportButton({ contactId, disabled }: ContactExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const { exportContactAsPdf } = await import("@/actions/contact-export-actions");
      const result = await exportContactAsPdf(contactId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const { content, filename } = result.data;
      const byteChars = atob(content);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNums);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExport}
        disabled={loading || disabled}
        className="w-full"
        variant="outline"
      >
        {loading ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="ml-2 h-4 w-4" />
        )}
        تصدير PDF
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
