"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Finding, EvidenceObject } from "@/types/audit";

interface LinkedEvidenceDialogProps {
  finding: Finding | null;
  linkedEvidence: EvidenceObject[];
  loading: boolean;
  onClose: () => void;
}

export function LinkedEvidenceDialog({
  finding,
  linkedEvidence,
  loading,
  onClose,
}: LinkedEvidenceDialogProps) {
  const t = useTranslations("audit.findings");

  const evStateLabel: Record<string, string> = {
    missing: t("missingState"),
    requested: t("requestedState"),
    uploaded: t("uploadedState"),
    linked: t("linkedState"),
    reviewed: t("reviewedState"),
    accepted: t("acceptedState"),
    rejected: t("rejectedState"),
  };

  return (
    <Dialog open={!!finding} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("linkedEvidenceTitle")}</DialogTitle>
          <DialogDescription>
            {t("linkedEvidenceDescription", {
              title: finding?.title ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("loading")}
          </div>
        ) : linkedEvidence.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("noLinkedEvidence")}
          </div>
        ) : (
          <div className="space-y-2">
            {[...new Set(linkedEvidence.map((e) => e.id))].map((id) => {
              const ev = linkedEvidence.find((e) => e.id === id)!;
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span>{ev.filename}</span>
                  <Badge variant="outline" className="mr-auto text-[10px]">
                    {evStateLabel[ev.state] || t("rejectedState")}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
