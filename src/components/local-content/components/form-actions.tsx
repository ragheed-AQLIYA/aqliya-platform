"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FormActionsProps {
  loading: boolean;
  onClose: () => void;
}

export function FormActions({ loading, onClose }: FormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="submit"
        size="sm"
        disabled={loading}
        className="flex items-center gap-1"
      >
        <Upload className="h-4 w-4" />
        {loading ? "جارٍ الرفع..." : "رفع"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onClose}
      >
        إغلاق
      </Button>
    </div>
  );
}
