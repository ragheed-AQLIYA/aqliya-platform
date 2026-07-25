"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function RejectDialog({
  open,
  reason,
  rejecting,
  rejectError,
  onOpenChange,
  onReasonChange,
  onConfirm,
}: {
  open: boolean;
  reason: string;
  rejecting: boolean;
  rejectError: string | null;
  onOpenChange: (open: boolean) => void;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("audit.approval");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("rejectDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>{t("rejectReason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={t("rejectReasonPlaceholder")}
            className="min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || rejecting}
            onClick={onConfirm}
          >
            {rejecting ? t("rejecting") : t("reject")}
          </Button>
          {rejectError && (
            <p className="text-xs text-red-600">{t(rejectError)}</p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
