"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getEngagementAction,
} from "@/actions/audit-read-actions";
import {
  createPilotFeedbackAction,
  updatePilotFeedbackStatusAction,
  getPilotFeedbackAction,
  updateProductionBlockerStatusAction,
  getProductionBlockersAction,
  createOrUpdatePilotSignoffAction,
  getPilotSignoffChecklistAction,
} from "@/actions/audit-actions";
import type {
  Engagement,
  PilotFeedback,
  ProductionBlocker,
  PilotSignoff,
} from "@/types/audit";

export const signoffItems = [
  "تم العرض الداخلي",
  "تم العرض التجريبي مع العميل",
  "تم الإقرار بالحدود",
  "تم اعتماد نطاق التجربة",
  "تم اعتماد بيانات التجربة",
  "تم تعيين مستخدمي التجربة",
  "تم اعتماد بدء التجربة",
];

export function usePilotPage() {
  const t = useTranslations("audit.pilot");
  const params = useParams();
  const engagementId = params.engagementId as string;

  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<PilotFeedback[]>([]);
  const [blockers, setBlockers] = useState<ProductionBlocker[]>([]);
  const [signoffs, setSignoffs] = useState<PilotSignoff[]>([]);

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    description: "",
    source: "",
    category: "سير العمل",
    severity: "medium",
  });
  const [fbExpanded, setFbExpanded] = useState<string | null>(null);
  const [fbFilterCat, setFbFilterCat] = useState("all");
  const [fbFilterStatus, setFbFilterStatus] = useState("all");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [blockerExpanded, setBlockerExpanded] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [eng, fb, bl, si] = await Promise.all([
      getEngagementAction(engagementId),
      getPilotFeedbackAction(engagementId),
      getProductionBlockersAction(engagementId),
      getPilotSignoffChecklistAction(engagementId),
    ]);
    setEngagement(eng);
    setFeedback(fb);
    setBlockers(bl);
    setSignoffs(si);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateFeedback = async () => {
    if (!newFeedback.title.trim()) return;
    setFbSubmitting(true);
    try {
      const result = await createPilotFeedbackAction({
        engagementId,
        ...newFeedback,
      });
      setFeedback((prev) => [result, ...prev]);
      setShowFeedbackDialog(false);
      setNewFeedback({
        title: "",
        description: "",
        source: "",
        category: "سير العمل",
        severity: "medium",
      });
    } catch {
    } finally {
      setFbSubmitting(false);
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    await updatePilotFeedbackStatusAction(id, engagementId, status);
    setFeedback((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f)),
    );
  };

  const handleUpdateBlockerStatus = async (id: string, status: string) => {
    await updateProductionBlockerStatusAction(id, engagementId, status);
    setBlockers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  const handleToggleSignoff = async (item: string) => {
    const current = signoffs.find((s) => s.checklistItem === item);
    const newStatus = current?.status === "approved" ? "pending" : "approved";
    const result = await createOrUpdatePilotSignoffAction({
      engagementId,
      checklistItem: item,
      status: newStatus,
    });
    setSignoffs((prev) =>
      prev.filter((s) => s.checklistItem !== item).concat(result),
    );
  };

  const allApproved = signoffItems.every(
    (item) =>
      signoffs.find((s) => s.checklistItem === item)?.status === "approved",
  );
  const openFeedbacks = feedback.filter((f) => f.status === "open").length;
  const openBlockers = blockers.filter((b) => b.status === "open").length;

  return {
    t,
    engagement,
    loading,
    feedback,
    blockers,
    signoffs,
    showFeedbackDialog,
    setShowFeedbackDialog,
    newFeedback,
    setNewFeedback,
    fbExpanded,
    setFbExpanded,
    fbFilterCat,
    setFbFilterCat,
    fbFilterStatus,
    setFbFilterStatus,
    fbSubmitting,
    blockerExpanded,
    setBlockerExpanded,
    allApproved,
    openFeedbacks,
    openBlockers,
    handleCreateFeedback,
    handleUpdateFeedbackStatus,
    handleUpdateBlockerStatus,
    handleToggleSignoff,
  } as const;
}
