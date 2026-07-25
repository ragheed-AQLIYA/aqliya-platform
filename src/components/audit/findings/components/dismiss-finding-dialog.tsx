"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Finding } from "@/types/audit";

interface DismissFindingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: Finding | null;
  error: string | null;
  dismissing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DismissFindingDialog({
  open,
  onOpenChange,
  target,
  error,
  dismissing,
  onConfirm,
  onClose,
}: DismissFindingDialogProps) {
  const t = useTranslations("audit.findings");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تأكيد تجاهل النتيجة</DialogTitle>
          <DialogDescription>
            سيتم تغيير حالة &ldquo;{target?.title}&rdquo; إلى{" "}
            <strong>متجاهلة</strong>. يُسجَّل الإجراء في سجل التدقيق ولا يُحذف
            السجل من قاعدة البيانات.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={dismissing}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={dismissing || !target}
            onClick={onConfirm}
          >
            {dismissing ? "جارٍ التجاهل..." : t("dismissFinding")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
