"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  RotateCcw,
  GitCompareArrows,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  compareEvidenceVersionsAction,
  getEvidenceVersionsAction,
  revertEvidenceVersionAction,
} from "@/actions/audit-read-actions";

interface EvidenceVersion {
  id: string;
  evidenceId: string;
  versionNumber: number;
  changes: Record<string, unknown>;
  changeDescription: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
}

interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

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
  const [versions, setVersions] = useState<EvidenceVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<VersionDiff[] | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const loadVersions = async () => {
    const res = await getEvidenceVersionsAction(evidenceId, engagementId);
    if (!res.success) {
      setError(res.error);
      return [];
    }
    setVersions(res.data);
    return res.data;
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await loadVersions();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "فشل تحميل سجل الإصدارات",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [evidenceId, engagementId, open]);

  const handleCompare = async (vid1: string, vid2: string) => {
    setDiffLoading(true);
    setDiffResult(null);
    try {
      const res = await compareEvidenceVersionsAction(
        evidenceId,
        engagementId,
        vid1,
        vid2,
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      setDiffResult(res.data);
    } catch {
      setError("فشل مقارنة الإصدارات");
    } finally {
      setDiffLoading(false);
    }
  };

  const handleRevert = async (versionNumber: number) => {
    setRevertingId(`revert-${versionNumber}`);
    try {
      const res = await revertEvidenceVersionAction(
        evidenceId,
        engagementId,
        versionNumber,
      );
      if (!res.success) {
        setError(res.error);
        return;
      }
      await loadVersions();
      onRevert?.();
    } catch {
      setError("فشل استعادة الإصدار");
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
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
            {versions.map((v) => {
              const isExpanded = expandedVersion === v.id;
              const changes = v.changes as Record<string, string>;
              return (
                <Card
                  key={v.id}
                  className={`border ${v.versionNumber === 1 ? "border-blue-200" : "border-border/60"}`}
                >
                  <CardHeader
                    className="cursor-pointer px-4 py-3"
                    onClick={() =>
                      setExpandedVersion(isExpanded ? null : v.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge variant="outline">
                          {"الإصدار " + v.versionNumber}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {v.createdByName || v.createdById || "نظام"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.createdAt).toLocaleDateString("ar-SA", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {v.versionNumber > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={
                                revertingId === `revert-${v.versionNumber}`
                              }
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleRevert(v.versionNumber);
                              }}
                              title="استعادة هذا الإصدار"
                            >
                              {revertingId === `revert-${v.versionNumber}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (compareIds[0] === null) {
                                  setCompareIds([v.id, null]);
                                } else if (
                                  compareIds[0] !== v.id &&
                                  compareIds[1] === null
                                ) {
                                  setCompareIds([compareIds[0], v.id]);
                                  void handleCompare(compareIds[0], v.id);
                                } else {
                                  setCompareIds([v.id, null]);
                                  setDiffResult(null);
                                }
                              }}
                              title="مقارنة إصدارين"
                            >
                              <GitCompareArrows className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {v.changeDescription && (
                      <p className="mt-1 text-xs text-muted-foreground px-6">
                        {v.changeDescription}
                      </p>
                    )}
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="border-t px-4 py-3">
                      <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono">
                        {Object.entries(changes).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="text-muted-foreground">{key}</span>
                            <span>{String(val ?? "—")}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {diffLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {diffResult && diffResult.length > 0 && (
          <div className="mt-4 rounded-md border p-3">
            <h4 className="text-sm font-semibold mb-2">نتيجة المقارنة</h4>
            <ul className="space-y-1 text-xs">
              {diffResult
                .filter((d) => d.changed)
                .map((d) => (
                  <li key={d.field}>
                    <span className="font-medium">{d.field}:</span>{" "}
                    {String(d.oldValue ?? "—")} → {String(d.newValue ?? "—")}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
