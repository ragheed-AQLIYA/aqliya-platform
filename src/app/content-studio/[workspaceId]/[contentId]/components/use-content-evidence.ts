"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getContentEvidenceAction,
  uploadContentEvidenceAction,
  deleteContentEvidenceAction,
  updateContentEvidenceDescriptionAction,
} from "@/actions/content-evidence-actions";

export type ContentEvidence = {
  id: string;
  contentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  storageKey: string | null;
  uploadedById: string | null;
  description: string | null;
  evidenceType: string;
  createdAt: Date;
};

export function useContentEvidence(contentId: string) {
  const [evidence, setEvidence] = useState<ContentEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingDescription, setEditingDescription] = useState<string | null>(null);
  const [editDescriptionValue, setEditDescriptionValue] = useState("");

  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getContentEvidenceAction(contentId);
    if (result.ok) {
      setEvidence(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [contentId]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  async function handleUpload(file: File, description: string, evidenceType: string) {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const result = await uploadContentEvidenceAction({
        contentId,
        filename: file.name,
        fileType: fileExt,
        fileData: base64,
        description: description || undefined,
        evidenceType: evidenceType || undefined,
      });
      setUploading(false);
      if (result.ok) {
        setShowUpload(false);
        await loadEvidence();
      } else {
        setError(result.error);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleDelete(evidenceId: string) {
    const result = await deleteContentEvidenceAction(evidenceId);
    if (result.ok) {
      await loadEvidence();
    } else {
      setError(result.error);
    }
  }

  function handleStartEdit(item: ContentEvidence) {
    setEditingDescription(item.id);
    setEditDescriptionValue(item.description ?? "");
  }

  async function handleSaveEdit(evidenceId: string) {
    const result = await updateContentEvidenceDescriptionAction(
      evidenceId,
      editDescriptionValue,
    );
    if (result.ok) {
      setEditingDescription(null);
      await loadEvidence();
    } else {
      setError(result.error);
    }
  }

  function handleCancelEdit() {
    setEditingDescription(null);
  }

  function handleEditChange(value: string) {
    setEditDescriptionValue(value);
  }

  return {
    evidence,
    loading,
    error,
    showUpload,
    uploading,
    editingDescription,
    editDescriptionValue,
    setShowUpload,
    handleUpload,
    handleDelete,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleEditChange,
  };
}
