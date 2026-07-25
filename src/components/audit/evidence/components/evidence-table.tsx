"use client";
import { useTranslations } from "next-intl";
import { File, Upload, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceStorageStatusBadge } from "@/components/audit/evidence/evidence-storage-status";
import { stateColors, renderStateIcon, renderFileIcon } from "./constants";
import type { EvidenceObject } from "@/types/audit";

const STATE_OPTIONS = [
  "all", "missing", "requested", "uploaded", "linked", "reviewed", "accepted", "rejected",
] as const;

interface EvidenceTableProps {
  evidence: EvidenceObject[];
  filtered: EvidenceObject[];
  search: string;
  stateFilter: string;
  evHasMore: boolean;
  loadingMore: boolean;
  evTotal: number;
  stateLabel: Record<string, string>;
  onSearchChange: (v: string) => void;
  onStateFilterChange: (v: string) => void;
  onSelectEvidence: (ev: EvidenceObject) => void;
  onRequestEvidence: () => void;
  onLoadMore: () => void;
}

export function EvidenceTable({
  evidence, filtered, search, stateFilter, evHasMore, loadingMore, evTotal,
  stateLabel, onSearchChange, onStateFilterChange, onSelectEvidence,
  onRequestEvidence, onLoadMore,
}: EvidenceTableProps) {
  const t = useTranslations("audit.evidence");
  const stateLabelKey = (s: string) => {
    const map: Record<string, string> = {
      all: "allStates", missing: "missingState", requested: "requestedState",
      uploaded: "uploadedState", linked: "linkedState", reviewed: "reviewedState",
      accepted: "acceptedState", rejected: "rejectedState",
    };
    return t(map[s] as never ?? "rejectedState");
  };
  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>{t("evidenceItems")}</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input placeholder={t("searchByFilename")} className="w-56" value={search} onChange={(e) => onSearchChange(e.target.value)} />
            <Select value={stateFilter} onValueChange={(v) => { if (v !== null) onStateFilterChange(v); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder={t("filterByState")} /></SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{stateLabelKey(s)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("filenameCol")}</TableHead>
                <TableHead>{t("typeCol")}</TableHead>
                <TableHead>{t("uploadedByIdCol")}</TableHead>
                <TableHead>{t("uploadDateCol")}</TableHead>
                <TableHead>{t("stateCol")}</TableHead>
                <TableHead>التخزين</TableHead>
                <TableHead>{t("linkedToCol")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      {evidence.length === 0 ? t("noEvidence") : "لا توجد أدلة مطابقة للتصفية."}
                    </p>
                    {evidence.length === 0 && (
                      <Button className="mt-3" size="sm" onClick={onRequestEvidence}>
                        <Upload className="size-4 me-1" />{t("requestEvidence")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ev) => (
                  <TableRow key={ev.id} className="cursor-pointer" onClick={() => onSelectEvidence(ev)}>
                    <TableCell className="flex items-center gap-2">
                      {renderFileIcon(ev.fileType) || <File className="size-4" />}
                      <span className="font-medium">{ev.filename}</span>
                      {ev.state === "missing" && (
                        <Badge variant="outline" className="bg-red-600 text-white border-red-600 text-[10px]">
                          {t("missingState")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="outline">{ev.fileType.toUpperCase()}</Badge></TableCell>
                    <TableCell>{ev.uploadedById || "-"}</TableCell>
                    <TableCell>
                      {ev.uploadedAt
                        ? new Date(ev.uploadedAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", year: "numeric" })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${stateColors[ev.state] || ""} flex items-center gap-1 w-fit`}>
                        {renderStateIcon(ev.state)}
                        {stateLabel[ev.state] || t("rejectedState")}
                      </Badge>
                    </TableCell>
                    <TableCell><EvidenceStorageStatusBadge evidence={ev} /></TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ev.linkedEntities.map((le, i) => (
                        <Badge key={i} variant="outline" className="mr-1 text-[10px]">{le.targetLabel}</Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {evHasMore && (
        <div className="flex justify-center py-3 border-t">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore ? <Loader2 className="size-4 me-1 animate-spin" /> : <RefreshCw className="size-4 me-1" />}
            {t("loadMore", { remaining: evTotal - evidence.length })}
          </Button>
        </div>
      )}
    </Card>
  );
}
