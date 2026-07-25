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
import { createEvidenceAction } from "@/actions/audit-actions";

interface RequestEvidenceDialogProps {
  open: boolean;
  onClose: () => void;
  engagementId: string;
  onCreated: (evidence: import("@/types/audit").EvidenceObject) => void;
}

export function RequestEvidenceDialog({
  open,
  onClose,
  engagementId,
  onCreated,
}: RequestEvidenceDialogProps) {
  const t = useTranslations("audit.evidence");
  const [filename, setFilename] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setError(null);
    setFilename("");
    setFileType("pdf");
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
          <DialogTitle>{t("requestEvidence")}</DialogTitle>
          <DialogDescription>
            {t("requestEvidenceDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Label>{t("filenameLabel")}</Label>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder={t("filenamePlaceholder")}
          />
          <Label>{t("fileTypeLabel")}</Label>
          <Select
            value={fileType}
            onValueChange={(v) => {
              if (v !== null) setFileType(v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="xlsx">{t("excelXlsx")}</SelectItem>
              <SelectItem value="docx">{t("wordDocx")}</SelectItem>
              <SelectItem value="jpg">{t("imageJpg")}</SelectItem>
              <SelectItem value="png">{t("imagePng")}</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
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
            disabled={!filename.trim() || submitting}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              try {
                const result = await createEvidenceAction({
                  engagementId,
                  filename: filename.trim(),
                  fileType,
                  state: "missing",
                });
                if (result.evidence) onCreated(result.evidence);
                handleClose();
              } catch (e: unknown) {
                setError(
                  e instanceof Error ? e.message : t("requestFailed"),
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? t("requesting") : t("requestEvidence")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
