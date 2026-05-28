"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  FileSpreadsheet,
  File,
  Upload,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Link,
  ExternalLink,
  Search,
  Filter,
  Bot,
  Sparkles,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  getTraceabilityAction,
  updateEvidenceStateWithEventAction,
  createEvidenceAction,
  linkEvidenceToEntityAction,
  generateEvidenceSuggestionsAction,
  acceptEvidenceSuggestionAction,
  uploadEvidenceFileAction,
  getEvidenceDownloadUrlAction,
} from "@/actions/audit-actions";
import type {
  EvidenceObject,
  Engagement,
  Finding,
  AIAssistanceOutput,
} from "@/types/audit";
import { TraceabilityDrawer } from "@/components/audit/shared/traceability-drawer";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getEvidencePaginatedAction,
  getEvidenceAction,
  getEngagementAction,
  getFindingsAction,
} from "@/actions/audit-read-actions";
import { EvidenceStorageStatusBadge } from "@/components/audit/evidence/evidence-storage-status";

const stateColors: Record<string, string> = {
  missing: "bg-red-100 text-red-700 border-red-300",
  requested: "bg-blue-100 text-blue-700 border-blue-300",
  uploaded: "bg-gray-100 text-gray-700 border-gray-300",
  linked: "bg-purple-100 text-purple-700 border-purple-300",
  reviewed: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};
const stateIcons: Record<string, React.ReactNode> = {
  missing: <XCircle className="size-3" />,
  requested: <Clock className="size-3" />,
  uploaded: <Upload className="size-3" />,
  linked: <Link className="size-3" />,
  reviewed: <RefreshCw className="size-3" />,
  accepted: <CheckCircle className="size-3" />,
  rejected: <XCircle className="size-3" />,
};
const fileIcons: Record<string, React.ReactNode> = {
  xlsx: <FileSpreadsheet className="size-4" />,
  pdf: <FileText className="size-4" />,
  docx: <FileText className="size-4" />,
};

export default function EvidencePage() {
  const params = useParams();
  const engagementId = params.engagementId as string;
  const t = useTranslations("audit.evidence");
  const [evidence, setEvidence] = useState<EvidenceObject[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEv, setSelectedEv] = useState<EvidenceObject | null>(null);
  const [traceEvOpen, setTraceEvOpen] = useState(false);
  const [traceEvData, setTraceEvData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [reqFilename, setReqFilename] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqFileType, setReqFileType] = useState("pdf");
  const [reqError, setReqError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkTargetType, setLinkTargetType] = useState("finding");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIAssistanceOutput[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [acceptingSuggestionId, setAcceptingSuggestionId] = useState<
    string | null
  >(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [evPage, setEvPage] = useState(1);
  const [evHasMore, setEvHasMore] = useState(false);
  const [evTotal, setEvTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const EVIDENCE_PAGE_SIZE = 20;
  const stateLabel: Record<string, string> = {
    missing: t("missingState"),
    requested: t("requestedState"),
    uploaded: t("uploadedState"),
    linked: t("linkedState"),
    reviewed: t("reviewedState"),
    accepted: t("acceptedState"),
    rejected: t("rejectedState"),
  };

  useEffect(() => {
    Promise.all([
      getEvidencePaginatedAction(engagementId, 1, EVIDENCE_PAGE_SIZE),
      getEngagementAction(engagementId),
    ]).then(([r, eng]) => {
      setEvidence(r.items);
      setEvTotal(r.total);
      setEvHasMore(r.hasMore);
      setEvPage(1);
      setEngagement(eng);
      setLoading(false);
    });
  }, [engagementId]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );

  const missingCount = evidence.filter((e) => e.state === "missing").length;

  let filtered = evidence;
  if (stateFilter !== "all")
    filtered = filtered.filter((e) => e.state === stateFilter);
  if (search)
    filtered = filtered.filter((e) =>
      e.filename.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {engagement?.client?.name} - {engagement?.fiscalPeriod}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {missingCount > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700">
              {t("missingCount", { count: missingCount })}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setSuggesting(true);
              try {
                const result =
                  await generateEvidenceSuggestionsAction(engagementId);
                setAiSuggestions((prev) => [...result, ...prev]);
              } catch {
              } finally {
                setSuggesting(false);
              }
            }}
            disabled={suggesting}
            className="gap-1.5"
          >
            {suggesting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Bot className="size-3" />
            )}{" "}
            {t("suggestEvidence")}
          </Button>
          <Button onClick={() => setShowRequest(true)}>
            <Upload className="size-4 me-1" />
            {t("requestEvidence")}
          </Button>
        </div>
      </div>

      <Card className="rounded-[24px] border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardContent className="flex gap-3 pt-4">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-blue-800 dark:text-blue-300">
              الأدلة مادة داعمة — لا تُعد اعتماداً تلقائياً
            </p>
            <p className="text-blue-700 dark:text-blue-400">
              رفع الدليل أو قبوله لا يغني عن المراجعة والاعتماد البشري. سجّل
              الروابط مع النتائج قبل الانتقال إلى المراجعة النهائية.
            </p>
          </div>
        </CardContent>
      </Card>

      {aiSuggestions.length > 0 && (
        <Card className="rounded-[24px] border-violet-200 shadow-sm">
          <CardHeader className="border-b border-violet-100 px-4 py-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="h-4 w-4 text-violet-500" />
              {t("aiTitle")}
              <Badge
                variant="outline"
                className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]"
              >
                {t("notFinal")}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              {t("aiDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-violet-100 pt-0">
            {aiSuggestions.map((ai) => {
              let parsed: Record<string, unknown> = {};
              try {
                parsed = JSON.parse(ai.outputContent);
              } catch {
                parsed = { reason: ai.outputContent };
              }
              return (
                <div key={ai.id} className="py-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {(parsed.filename as string) ?? t("evidenceDraft")}
                      </span>
                      {ai.confidence !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          {t("confidence", {
                            pct: Math.round(ai.confidence * 100),
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(parsed.reason as string) ?? ""}
                    </p>
                    {(parsed.accountName as string | undefined) && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t("relatedAccount", {
                          account: String(parsed.accountName),
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={async () => {
                        setAcceptingSuggestionId(ai.id);
                        try {
                          const r = await acceptEvidenceSuggestionAction(
                            ai.id,
                            engagementId,
                          );
                          if (r.evidence) {
                            setEvidence((prev) => [r.evidence!, ...prev]);
                            setAiSuggestions((prev) =>
                              prev.filter((a) => a.id !== ai.id),
                            );
                          }
                        } catch {
                        } finally {
                          setAcceptingSuggestionId(null);
                        }
                      }}
                      disabled={acceptingSuggestionId === ai.id}
                      title={t("acceptSuggestion")}
                    >
                      {acceptingSuggestionId === ai.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        setAiSuggestions((prev) =>
                          prev.filter((a) => a.id !== ai.id),
                        )
                      }
                      title={t("dismissSuggestion")}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[24px] border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>{t("evidenceItems")}</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder={t("searchByFilename")}
                className="w-56"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={stateFilter}
                onValueChange={(v) => {
                  if (v !== null) {
                    setStateFilter(v);
                  }
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("filterByState")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStates")}</SelectItem>
                  <SelectItem value="missing">{t("missingState")}</SelectItem>
                  <SelectItem value="requested">
                    {t("requestedState")}
                  </SelectItem>
                  <SelectItem value="uploaded">{t("uploadedState")}</SelectItem>
                  <SelectItem value="linked">{t("linkedState")}</SelectItem>
                  <SelectItem value="reviewed">{t("reviewedState")}</SelectItem>
                  <SelectItem value="accepted">{t("acceptedState")}</SelectItem>
                  <SelectItem value="rejected">{t("rejectedState")}</SelectItem>
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
                  <TableHead>{t("uploadedByCol")}</TableHead>
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
                        {evidence.length === 0
                          ? t("noEvidence")
                          : "لا توجد أدلة مطابقة للتصفية."}
                      </p>
                      {evidence.length === 0 && (
                        <Button
                          className="mt-3"
                          size="sm"
                          onClick={() => setShowRequest(true)}
                        >
                          <Upload className="size-4 me-1" />
                          {t("requestEvidence")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ev) => (
                    <TableRow
                      key={ev.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedEv(ev)}
                    >
                      <TableCell className="flex items-center gap-2">
                        {fileIcons[ev.fileType] || <File className="size-4" />}
                        <span className="font-medium">{ev.filename}</span>
                        {ev.state === "missing" && (
                          <Badge
                            variant="outline"
                            className="bg-red-600 text-white border-red-600 text-[10px]"
                          >
                            {t("missingState")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ev.fileType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{ev.uploadedBy || "-"}</TableCell>
                      <TableCell>
                        {ev.uploadedAt
                          ? new Date(ev.uploadedAt).toLocaleDateString(
                              "ar-SA",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${stateColors[ev.state] || ""} flex items-center gap-1 w-fit`}
                        >
                          {stateIcons[ev.state]}
                          {stateLabel[ev.state] || t("rejectedState")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <EvidenceStorageStatusBadge evidence={ev} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {ev.linkedEntities.map((le, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="mr-1 text-[10px]"
                          >
                            {le.targetLabel}
                          </Badge>
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
            <Button
              variant="outline"
              size="sm"
              disabled={loadingMore}
              onClick={async () => {
                setLoadingMore(true);
                try {
                  const nextPage = evPage + 1;
                  const r = await getEvidencePaginatedAction(
                    engagementId,
                    nextPage,
                    EVIDENCE_PAGE_SIZE,
                  );
                  setEvidence((prev) => [...prev, ...r.items]);
                  setEvPage(nextPage);
                  setEvHasMore(r.hasMore);
                } catch {
                } finally {
                  setLoadingMore(false);
                }
              }}
            >
              {loadingMore ? (
                <Loader2 className="size-4 me-1 animate-spin" />
              ) : (
                <RefreshCw className="size-4 me-1" />
              )}
              {t("loadMore", { remaining: evTotal - evidence.length })}
            </Button>
          </div>
        )}
      </Card>

      <Dialog
        open={showRequest}
        onOpenChange={(open) => {
          if (!open) {
            setShowRequest(false);
            setReqError(null);
          }
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
              value={reqFilename}
              onChange={(e) => setReqFilename(e.target.value)}
              placeholder={t("filenamePlaceholder")}
            />
            <Label>{t("fileTypeLabel")}</Label>
            <Select
              value={reqFileType}
              onValueChange={(v) => {
                if (v !== null) setReqFileType(v);
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
            {reqError && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                <AlertTriangle className="size-3 shrink-0" />
                {reqError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequest(false);
                setReqError(null);
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={!reqFilename.trim() || reqSubmitting}
              onClick={async () => {
                setReqSubmitting(true);
                setReqError(null);
                try {
                  const result = await createEvidenceAction({
                    engagementId,
                    filename: reqFilename.trim(),
                    fileType: reqFileType,
                    state: "missing",
                  });
                  if (result.evidence)
                    setEvidence((prev) => [result.evidence, ...prev]);
                  setShowRequest(false);
                  setReqFilename("");
                } catch (e: unknown) {
                  setReqError(
                    e instanceof Error ? e.message : t("requestFailed"),
                  );
                } finally {
                  setReqSubmitting(false);
                }
              }}
            >
              {reqSubmitting ? t("requesting") : t("requestEvidence")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("linkEvidence")}</DialogTitle>
            <DialogDescription>{t("linkDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("targetTypeLabel")}</Label>
              <Select
                value={linkTargetType}
                onValueChange={(v) => {
                  if (v !== null) {
                    setLinkTargetType(v);
                    setLinkTargetId("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finding">{t("finding")}</SelectItem>
                  <SelectItem value="statement">
                    {t("statementLabel")}
                  </SelectItem>
                  <SelectItem value="note">{t("note")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {linkTargetType === "finding" && findingsList.length > 0 && (
              <div>
                <Label>{t("selectFinding")}</Label>
                <Select
                  value={linkTargetId}
                  onValueChange={(v) => {
                    if (v !== null) setLinkTargetId(v);
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
            {linkTargetType !== "finding" && (
              <div>
                <Label>{t("targetIdLabel")}</Label>
                <Input
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  placeholder={t("targetIdPlaceholder")}
                />
              </div>
            )}
            {linkError && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                <AlertTriangle className="size-3 shrink-0" />
                {linkError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              {t("cancel")}
            </Button>
            <Button
              disabled={!linkTargetId || linkSubmitting}
              onClick={async () => {
                setLinkSubmitting(true);
                setLinkError(null);
                try {
                  await linkEvidenceToEntityAction({
                    engagementId,
                    evidenceId: selectedEv!.id,
                    targetType: linkTargetType,
                    targetId: linkTargetId,
                    context: "User linked",
                  });
                  const updated = await getEvidenceAction(engagementId);
                  setEvidence(updated);
                  if (selectedEv)
                    setSelectedEv(
                      updated.find((e) => e.id === selectedEv.id) ?? null,
                    );
                  setShowLinkDialog(false);
                } catch (e: unknown) {
                  setLinkError(
                    e instanceof Error ? e.message : t("updateFailed"),
                  );
                } finally {
                  setLinkSubmitting(false);
                }
              }}
            >
              {linkSubmitting ? t("linking") : t("link")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowRejectDialog(false);
            setRejectError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض الدليل</DialogTitle>
            <DialogDescription>
              سيتم تغيير حالة &ldquo;{selectedEv?.filename}&rdquo; إلى{" "}
              <strong>مرفوض</strong>. يُسجَّل الإجراء في سجل التدقيق. لا يُحذف
              الملف من التخزين تلقائياً — يمكن الرجوع للسجل عند الحاجة.
            </DialogDescription>
          </DialogHeader>
          {rejectError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
              <AlertTriangle className="size-3 shrink-0" />
              {rejectError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectError(null);
              }}
              disabled={rejecting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={rejecting || !selectedEv}
              onClick={async () => {
                if (!selectedEv) return;
                setRejecting(true);
                setRejectError(null);
                try {
                  const result = await updateEvidenceStateWithEventAction(
                    selectedEv.id,
                    "rejected",
                    engagementId,
                  );
                  if (result.evidence) {
                    setEvidence((prev) =>
                      prev.map((e) =>
                        e.id === selectedEv.id
                          ? { ...e, state: "rejected" }
                          : e,
                      ),
                    );
                    setSelectedEv({ ...selectedEv, state: "rejected" });
                  }
                  setShowRejectDialog(false);
                } catch (e: unknown) {
                  setRejectError(
                    e instanceof Error ? e.message : t("updateFailed"),
                  );
                } finally {
                  setRejecting(false);
                }
              }}
            >
              {rejecting ? "جارٍ الرفض..." : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedEv && (
        <div
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setSelectedEv(null)}
        >
          <div
            className="absolute start-0 top-0 bottom-0 w-96 bg-background shadow-xl border-r p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{t("evidenceDetails")}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEv(null)}
              >
                <XCircle className="size-4" />
              </Button>
            </div>
            <div className="space-y-4 text-sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={async () => {
                  try {
                    const trace = await getTraceabilityAction(
                      engagementId,
                      "evidence",
                      selectedEv.id,
                    );
                    setTraceEvData({
                      forward: trace.forwardTrace ?? [],
                      backward: trace.backwardTrace ?? [],
                    });
                  } catch {
                    setTraceEvData({ forward: [], backward: [] });
                  }
                  setTraceEvOpen(true);
                }}
              >
                <ExternalLink className="size-3 me-1" />
                {t("showTraceability")}
              </Button>
              <TraceabilityDrawer
                open={traceEvOpen}
                onClose={() => setTraceEvOpen(false)}
                entityType="evidence"
                entityId={selectedEv.id}
                entityLabel={selectedEv.filename}
                forwardTrace={traceEvData.forward}
                backwardTrace={traceEvData.backward}
              />
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  {t("filenameCol")}
                </div>
                <div className="font-medium flex items-center gap-2">
                  {fileIcons[selectedEv.fileType]}
                  {selectedEv.filename}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t("typeCol")}
                  </div>
                  <div>{selectedEv.fileType.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t("size")}
                  </div>
                  <div>
                    {selectedEv.fileSize > 0
                      ? t("kilobytes", {
                          size: (selectedEv.fileSize / 1024).toFixed(0),
                        })
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t("uploadedByCol")}
                  </div>
                  <div>{selectedEv.uploadedBy || "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t("uploadDateCol")}
                  </div>
                  <div>
                    {selectedEv.uploadedAt
                      ? new Date(selectedEv.uploadedAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  {t("fileHash")}
                </div>
                <div className="font-mono text-xs">
                  {selectedEv.fileHash || t("notAvailable")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  {t("stateCol")}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${stateColors[selectedEv.state]} flex items-center gap-1 w-fit`}
                  >
                    {stateIcons[selectedEv.state]}
                    {stateLabel[selectedEv.state] || t("rejectedState")}
                  </Badge>
                  <EvidenceStorageStatusBadge evidence={selectedEv} size="md" />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                  {t("linkedEntities")}
                </div>
                {selectedEv.linkedEntities.length > 0 ? (
                  selectedEv.linkedEntities.map((le, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1.5 border-b last:border-0"
                    >
                      <Badge variant="outline" className="text-[10px]">
                        {(le.linkType as string) === "finding"
                          ? t("entityFinding")
                          : le.linkType}
                      </Badge>
                      <span className="text-xs">{le.targetLabel}</span>
                      <Badge variant="outline" className="text-[10px] mr-auto">
                        {(le.targetType as string) === "finding"
                          ? t("entityFinding")
                          : (le.targetType as string) === "statement"
                            ? t("statementLabel")
                            : (le.targetType as string) === "note"
                              ? t("entityNote")
                              : le.targetType}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground italic">
                    {t("noLinkedEntities")}
                  </div>
                )}
              </div>
              {(selectedEv.state === "missing" ||
                selectedEv.state === "requested") && (
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={uploadingId === selectedEv.id}
                    onClick={() => {
                      setUploadTargetId(selectedEv.id);
                      fileInputRef.current?.click();
                    }}
                  >
                    {uploadingId === selectedEv.id ? (
                      <Loader2 className="size-4 me-1 animate-spin" />
                    ) : (
                      <Upload className="size-4 me-1" />
                    )}
                    {uploadingId === selectedEv.id
                      ? t("uploading")
                      : t("uploadFile")}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !uploadTargetId) return;
                      setUploadingId(uploadTargetId);
                      setActionError(null);
                      try {
                        const ext =
                          file.name.split(".").pop()?.toLowerCase() || "pdf";
                        const buf = await file.arrayBuffer();
                        const base64 = Buffer.from(buf).toString("base64");
                        const result = await uploadEvidenceFileAction({
                          engagementId,
                          filename: file.name,
                          fileType: ext,
                          fileData: base64,
                        });
                        const updated = await getEvidenceAction(engagementId);
                        setEvidence(updated);
                        if (result.evidence) setSelectedEv(result.evidence);
                      } catch (e: unknown) {
                        setActionError(
                          e instanceof Error ? e.message : t("uploadFailed"),
                        );
                      } finally {
                        setUploadingId(null);
                        setUploadTargetId(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }
                    }}
                  />
                </>
              )}
              {selectedEv.storageKey && selectedEv.fileHash && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={downloadingId === selectedEv.id}
                  onClick={async () => {
                    setDownloadingId(selectedEv.id);
                    setActionError(null);
                    try {
                      const info = await getEvidenceDownloadUrlAction(
                        selectedEv.id,
                        engagementId,
                      );
                      if (info) {
                        window.open(info.url, "_blank");
                      } else {
                        setActionError(
                          "الملف غير متوفر للتنزيل — قد يكون محذوفاً من التخزين أو لم يُرفع بعد.",
                        );
                      }
                    } catch (e: unknown) {
                      setActionError(
                        e instanceof Error ? e.message : t("downloadFailed"),
                      );
                    } finally {
                      setDownloadingId(null);
                    }
                  }}
                >
                  {downloadingId === selectedEv.id ? (
                    <Loader2 className="size-4 me-1 animate-spin" />
                  ) : (
                    <FileText className="size-4 me-1" />
                  )}
                  {downloadingId === selectedEv.id
                    ? "جارٍ التحقق..."
                    : t("download", {
                        hash: selectedEv.fileHash.substring(0, 8),
                      })}
                </Button>
              )}
              {!selectedEv.storageKey && (
                <p className="text-xs text-muted-foreground rounded-md border border-dashed p-2">
                  لم يُرفع ملف بعد — هذا سجل طلب دليل فقط.
                </p>
              )}
              {actionError && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                  <AlertTriangle className="size-3 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    setLinkTargetId("");
                    setLinkTargetType("finding");
                    setLinkError(null);
                    try {
                      const f = await getFindingsAction(engagementId);
                      setFindingsList(f);
                    } catch {}
                    setShowLinkDialog(true);
                  }}
                >
                  <Link className="size-4 me-1" />
                  {t("linkToFinding")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={
                    selectedEv.state === "accepted" ||
                    selectedEv.state === "rejected"
                  }
                  onClick={async () => {
                    setActionError(null);
                    try {
                      const result = await updateEvidenceStateWithEventAction(
                        selectedEv.id,
                        "accepted",
                        engagementId,
                      );
                      if (result.evidence) {
                        setEvidence((prev) =>
                          prev.map((e) =>
                            e.id === selectedEv.id
                              ? { ...e, state: "accepted" }
                              : e,
                          ),
                        );
                        setSelectedEv({ ...selectedEv, state: "accepted" });
                      }
                    } catch {
                      setActionError(t("verifyFailed"));
                    }
                  }}
                >
                  <CheckCircle className="size-4 me-1" />
                  {t("verify")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={
                    selectedEv.state === "accepted" ||
                    selectedEv.state === "rejected"
                  }
                  onClick={async () => {
                    setActionError(null);
                    try {
                      const result = await updateEvidenceStateWithEventAction(
                        selectedEv.id,
                        "reviewed",
                        engagementId,
                      );
                      if (result.evidence) {
                        setEvidence((prev) =>
                          prev.map((e) =>
                            e.id === selectedEv.id
                              ? { ...e, state: "reviewed" }
                              : e,
                          ),
                        );
                        setSelectedEv({ ...selectedEv, state: "reviewed" });
                      }
                    } catch {
                      setActionError(t("updateFailed"));
                    }
                  }}
                >
                  <Link className="size-4 me-1" />
                  {t("markReviewed")}
                </Button>
              </div>
              {selectedEv.state !== "rejected" &&
                selectedEv.state !== "accepted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => {
                      setRejectError(null);
                      setShowRejectDialog(true);
                    }}
                  >
                    <Trash2 className="size-4 me-1" />
                    رفض الدليل
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
