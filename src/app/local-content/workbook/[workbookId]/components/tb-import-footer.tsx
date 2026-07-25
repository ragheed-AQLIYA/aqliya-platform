"use client";

import { Button } from "@/components/ui/button";

interface Props {
  hasParsedLines: boolean;
  status: "idle" | "loading" | "success" | "error";
  onCancel: () => void;
  onImport: () => void;
}

export function TbImportFooter({ hasParsedLines, status, onCancel, onImport }: Props) {
  const isLoading = status === "loading";

  return (
    <>
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        إلغاء
      </Button>
      <Button
        onClick={onImport}
        disabled={!hasParsedLines || isLoading}
      >
        {isLoading ? "جاري الاستيراد..." : "استيراد"}
      </Button>
    </>
  );
}
