"use client";

import { Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEvidenceHistory } from "./components/use-evidence-history";
import { EvidenceVersionCard } from "./components/evidence-version-card";
import { VersionDiffPanel } from "./components/version-diff-panel";

interface EvidenceVersionHistoryProps {
  evidenceId: string;
  engagementId: string;
  open: boolean;
  onClose: () => void;
  onRevert?: () => void;
}

export function EvidenceVersionHistory({
  evidenceId,
  engagementId,
  open,
  onClose,
  onRevert,
}: EvidenceVersionHistoryProps) {
  const {
    versions,
    loading,
    error,
    expandedVersion,
    setExpandedVersion,
    diffResult,
    diffLoading,
    handleCompareClick,
    handleRevert,
    revertingId,
  } = useEvidenceHistory(evidenceId, engagementId, open, onRevert);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            سجل إصدارات الدليل (A1-05)
          </DialogTitle>
          <DialogDescription>
            سلسلة حفظ الحالة — للمراجعة والمقارنة. الاستعادة تتطلب صلاحية مراجع.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && versions.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            لا توجد إصدارات بعد — تُسجَّل عند رفع الملف أو تغيير الحالة.
          </div>
        )}

        {!loading && versions.length > 0 && (
          <div className="space-y-2">
            {versions.map((v) => (
              <EvidenceVersionCard
                key={v.id}
                version={v}
                isExpanded={expandedVersion === v.id}
                isReverting={revertingId === `revert-${v.versionNumber}`}
                onToggle={() =>
                  setExpandedVersion(
                    expandedVersion === v.id ? null : v.id,
                  )
                }
                onCompare={() => handleCompareClick(v.id)}
                onRevert={() => handleRevert(v.versionNumber)}
              />
            ))}
          </div>
        )}

        {diffLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {diffResult && diffResult.length > 0 && (
          <VersionDiffPanel diffResult={diffResult} />
        )}
      </DialogContent>
    </Dialog>
  );
}
