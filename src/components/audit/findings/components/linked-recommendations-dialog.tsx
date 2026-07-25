"use client";

import { useTranslations } from "next-intl";
import { ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Finding, Recommendation } from "@/types/audit";

interface LinkedRecommendationsDialogProps {
  finding: Finding | null;
  linkedRecs: Recommendation[];
  loading: boolean;
  onClose: () => void;
}

export function LinkedRecommendationsDialog({
  finding,
  linkedRecs,
  loading,
  onClose,
}: LinkedRecommendationsDialogProps) {
  const t = useTranslations("audit.findings");

  return (
    <Dialog open={!!finding} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("linkedRecommendationsTitle")}</DialogTitle>
          <DialogDescription>
            {t("linkedRecommendationsDescription", {
              title: finding?.title ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("loading")}
          </div>
        ) : linkedRecs.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("noLinkedRecs")}
          </div>
        ) : (
          <div className="space-y-2">
            {linkedRecs.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <ListChecks className="size-4 shrink-0 text-muted-foreground" />
                <span>{rec.title}</span>
                <Badge variant="outline" className="mr-auto text-[10px]">
                  {(rec.status as string) === "draft"
                    ? t("recDraft")
                    : (rec.status as string) === "approved"
                      ? t("recApproved")
                      : (rec.status as string) === "rejected"
                        ? t("recRejected")
                        : rec.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
