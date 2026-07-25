"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Finding } from "@/types/audit";

interface LinkEvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  findingsList: Finding[];
  onSubmit: (targetType: string, targetId: string) => Promise<void>;
}

export function LinkEvidenceDialog({
  open,
  onClose,
  findingsList,
  onSubmit,
}: LinkEvidenceDialogProps) {
  const t = useTranslations("audit.evidence");
  const [targetType, setTargetType] = useState("finding");
  const [targetId, setTargetId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setError(null);
    setTargetType("finding");
    setTargetId("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("linkEvidence")}</DialogTitle>
          <DialogDescription>{t("linkDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("targetTypeLabel")}</Label>
            <Select
              value={targetType}
              onValueChange={(v) => {
                if (v !== null) {
                  setTargetType(v);
                  setTargetId("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finding">{t("finding")}</SelectItem>
                <SelectItem value="statement">{t("statementLabel")}</SelectItem>
                <SelectItem value="note">{t("note")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {targetType === "finding" && findingsList.length > 0 && (
            <div>
              <Label>{t("selectFinding")}</Label>
              <Select
                value={targetId}
                onValueChange={(v) => {
                  if (v !== null) setTargetId(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectFinding")} />
                </SelectTrigger>
                <SelectContent>
                  {findingsList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {targetType !== "finding" && (
            <div>
              <Label>{t("targetIdLabel")}</Label>
              <Input
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={t("targetIdPlaceholder")}
              />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              <AlertTriangle className="size-3 shrink-0" />
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            disabled={!targetId || submitting}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              try {
                await onSubmit(targetType, targetId);
                handleClose();
              } catch (e: unknown) {
                setError(
                  e instanceof Error ? e.message : t("updateFailed"),
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? t("linking") : t("link")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
