"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  WorkbookWithLines,
  MissingDataDetectionResult,
  DataRequestWithItems,
} from "@/lib/local-content/workbook/types";
import type { LcScoreResult } from "@/lib/local-content/workbook/types";
import {
  recalculateWorkbookAction,
  updateWorkbookLineAction,
  generateDataRequestAction,
  sendDataRequestAction,
  exportWorkbookAction,
  getDataRequestTextAction,
  markWorkbookExportedAction,
  computeWorkbookScoreAction,
  computeLcgpaWorkbookScoreAction,
} from "@/actions/localcontent-workbook-actions";
import {
  evaluateAllTabGates,
  buildGateContext,
} from "@/lib/local-content/workflow-gating";
import type { LcgpaScoreDisplayData } from "./components/lcgpa-score-card";

export interface WorkbookDetailState {
  editingLine: string | null;
  editValue: string;
  editNotes: string;
  actionMsg: string | null;
  isLoading: string | null;
  scoreResult: LcScoreResult | null;
  lcgpaResult: LcgpaScoreDisplayData | null;
  showScoreDetail: boolean;
  showLcgpaDetail: boolean;
  sections: Record<string, WorkbookWithLines["lines"]>;
  isEditable: boolean;
  canExport: boolean;
  canImportTb: boolean;
  canAccessMissing: boolean;
  canAccessRequests: boolean;
}

export interface WorkbookDetailActions {
  handleEdit: (lineId: string, currentValue: number | null) => void;
  handleSave: (lineId: string) => Promise<void>;
  handleRecalculate: () => Promise<void>;
  handleGenerateRequest: () => Promise<void>;
  handleSendRequest: (requestId: string) => Promise<void>;
  handleExport: () => Promise<void>;
  handleFinalizeExport: () => Promise<void>;
  handleComputeScore: () => Promise<void>;
  handleComputeLcgpaScore: () => Promise<void>;
  handleViewRequestText: (requestId: string) => Promise<void>;
  setEditingLine: (val: string | null) => void;
  setEditValue: (val: string) => void;
  setEditNotes: (val: string) => void;
  setShowScoreDetail: (val: boolean | ((prev: boolean) => boolean)) => void;
  setShowLcgpaDetail: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function useWorkbookDetail(
  workbook: WorkbookWithLines,
) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<LcScoreResult | null>(null);
  const [lcgpaResult, setLcgpaResult] = useState<LcgpaScoreDisplayData | null>(null);
  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [showLcgpaDetail, setShowLcgpaDetail] = useState(false);

  const showAction = useCallback((msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  }, []);

  const sections = workbook.lines.reduce(
    (acc, line) => {
      if (!acc[line.section]) acc[line.section] = [];
      acc[line.section].push(line);
      return acc;
    },
    {} as Record<string, typeof workbook.lines>,
  );

  const gateCtx = buildGateContext(workbook);
  const gates = evaluateAllTabGates(gateCtx);
  const isEditable = !(gates["manual-edit"]?.locked ?? true);
  const canExport = !(gates["export"]?.locked ?? true);
  const canImportTb = !(gates["tb-import"]?.locked ?? true);
  const canAccessMissing = !(gates["missing"]?.locked ?? true);
  const canAccessRequests = !(gates["requests"]?.locked ?? true);

  const handleEdit = useCallback(
    (lineId: string, currentValue: number | null) => {
      setEditingLine(lineId);
      setEditValue(currentValue?.toString() ?? "");
      setEditNotes("");
    },
    [],
  );

  const handleSave = useCallback(
    async (lineId: string) => {
      setIsLoading(lineId);
      const val = parseFloat(editValue);
      if (isNaN(val)) {
        showAction("الرجاء إدخال قيمة رقمية صالحة");
        setIsLoading(null);
        return;
      }
      const res = await updateWorkbookLineAction(lineId, val, editNotes || undefined);
      if (res.ok) {
        showAction("تم حفظ القيمة ✅");
        setEditingLine(null);
        await recalculateWorkbookAction(workbook.id);
        router.refresh();
      } else {
        showAction(`خطأ: ${res.error}`);
      }
      setIsLoading(null);
    },
    [editValue, editNotes, workbook.id, router, showAction],
  );

  const handleRecalculate = useCallback(async () => {
    setIsLoading("recalc");
    const res = await recalculateWorkbookAction(workbook.id);
    if (res.ok) {
      showAction("تم إعادة احتساب الإحصائيات ✅");
      router.refresh();
    }
    setIsLoading(null);
  }, [workbook.id, router, showAction]);

  const handleGenerateRequest = useCallback(async () => {
    setIsLoading("gen-request");
    const res = await generateDataRequestAction(workbook.id);
    if (res.ok) {
      showAction("تم إنشاء طلب البيانات ✅");
      router.refresh();
    } else {
      showAction(`خطأ: ${res.error}`);
    }
    setIsLoading(null);
  }, [workbook.id, router, showAction]);

  const handleSendRequest = useCallback(async (requestId: string) => {
    setIsLoading(`send-${requestId}`);
    const res = await sendDataRequestAction(requestId);
    if (res.ok) {
      showAction("تم إرسال الطلب ✅");
      router.refresh();
    }
    setIsLoading(null);
  }, [router, showAction]);

  const handleExport = useCallback(async () => {
    setIsLoading("export");
    const res = await exportWorkbookAction(workbook.id);
    if (!res.ok) {
      showAction(`خطأ: ${res.error}`);
    } else if (res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `workbook-${workbook.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showAction("تم التصدير ✅");
    }
    setIsLoading(null);
  }, [workbook.id, showAction]);

  const handleFinalizeExport = useCallback(async () => {
    setIsLoading("finalize");
    const res = await markWorkbookExportedAction(workbook.id);
    if (res.ok) {
      showAction("تم إنهاء الدفتر وتأكيد التصدير ✅");
      router.refresh();
    } else {
      showAction(`خطأ: ${res.error}`);
    }
    setIsLoading(null);
  }, [workbook.id, router, showAction]);

  const handleComputeScore = useCallback(async () => {
    setIsLoading("score");
    const res = await computeWorkbookScoreAction(workbook.id);
    if (!res.ok) {
      showAction(`خطأ: ${res.error}`);
    } else if (res.data) {
      setScoreResult(res.data as LcScoreResult);
      setShowScoreDetail(true);
    }
    setIsLoading(null);
  }, [workbook.id, showAction]);

  const handleComputeLcgpaScore = useCallback(async () => {
    setIsLoading("lcgpa-score");
    const res = await computeLcgpaWorkbookScoreAction(workbook.id);
    if (!res.ok) {
      showAction(`خطأ: ${res.error}`);
    } else if (res.data) {
      setLcgpaResult(res.data as LcgpaScoreDisplayData);
      setShowLcgpaDetail(true);
      if (res.data.recordable) {
        showAction("تم احتساب نتيجة LCGPA وربطها بالإصدار التنظيمي ✅");
      } else {
        showAction("تم الاحتساب — النتيجة غير قابلة للتسجيل (لا يوجد إصدار تنظيمي مرتبط)");
      }
    }
    setIsLoading(null);
  }, [workbook.id, showAction]);

  const handleViewRequestText = useCallback(async (requestId: string) => {
    const res = await getDataRequestTextAction(requestId);
    if (res.ok && res.data) {
      const blob = new Blob([res.data], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `data-request-${requestId.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const state: WorkbookDetailState = {
    editingLine,
    editValue,
    editNotes,
    actionMsg,
    isLoading,
    scoreResult,
    lcgpaResult,
    showScoreDetail,
    showLcgpaDetail,
    sections,
    isEditable,
    canExport,
    canImportTb,
    canAccessMissing,
    canAccessRequests,
  };

  const actions: WorkbookDetailActions = {
    handleEdit,
    handleSave,
    handleRecalculate,
    handleGenerateRequest,
    handleSendRequest,
    handleExport,
    handleFinalizeExport,
    handleComputeScore,
    handleComputeLcgpaScore,
    handleViewRequestText,
    setEditingLine,
    setEditValue,
    setEditNotes,
    setShowScoreDetail,
    setShowLcgpaDetail,
  };

  return { state, actions };
}
