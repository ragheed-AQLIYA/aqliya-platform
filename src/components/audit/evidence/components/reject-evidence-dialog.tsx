"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface RejectEvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  filename: string | null;
  onReject: () => Promise<void>;
}

export function RejectEvidenceDialog({
  open,
  onClose,
  filename,
  onReject,
}: RejectEvidenceDialogProps) {
  const t = useTranslations("audit.evidence");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفض الدليل</DialogTitle>
          <DialogDescription>
            سيتم تغيير حالة &ldquo;{filename}&rdquo; إلى{" "}
            <strong>مرفوض</strong>. يُسجَّل الإجراء في سجل التدقيق. لا يُحذف
            الملف من التخزين تلقائياً — يمكن الرجوع للسجل عند الحاجة.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            <AlertTriangle className="size-3 shrink-0" />
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={rejecting}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={rejecting || !filename}
            onClick={async () => {
              setRejecting(true);
              setError(null);
              try {
                await onReject();
                handleClose();
              } catch (e: unknown) {
                setError(
                  e instanceof Error ? e.message : t("updateFailed"),
                );
              } finally {
                setRejecting(false);
              }
            }}
          >
            {rejecting ? "جارٍ الرفض..." : "تأكيد الرفض"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
