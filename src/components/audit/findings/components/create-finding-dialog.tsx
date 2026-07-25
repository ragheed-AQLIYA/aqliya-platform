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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewFindingData {
  title: string;
  findingType: string;
  severity: string;
  description: string;
  rootCause: string;
  impact: string;
}

interface CreateFindingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newFinding: NewFindingData;
  onNewFindingChange: (v: NewFindingData) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}

export function CreateFindingDialog({
  open,
  onOpenChange,
  newFinding,
  onNewFindingChange,
  onSubmit,
  submitting,
  error,
}: CreateFindingDialogProps) {
  const t = useTranslations("audit.findings");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("createDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("titleField")}</Label>
            <Input
              value={newFinding.title}
              onChange={(e) =>
                onNewFindingChange({ ...newFinding, title: e.target.value })
              }
              placeholder={t("titlePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("typeField")}</Label>
              <Select
                value={newFinding.findingType}
                onValueChange={(v) => {
                  if (v !== null)
                    onNewFindingChange({ ...newFinding, findingType: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material_misstatement">
                    {t("materialMisstatement")}
                  </SelectItem>
                  <SelectItem value="control_deficiency">
                    {t("controlDeficiency")}
                  </SelectItem>
                  <SelectItem value="disclosure_gap">
                    {t("disclosureGap")}
                  </SelectItem>
                  <SelectItem value="observation">
                    {t("observation")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("severityField")}</Label>
              <Select
                value={newFinding.severity}
                onValueChange={(v) => {
                  if (v !== null)
                    onNewFindingChange({ ...newFinding, severity: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("low")}</SelectItem>
                  <SelectItem value="medium">{t("medium")}</SelectItem>
                  <SelectItem value="high">{t("high")}</SelectItem>
                  <SelectItem value="critical">{t("critical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t("descriptionField")}</Label>
            <Textarea
              value={newFinding.description}
              onChange={(e) =>
                onNewFindingChange({
                  ...newFinding,
                  description: e.target.value,
                })
              }
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div>
            <Label>{t("rootCauseField")}</Label>
            <Input
              value={newFinding.rootCause}
              onChange={(e) =>
                onNewFindingChange({
                  ...newFinding,
                  rootCause: e.target.value,
                })
              }
              placeholder={t("rootCausePlaceholder")}
            />
          </div>
          <div>
            <Label>{t("impactField")}</Label>
            <Input
              value={newFinding.impact}
              onChange={(e) =>
                onNewFindingChange({ ...newFinding, impact: e.target.value })
              }
              placeholder={t("impactPlaceholder")}
            />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!newFinding.title.trim() || submitting}
          >
            {submitting ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
