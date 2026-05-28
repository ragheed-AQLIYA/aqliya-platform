"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { generateLocalContentReportAction } from "@/actions/localcontent-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface ReportGenerationButtonProps {
  projectId: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  format: "pdf" | "xlsx";
}

export function ReportGenerationButton({
  projectId,
  type,
  label,
  icon,
  format,
}: ReportGenerationButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    setPending(true);
    try {
      const result = await generateLocalContentReportAction(
        projectId,
        type,
        format,
      );
      if (!result.ok) {
        setError(result.error || "فشل في توليد التقرير");
      } else {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleClick}
        disabled={pending}
        variant="outline"
        className="w-full h-auto py-4 flex flex-col items-center gap-2"
      >
        {pending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
            <span className="text-sm">جارٍ التوليد...</span>
          </>
        ) : (
          <>
            {icon}
            <span className="text-sm">{label}</span>
            <Badge variant="outline" className="text-[9px]">
              {format.toUpperCase()}
            </Badge>
          </>
        )}
      </Button>
      {error && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
