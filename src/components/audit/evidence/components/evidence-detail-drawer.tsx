"use client";
import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { XCircle, ExternalLink, Upload, FileText, Link, CheckCircle, History, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTraceabilityAction } from "@/actions/audit-actions";
import { EvidenceStorageStatusBadge } from "@/components/audit/evidence/evidence-storage-status";
import { stateColors, renderStateIcon, renderFileIcon } from "./constants";
import type { EvidenceObject } from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

function entityLabel(type: string, t: (k: string) => string): string {
  if (type === "finding") return t("entityFinding");
  if (type === "statement") return t("statementLabel");
  if (type === "note") return t("entityNote");
  return type;
}

interface EvidenceDetailDrawerProps {
  selectedEv: EvidenceObject;
  engagementId: string;
  onClose: () => void;
  uploadingId: string | null;
  downloadingId: string | null;
  actionError: string | null;
  traceEvOpen: boolean;
  setTraceEvOpen: (v: boolean) => void;
  traceEvData: { forward: TraceabilityNode[]; backward: TraceabilityNode[] };
  setTraceEvData: (d: { forward: TraceabilityNode[]; backward: TraceabilityNode[] }) => void;
  stateLabel: Record<string, string>;
  onUploadFile: (file: File, targetId: string) => Promise<void>;
  onDownload: (ev: EvidenceObject) => Promise<void>;
  onAccept: (ev: EvidenceObject) => Promise<void>;
  onMarkReviewed: (ev: EvidenceObject) => Promise<void>;
  onOpenLinkDialog: (ev: EvidenceObject) => Promise<void>;
  onOpenRejectDialog: () => void;
  onOpenVersionHistory: () => void;
}

export function EvidenceDetailDrawer({
  selectedEv, engagementId, onClose, uploadingId, downloadingId, actionError,
  setTraceEvOpen, setTraceEvData, stateLabel, onUploadFile, onDownload, onAccept,
  onMarkReviewed, onOpenLinkDialog, onOpenRejectDialog, onOpenVersionHistory,
}: EvidenceDetailDrawerProps) {
  const t = useTranslations("audit.evidence");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const canModify = selectedEv.state !== "accepted" && selectedEv.state !== "rejected";
  const ev = selectedEv;

  const handleTraceability = async () => {
    try {
      const trace = await getTraceabilityAction(engagementId, "evidence", ev.id);
      setTraceEvData({ forward: trace.forwardTrace ?? [], backward: trace.backwardTrace ?? [] });
    } catch { setTraceEvData({ forward: [], backward: [] }); }
    setTraceEvOpen(true);
  };

  const field = (label: string, value: React.ReactNode) => (
    <div>
      <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
      <div>{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div className="absolute start-0 top-0 bottom-0 w-96 bg-background shadow-xl border-r p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{t("evidenceDetails")}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><XCircle className="size-4" /></Button>
        </div>
        <div className="space-y-4 text-sm">
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleTraceability}>
            <ExternalLink className="size-3 me-1" />{t("showTraceability")}
          </Button>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide">{t("filenameCol")}</div>
            <div className="font-medium flex items-center gap-2">{renderFileIcon(ev.fileType)}{ev.filename}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field(t("typeCol"), ev.fileType.toUpperCase())}
            {field(t("size"), ev.fileSize > 0 ? t("kilobytes", { size: (ev.fileSize / 1024).toFixed(0) }) : "-")}
            {field(t("uploadedByCol"), ev.uploadedById || "-")}
            {field(t("uploadDateCol"), ev.uploadedAt ? new Date(ev.uploadedAt).toLocaleDateString() : "-")}
          </div>
          {field(t("fileHash"), <span className="font-mono text-xs">{ev.fileHash || t("notAvailable")}</span>)}
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{t("stateCol")}</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`${stateColors[ev.state]} flex items-center gap-1 w-fit`}>
                {renderStateIcon(ev.state)}{stateLabel[ev.state] || t("rejectedState")}
              </Badge>
              <EvidenceStorageStatusBadge evidence={ev} size="md" />
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">{t("linkedEntities")}</div>
            {ev.linkedEntities.length > 0 ? ev.linkedEntities.map((le, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                <Badge variant="outline" className="text-[10px]">{entityLabel(le.linkType as string, t)}</Badge>
                <span className="text-xs">{le.targetLabel}</span>
                <Badge variant="outline" className="text-[10px] mr-auto">{entityLabel(le.targetType as string, t)}</Badge>
              </div>
            )) : <div className="text-xs text-muted-foreground italic">{t("noLinkedEntities")}</div>}
          </div>
          {(ev.state === "missing" || ev.state === "requested") && (
            <>
              <Button size="sm" className="w-full" disabled={uploadingId === ev.id}
                onClick={() => { setUploadTargetId(ev.id); fileInputRef.current?.click(); }}>
                {uploadingId === ev.id ? <Loader2 className="size-4 me-1 animate-spin" /> : <Upload className="size-4 me-1" />}
                {uploadingId === ev.id ? t("uploading") : t("uploadFile")}
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !uploadTargetId) return;
                await onUploadFile(file, uploadTargetId);
                setUploadTargetId(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }} />
            </>
          )}
          {ev.storageKey && ev.fileHash && (
            <Button size="sm" variant="outline" className="w-full" disabled={downloadingId === ev.id} onClick={() => onDownload(ev)}>
              {downloadingId === ev.id ? <Loader2 className="size-4 me-1 animate-spin" /> : <FileText className="size-4 me-1" />}
              {downloadingId === ev.id ? "جارٍ التحقق..." : t("download", { hash: ev.fileHash.substring(0, 8) })}
            </Button>
          )}
          {!ev.storageKey && <p className="text-xs text-muted-foreground rounded-md border border-dashed p-2">لم يُرفع ملف بعد — هذا سجل طلب دليل فقط.</p>}
          {actionError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              <AlertTriangle className="size-3 shrink-0" /><span>{actionError}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onOpenLinkDialog(ev)}>
              <Link className="size-4 me-1" />{t("linkToFinding")}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" disabled={!canModify} onClick={() => onAccept(ev)}>
              <CheckCircle className="size-4 me-1" />{t("verify")}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" disabled={!canModify} onClick={() => onMarkReviewed(ev)}>
              <Link className="size-4 me-1" />{t("markReviewed")}
            </Button>
          </div>
          {canModify && (
            <Button size="sm" variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={onOpenRejectDialog}>
              <Trash2 className="size-4 me-1" />رفض الدليل
            </Button>
          )}
          <Button size="sm" variant="secondary" className="w-full" onClick={onOpenVersionHistory}>
            <History className="size-4 me-1" />سجل الإصدارات
          </Button>
        </div>
      </div>
    </div>
  );
}
