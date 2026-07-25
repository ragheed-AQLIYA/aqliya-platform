"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchTaskDetailAction,
  updateOfficeAiTaskAction,
  addOfficeAiFileAction,
  removeOfficeAiFileAction,
  generateOfficeAiOutputAction,
  updateOfficeAiOutputAction,
  submitOfficeAiTaskForReviewAction,
  approveOfficeAiTaskAction,
  rejectOfficeAiTaskAction,
  archiveOfficeAiTaskAction,
  reExtractFileAction,
} from "@/actions/office-ai-actions";
import type { TaskDetail } from "@/actions/office-ai-workspace-actions";
import { STATUS_STEPS } from "./constants";

export function useTaskDetail(taskId: string) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskDetailAction(taskId);
      if (!data) {
        setError("Task not found");
        setTask(null);
        return;
      }
      setTask(data.task);
      setWorkspaceName(data.workspaceName);
      setProjectName(data.projectName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { refresh(); }, [refresh]);

  const currentStepIndex = task ? STATUS_STEPS.indexOf(task.status) : -1;
  const canGenerate = !!(
    task?.status === "draft" ||
    task?.status === "generated" ||
    task?.status === "rejected"
  );
  const canReview = !!(
    task?.status === "generated" || task?.status === "needs_review"
  );
  const hasFiles = (task?.sourceFiles?.length ?? 0) > 0;
  const isArchived = task?.status === "archived";

  const handleUpdateTask = useCallback(async (formData: FormData) => {
    if (!task) return;
    try {
      await updateOfficeAiTaskAction(task.id, formData);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }, [task, refresh]);

  const handleAddFile = useCallback(async (formData: FormData) => {
    if (!task) return;
    try {
      await addOfficeAiFileAction(task.id, formData);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }, [task, refresh]);

  const handleRemoveFile = useCallback(async (fileId: string) => {
    try {
      await removeOfficeAiFileAction(fileId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }, [refresh]);

  const handleGenerate = useCallback(async () => {
    if (!task) return;
    try {
      await generateOfficeAiOutputAction(task.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  }, [task, refresh]);

  const handleUpdateOutput = useCallback(async (outputId: string, formData: FormData) => {
    try {
      await updateOfficeAiOutputAction(outputId, formData);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }, [refresh]);

  const handleSubmitForReview = useCallback(async () => {
    if (!task) return;
    try {
      await submitOfficeAiTaskForReviewAction(task.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }, [task, refresh]);

  const handleApprove = useCallback(async () => {
    if (!task) return;
    try {
      await approveOfficeAiTaskAction(task.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }, [task, refresh]);

  const handleReject = useCallback(async () => {
    if (!task) return;
    try {
      await rejectOfficeAiTaskAction(task.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }, [task, refresh]);

  const handleArchive = useCallback(async () => {
    if (!task) return;
    try {
      await archiveOfficeAiTaskAction(task.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed");
    }
  }, [task, refresh]);

  const handleReExtract = useCallback(async (fileId: string) => {
    try {
      await reExtractFileAction(fileId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Re-extract failed");
    }
  }, [refresh]);

  return {
    task,
    workspaceName,
    projectName,
    loading,
    error,
    currentStepIndex,
    canGenerate,
    canReview,
    hasFiles,
    isArchived,
    refresh,
    handleUpdateTask,
    handleAddFile,
    handleRemoveFile,
    handleGenerate,
    handleUpdateOutput,
    handleSubmitForReview,
    handleApprove,
    handleReject,
    handleArchive,
    handleReExtract,
  };
}
