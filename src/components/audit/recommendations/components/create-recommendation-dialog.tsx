"use client";

import { AlertTriangle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Finding } from "@/types/audit";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  findings: Finding[];
  newRec: {
    findingId: string;
    title: string;
    description: string;
    recommendedAction: string;
    riskLevel: string;
  };
  createSubmitting: boolean;
  createRecError: string | null;
  t: (key: string, values?: Record<string, string | number | Date> | undefined) => string;
  onNewRecChange: (
    update: Partial<{
      findingId: string;
      title: string;
      description: string;
      recommendedAction: string;
      riskLevel: string;
    }>,
  ) => void;
  onCreate: () => void;
}

export function CreateRecommendationDialog({
  open,
  onOpenChange,
  findings,
  newRec,
  createSubmitting,
  createRecError,
  t,
  onNewRecChange,
  onCreate,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{t("linkedFindingField")}</Label>
            <Select
              value={newRec.findingId}
              onValueChange={(v) => {
                if (v !== null) onNewRecChange({ findingId: v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectFinding")} />
              </SelectTrigger>
              <SelectContent>
                {findings.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("titleField")}</Label>
            <Input
              value={newRec.title}
              onChange={(e) => onNewRecChange({ title: e.target.value })}
              placeholder={t("titlePlaceholder")}
            />
          </div>
          <div>
            <Label>{t("descriptionField")}</Label>
            <Textarea
              value={newRec.description}
              onChange={(e) => onNewRecChange({ description: e.target.value })}
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div>
            <Label>{t("recommendedActionField")}</Label>
            <Textarea
              value={newRec.recommendedAction}
              onChange={(e) =>
                onNewRecChange({ recommendedAction: e.target.value })
              }
              placeholder={t("actionPlaceholder")}
            />
          </div>
          <div>
            <Label>{t("riskLevelField")}</Label>
            <Select
              value={newRec.riskLevel}
              onValueChange={(v) => {
                if (v !== null) onNewRecChange({ riskLevel: v });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {createRecError && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{createRecError}</span>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            disabled={
              !newRec.findingId || !newRec.title.trim() || createSubmitting
            }
            onClick={onCreate}
          >
            {createSubmitting ? t("creating") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
